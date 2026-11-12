import type { ChoiceQuestion, OrderQuestion, Question, TapQuestion } from "../quiz/types";
import type { Topic } from "../topics/types";
import { QUESTIONS_PER_ROUND, pick, pickOne, shuffle, shuffleOptions, starsFor, tapsOnBeat } from "../quiz/engine";
import { audioTime, click, playCorrect, playWrong, stopAll } from "../music/audio";
import { saveStars } from "../progress";
import { sv } from "../i18n/sv";
import { h, rich, starsText, svg } from "./dom";

/** Prepare a round: pick questions and shuffle each one's answers. */
function prepare(topic: Topic): Question[] {
  const rng = Math.random;
  return pick(topic.makeQuestions(rng), QUESTIONS_PER_ROUND, rng).map((q) =>
    q.kind === "choice" && !q.fixedOrder ? { ...q, ...shuffleOptions(q.options, q.correct, rng) } : q,
  );
}

/**
 * One round of a mini-game. Renders into `root` and replaces its content as
 * the player goes; ends with the result screen.
 */
export function quizScreen(topic: Topic): HTMLElement {
  const root = h("main", { class: "screen quiz", style: { "--island": topic.color } });
  const questions = prepare(topic);
  let index = 0;
  let score = 0;

  const show = () => {
    stopAll();
    root.replaceChildren(index < questions.length ? questionView() : resultView());
    window.scrollTo({ top: 0 });
  };

  function header(): HTMLElement {
    return h(
      "header",
      { class: "quiz-header" },
      h("a", { class: "back", href: `#/o/${topic.id}`, "aria-label": sv.backToMap }, "✕"),
      h("span", { class: "quiz-title" }, `${topic.emoji} ${topic.title}`),
      h("span", { class: "quiz-count" }, sv.question(index + 1, questions.length)),
      h(
        "div",
        { class: "progress", role: "progressbar", "aria-valuenow": String(index), "aria-valuemax": String(questions.length) },
        h("div", { class: "progress-fill", style: { width: `${(index / questions.length) * 100}%` } }),
      ),
    );
  }

  /** Feedback after an answer, with the "next" button. */
  function feedback(container: HTMLElement, right: boolean, q: Question, rightAnswer?: string) {
    if (right) {
      score++;
      playCorrect();
    } else {
      playWrong();
    }
    const last = index === questions.length - 1;
    const next = h(
      "button",
      {
        class: "next-button",
        onClick: () => {
          index++;
          show();
        },
      },
      last ? sv.seeResult : sv.next,
    );
    container.append(
      h(
        "div",
        { class: `feedback ${right ? "good" : "bad"}`, role: "status" },
        h("p", { class: "feedback-title" }, right ? pickOne(sv.correct, Math.random) : sv.wrong),
        !right && rightAnswer ? h("p", {}, sv.rightAnswer(rightAnswer)) : null,
        q.explain ? rich(q.explain, "p", "explain") : null,
        next,
      ),
    );
    next.focus({ preventScroll: true });
    next.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function questionView(): HTMLElement {
    const q = questions[index];
    const body = h(
      "section",
      { class: "question" },
      h("h1", { class: "prompt" }, q.prompt),
      q.visual ? svg(q.visual, "visual question-visual") : null,
      q.sound ? h("button", { class: "listen big", onClick: q.sound }, sv.listen) : null,
    );
    if (q.kind === "choice") body.append(choice(q, body));
    if (q.kind === "order") body.append(order(q, body));
    if (q.kind === "tap") body.append(tap(q, body));
    // Play the question's sound once at the start (the player has just tapped).
    if (q.sound) setTimeout(q.sound, 250);
    return h("div", {}, header(), body);
  }

  function choice(q: ChoiceQuestion, container: HTMLElement): HTMLElement {
    const withPictures = q.options.some((o) => o.svg);
    const buttons = q.options.map((o, i) =>
      h(
        "button",
        {
          class: `answer${withPictures ? " picture" : ""}`,
          onClick: () => {
            buttons.forEach((b) => (b.disabled = true));
            buttons[q.correct].classList.add("right");
            const right = i === q.correct;
            if (!right) buttons[i].classList.add("wrong");
            const answer = q.options[q.correct];
            feedback(container, right, q, answer.label || undefined);
          },
        },
        o.svg ? svg(o.svg, "answer-svg") : null,
        o.label ? h("span", {}, o.label) : null,
      ),
    );
    return h("div", { class: `answers${withPictures ? " pictures" : ""}` }, ...buttons);
  }

  function order(q: OrderQuestion, container: HTMLElement): HTMLElement {
    const chosen: number[] = [];
    const tiles = shuffle(
      q.items.map((item, i) => ({ item, i })),
      Math.random,
    );
    const slots = h("div", { class: "order-slots" });
    const pool = h("div", { class: "order-pool" });
    const undo = h("button", { class: "link", onClick: () => reset() }, sv.orderUndo);

    const renderSlots = () => {
      slots.replaceChildren(
        ...q.items.map((_, n) => {
          const picked = chosen[n];
          const item = picked === undefined ? null : q.items[picked];
          return h("div", { class: `slot${item ? " filled" : ""}` }, item?.svg ? svg(item.svg, "answer-svg") : item?.label ?? String(n + 1));
        }),
      );
    };
    const buttons = tiles.map(({ item, i }) =>
      h(
        "button",
        {
          class: "tile",
          onClick: (e: Event) => {
            (e.currentTarget as HTMLButtonElement).disabled = true;
            chosen.push(i);
            renderSlots();
            if (chosen.length === q.items.length) check();
          },
        },
        item.svg ? svg(item.svg, "answer-svg") : h("span", {}, item.label),
      ),
    );
    const reset = () => {
      chosen.length = 0;
      buttons.forEach((b) => (b.disabled = false));
      renderSlots();
    };
    const check = () => {
      undo.remove();
      const right = chosen.every((c, n) => c === n);
      slots.classList.add(right ? "right" : "wrong");
      feedback(container, right, q, right ? undefined : q.items.map((i) => i.label).join(" – "));
    };
    pool.append(...buttons);
    renderSlots();
    return h("div", { class: "order" }, h("p", { class: "hint" }, sv.orderHint), slots, pool, undo);
  }

  function tap(q: TapQuestion, container: HTMLElement): HTMLElement {
    const beat = 60 / q.bpm;
    const status = h("p", { class: "hint" }, sv.tapGetReady);
    const taps: number[] = [];
    let firstBeat = 0;
    let listening = false;
    const pad = h(
      "button",
      {
        class: "tap-pad",
        disabled: true,
        onPointerdown: (e: Event) => {
          e.preventDefault();
          if (!listening) return;
          taps.push(audioTime());
          pad.classList.remove("pulse");
          void pad.offsetWidth; // restart the animation
          pad.classList.add("pulse");
        },
      },
      sv.tapButton,
    );
    const start = h(
      "button",
      {
        class: "next-button",
        onClick: () => {
          start.remove();
          pad.disabled = false;
          // Four count-in clicks, then clicks for the beats to tap along with.
          const t0 = audioTime() + 0.1;
          for (let i = 0; i < 4 + q.beats; i++) click(i % 4 === 0, 0.1 + i * beat);
          firstBeat = t0 + 4 * beat;
          setTimeout(() => {
            listening = true;
            status.textContent = sv.tapNow;
          }, (0.1 + 3.5 * beat) * 1000);
          setTimeout(() => {
            listening = false;
            pad.disabled = true;
            const hits = Math.min(q.beats, tapsOnBeat(taps, firstBeat, beat));
            status.textContent = sv.tapResult(hits, q.beats);
            feedback(container, hits >= q.beats - 2, q);
          }, (0.1 + (4 + q.beats) * beat + 0.4) * 1000);
        },
      },
      sv.tapStart,
    );
    return h("div", { class: "tap" }, status, pad, start);
  }

  function resultView(): HTMLElement {
    const stars = starsFor(score, questions.length);
    const record = saveStars(topic.id, stars);
    if (stars > 0) playCorrect();
    return h(
      "section",
      { class: "result" },
      h("div", { class: "result-stars", "aria-label": `${stars} av 3 stjärnor` }, starsText(stars)),
      h("h1", {}, sv.resultTitle(stars)),
      h("p", { class: "result-score" }, sv.resultScore(score, questions.length)),
      record ? h("p", { class: "record" }, sv.newRecord) : null,
      h(
        "div",
        { class: "result-actions" },
        h(
          "button",
          {
            class: "play-button",
            onClick: () => {
              questions.splice(0, questions.length, ...prepare(topic));
              index = 0;
              score = 0;
              show();
            },
          },
          `↻ ${sv.playAgain}`,
        ),
        h("a", { class: "secondary-button", href: `#/o/${topic.id}` }, `📖 ${sv.readAgain}`),
        h("a", { class: "secondary-button", href: "#/" }, `🗺️ ${sv.backToMap}`),
      ),
    );
  }

  show();
  return root;
}

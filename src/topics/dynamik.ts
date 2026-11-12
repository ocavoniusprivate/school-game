import type { Topic } from "./types";
import type { Question } from "../quiz/types";
import { pick, pickOne } from "../quiz/engine";
import { DYNAMICS, type DynamicMark } from "../music/theory";
import { playMidi } from "../music/audio";
import { dynamicSvg, hairpinSvg } from "../music/staff";

export const DYNAMIC_INFO: Record<DynamicMark, { word: string; meaning: string }> = {
  pp: { word: "pianissimo", meaning: "mycket svagt" },
  p: { word: "piano", meaning: "svagt" },
  mp: { word: "mezzopiano", meaning: "ganska svagt" },
  mf: { word: "mezzoforte", meaning: "ganska starkt" },
  f: { word: "forte", meaning: "starkt" },
  ff: { word: "fortissimo", meaning: "mycket starkt" },
};

const volumeOf = (mark: DynamicMark) => DYNAMICS.find((d) => d.mark === mark)!.volume;

/** A short phrase played at a given loudness. */
function playAt(mark: DynamicMark, delay = 0) {
  [64, 67, 72].forEach((m, i) => playMidi(m, { volume: volumeOf(mark), duration: 0.35, delay: delay + i * 0.3 }));
}

const MARKS = DYNAMICS.map((d) => d.mark);

function markToMeaning(mark: DynamicMark, rng: () => number): Question {
  const others = pick(
    MARKS.filter((m) => m !== mark),
    3,
    rng,
  );
  return {
    kind: "choice",
    prompt: "Vad betyder tecknet?",
    visual: dynamicSvg(mark),
    sound: () => playAt(mark),
    options: [mark, ...others].map((m) => ({ label: DYNAMIC_INFO[m].meaning })),
    correct: 0,
    explain: `${mark} = ${DYNAMIC_INFO[mark].word} = ${DYNAMIC_INFO[mark].meaning}.`,
  };
}

function meaningToMark(mark: DynamicMark, rng: () => number): Question {
  const others = pick(
    MARKS.filter((m) => m !== mark),
    3,
    rng,
  );
  return {
    kind: "choice",
    prompt: `Vilket tecken betyder ”${DYNAMIC_INFO[mark].meaning}”?`,
    options: [mark, ...others].map((m) => ({ label: "", svg: dynamicSvg(m) })),
    correct: 0,
    explain: `${DYNAMIC_INFO[mark].meaning} = ${mark} (${DYNAMIC_INFO[mark].word}).`,
  };
}

/** Two phrases, one clearly louder; which one? */
function louderByEar(rng: () => number): Question {
  const [soft, loud] = pickOne(
    [
      ["pp", "f"],
      ["p", "ff"],
      ["pp", "mf"],
      ["p", "f"],
    ] as [DynamicMark, DynamicMark][],
    rng,
  );
  const loudFirst = rng() < 0.5;
  return {
    kind: "choice",
    prompt: "Lyssna! Vilken gång spelades det starkast?",
    sound: () => {
      playAt(loudFirst ? loud : soft);
      playAt(loudFirst ? soft : loud, 1.3);
    },
    options: [{ label: "Första gången" }, { label: "Andra gången" }],
    correct: loudFirst ? 0 : 1,
    fixedOrder: true,
    explain: `${loudFirst ? "Första" : "Andra"} gången var ${loud} (${DYNAMIC_INFO[loud].meaning}), den andra ${soft} (${DYNAMIC_INFO[soft].meaning}).`,
  };
}

function orderSoftToLoud(rng: () => number): Question {
  const chosen = pick(MARKS, 4, rng).sort((a, b) => MARKS.indexOf(a) - MARKS.indexOf(b));
  return {
    kind: "order",
    prompt: "Sätt tecknen i ordning – från svagast till starkast!",
    items: chosen.map((m) => ({ label: m, svg: dynamicSvg(m) })),
    explain: "Hela ordningen: pp – p – mp – mf – f – ff.",
  };
}

const facts: Question[] = [
  {
    kind: "choice",
    prompt: "Vad betyder tecknet?",
    visual: hairpinSvg("cresc"),
    options: [{ label: "Crescendo – gradvis starkare" }, { label: "Diminuendo – gradvis svagare" }, { label: "Snabbare" }, { label: "Paus" }],
    correct: 0,
    explain: "Den öppnar sig som en mun som skriker allt högre: crescendo = gradvis starkare.",
  },
  {
    kind: "choice",
    prompt: "Vad betyder tecknet?",
    visual: hairpinSvg("dim"),
    options: [{ label: "Diminuendo – gradvis svagare" }, { label: "Crescendo – gradvis starkare" }, { label: "Långsammare" }, { label: "Upprepa" }],
    correct: 0,
    explain: "Den stänger sig: diminuendo (eller decrescendo) = gradvis svagare.",
  },
  {
    kind: "choice",
    prompt: "Vad är dynamik i musik?",
    options: [
      { label: "Hur starkt eller svagt man spelar" },
      { label: "Hur snabbt man spelar" },
      { label: "Hur högt eller lågt tonerna låter" },
      { label: "Hur långa noterna är" },
    ],
    correct: 0,
    explain: "Dynamik = ljudstyrka: starkt och svagt. Snabbt/långsamt kallas tempo.",
  },
  {
    kind: "choice",
    prompt: "Vilket är starkast?",
    options: [{ label: "", svg: dynamicSvg("mf") }, { label: "", svg: dynamicSvg("mp") }],
    correct: 0,
    explain: "mezzoforte (mf) = ganska starkt är starkare än mezzopiano (mp) = ganska svagt.",
  },
  {
    kind: "choice",
    prompt: "Vad betyder ”piano” som dynamiktecken?",
    visual: dynamicSvg("p"),
    options: [{ label: "Svagt" }, { label: "Starkt" }, { label: "Spela piano" }, { label: "Långsamt" }],
    correct: 0,
    explain: "piano (p) är italienska för svagt. Instrumentet piano har fått namnet för att det kan spela både svagt och starkt!",
  },
];

export const dynamik: Topic = {
  id: "dynamik",
  title: "Dynamik",
  emoji: "📢",
  color: "#e0457b",
  tagline: "Starkt och svagt",
  ready: true,
  learn: [
    { kind: "text", text: "**Dynamik** handlar om **ljudstyrka** – hur **starkt** eller **svagt** man spelar. Tecknen är förkortningar av italienska ord." },
    {
      kind: "table",
      rows: MARKS.map((m) => ({
        svg: dynamicSvg(m),
        label: DYNAMIC_INFO[m].word,
        detail: DYNAMIC_INFO[m].meaning,
        play: () => playAt(m),
      })),
    },
    { kind: "tip", text: "**p** = piano = svagt, **f** = forte = starkt. **m** (mezzo) betyder ”ganska”. Två bokstäver = ”mycket”." },
    { kind: "visual", svg: hairpinSvg("cresc"), caption: "**Crescendo**: gradvis starkare." },
    { kind: "visual", svg: hairpinSvg("dim"), caption: "**Diminuendo** (decrescendo): gradvis svagare." },
  ],
  makeQuestions: (rng) => [
    ...pick(MARKS, 2, rng).map((m) => markToMeaning(m, rng)),
    ...pick(MARKS, 2, rng).map((m) => meaningToMark(m, rng)),
    louderByEar(rng),
    louderByEar(rng),
    orderSoftToLoud(rng),
    ...facts,
  ],
};

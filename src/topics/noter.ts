import type { Topic } from "./types";
import type { ChoiceQuestion, Question } from "../quiz/types";
import { pick, pickOne } from "../quiz/engine";
import { LETTERS, stepToLetter, stepToMidi } from "../music/theory";
import { playMelody, playMidi } from "../music/audio";
import { staffSvg } from "../music/staff";

const SCALE = [-2, -1, 0, 1, 2, 3, 4, 5]; // C D E F G A H C

const noteStaff = (step: number) => staffSvg({ items: [{ kind: "note", step }], width: 140 });

function nameTheNote(step: number, rng: () => number): ChoiceQuestion {
  const right = stepToLetter(step);
  const wrong = pick(
    LETTERS.filter((l) => l !== right),
    3,
    rng,
  );
  return {
    kind: "choice",
    prompt: "Vad heter noten?",
    visual: noteStaff(step),
    sound: () => playMidi(stepToMidi(step)),
    options: [right, ...wrong].map((label) => ({ label })),
    correct: 0,
    explain: `Noten är ett ${right}. ${lineOrSpace(step)}`,
  };
}

function lineOrSpace(step: number): string {
  if (step === -2) return "Den står på en hjälplinje under notsystemet – det är mitt-C.";
  if (step === -1) return "Den hänger precis under den nedersta linjen.";
  if (step === 9) return "Den sitter precis ovanför den översta linjen.";
  return step % 2 === 0 ? "Den står på en linje." : "Den står i ett mellanrum.";
}

function findTheNote(rng: () => number): ChoiceQuestion {
  const all = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8];
  const targetStep = pickOne(all, rng);
  const target = stepToLetter(targetStep);
  // Three other notes, all with different names (no low E next to a high E).
  const others: number[] = [];
  for (const s of pick(all, all.length, rng)) {
    const letter = stepToLetter(s);
    if (letter !== target && !others.some((o) => stepToLetter(o) === letter)) others.push(s);
    if (others.length === 3) break;
  }
  return {
    kind: "choice",
    prompt: `Vilken not är ett ${target}?`,
    options: [targetStep, ...others].map((s) => ({ label: "", svg: noteStaff(s) })),
    correct: 0,
    explain: `${target} sitter så här i notsystemet. Kom ihåg linjerna E – G – H – D – F.`,
  };
}

const facts: Question[] = [
  {
    kind: "choice",
    prompt: "Vad heter tonen som kommer efter A på svenska?",
    options: [{ label: "H" }, { label: "B" }, { label: "C" }, { label: "G" }],
    correct: 0,
    explain: "På svenska heter tonerna C D E F G A H. Det som heter B på engelska heter H hos oss.",
  },
  {
    kind: "choice",
    prompt: "Hur många olika tonnamn finns det innan de börjar om?",
    options: [{ label: "7" }, { label: "8" }, { label: "5" }, { label: "12" }],
    correct: 0,
    explain: "C D E F G A H – sju namn. Sedan kommer C igen, fast ljusare.",
  },
  {
    kind: "choice",
    prompt: "Ju högre upp en not sitter i notsystemet…",
    options: [{ label: "…desto ljusare ton" }, { label: "…desto mörkare ton" }, { label: "…desto längre ton" }, { label: "…desto starkare ton" }],
    correct: 0,
    explain: "Högre upp = ljusare (högre) ton. Längre ner = mörkare (lägre) ton.",
  },
  {
    kind: "choice",
    prompt: "Vilken ton står på mittlinjen (i G-klav)?",
    visual: staffSvg({ items: [{ kind: "note", step: 4, highlight: true }], width: 140 }),
    options: [{ label: "H" }, { label: "G" }, { label: "C" }, { label: "A" }],
    correct: 0,
    explain: "Linjerna nerifrån är E – G – H – D – F. Mittlinjen är H.",
  },
  {
    kind: "choice",
    prompt: "Var står mitt-C (ettstrukna C)?",
    visual: staffSvg({ items: [{ kind: "note", step: -2 }], width: 140 }),
    options: [
      { label: "På en hjälplinje under notsystemet" },
      { label: "På den nedersta linjen" },
      { label: "I det översta mellanrummet" },
      { label: "På mittlinjen" },
    ],
    correct: 0,
    explain: "Mitt-C får en egen liten linje – en hjälplinje – under notsystemet.",
  },
  {
    kind: "choice",
    prompt: "Lyssna! Vilken ton var ljusast?",
    sound: () => {
      playMidi(stepToMidi(0), { duration: 0.5 });
      playMidi(stepToMidi(7), { duration: 0.5, delay: 0.7 });
    },
    options: [{ label: "Den första" }, { label: "Den andra" }, { label: "De var lika" }],
    correct: 1,
    fixedOrder: true,
    explain: "Först spelades ett lågt E, sedan ett högt E – den andra tonen var ljusast.",
  },
];

export const noter: Topic = {
  id: "noter",
  title: "Noter",
  emoji: "🎼",
  color: "#4f8cff",
  tagline: "Tonernas namn",
  ready: true,
  learn: [
    { kind: "text", text: "En **not** visar vilken ton som ska spelas. Ju **högre upp** noten sitter, desto **ljusare** är tonen." },
    { kind: "text", text: "Tonerna heter **C D E F G A H** – sedan börjar det om på C igen. Obs! På svenska heter tonen efter A **H**, inte B." },
    {
      kind: "visual",
      svg: staffSvg({
        items: SCALE.map((step) => ({ kind: "note" as const, step })),
        labels: Object.fromEntries(SCALE.map((s, i) => [i, stepToLetter(s)])),
        spacing: 34,
      }),
      caption: "C-durskalan från mitt-C. Tryck för att lyssna!",
      play: () => playMelody(SCALE.map((s) => [stepToMidi(s), 1]), 120),
    },
    { kind: "text", text: "**Linjerna** nerifrån: **E – G – H – D – F**. **Mellanrummen** nerifrån: **F – A – C – E**." },
    { kind: "tip", text: "Minnesregel för linjerna: **E**n **G**lad **H**und **D**ansar **F**int. Mellanrummen stavar **FACE**." },
    { kind: "text", text: "**Mitt-C** står på en egen liten **hjälplinje** under notsystemet." },
  ],
  makeQuestions: (rng) => [
    ...pick([-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 5, rng).map((s) => nameTheNote(s, rng)),
    findTheNote(rng),
    findTheNote(rng),
    ...facts,
  ],
};

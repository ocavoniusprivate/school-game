import type { Topic } from "./types";
import type { Question } from "../quiz/types";
import { pick } from "../quiz/engine";
import { BEATS, type NoteValue } from "../music/theory";
import { metronome, playMelody } from "../music/audio";
import { noteSymbolSvg } from "../music/staff";

export const NOTE_NAMES: Record<NoteValue, string> = {
  whole: "helnot",
  half: "halvnot",
  quarter: "fjärdedelsnot",
  eighth: "åttondelsnot",
  sixteenth: "sextondelsnot",
};

const VALUES: NoteValue[] = ["whole", "half", "quarter", "eighth", "sixteenth"];

const beatsText = (b: number) =>
  b === 0.5 ? "½ slag" : b === 0.25 ? "¼ slag" : `${b} slag`;

/** Hear a note value: four metronome clicks, then the note repeated to fill a bar. */
function playValue(value: NoteValue) {
  const bpm = 80;
  const lead = metronome(bpm, 4);
  const count = 4 / BEATS[value];
  setTimeout(() => playMelody(Array.from({ length: count }, () => [72, BEATS[value]] as [number, number]), bpm), lead * 1000);
}

function symbolToName(value: NoteValue, rng: () => number): Question {
  const others = pick(
    VALUES.filter((v) => v !== value),
    3,
    rng,
  );
  return {
    kind: "choice",
    prompt: "Vad heter noten?",
    visual: noteSymbolSvg(value),
    options: [value, ...others].map((v) => ({ label: NOTE_NAMES[v] })),
    correct: 0,
    explain: `Det är en ${NOTE_NAMES[value]}. Den är ${beatsText(BEATS[value])} lång.`,
  };
}

function nameToSymbol(value: NoteValue, rng: () => number): Question {
  const others = pick(
    VALUES.filter((v) => v !== value),
    3,
    rng,
  );
  return {
    kind: "choice",
    prompt: `Vilken är en ${NOTE_NAMES[value]}?`,
    options: [value, ...others].map((v) => ({ label: "", svg: noteSymbolSvg(v) })),
    correct: 0,
    explain: `Så här ser en ${NOTE_NAMES[value]} ut.`,
  };
}

const facts: Question[] = [
  {
    kind: "choice",
    prompt: "Hur många slag är en halvnot (i 4/4-takt)?",
    visual: noteSymbolSvg("half"),
    options: [{ label: "2" }, { label: "1" }, { label: "4" }, { label: "½" }],
    correct: 0,
    explain: "En halvnot är 2 slag – hälften av en helnot.",
  },
  {
    kind: "choice",
    prompt: "Hur många fjärdedelsnoter är lika långa som en helnot?",
    options: [{ label: "4" }, { label: "2" }, { label: "8" }, { label: "3" }],
    correct: 0,
    explain: "En helnot = 4 slag, och varje fjärdedelsnot är 1 slag.",
  },
  {
    kind: "choice",
    prompt: "Hur många åttondelsnoter är lika långa som en fjärdedelsnot?",
    options: [{ label: "2" }, { label: "4" }, { label: "1" }, { label: "8" }],
    correct: 0,
    explain: "En åttondel är ett halvt slag – två åttondelar blir ett helt slag.",
  },
  {
    kind: "choice",
    prompt: "Hur många slag är en punkterad halvnot?",
    visual: noteSymbolSvg("half", true),
    options: [{ label: "3" }, { label: "2" }, { label: "2½" }, { label: "4" }],
    correct: 0,
    explain: "Punkten förlänger noten med hälften av sin egen längd: 2 + 1 = 3 slag.",
  },
  {
    kind: "choice",
    prompt: "Vad gör en punkt efter en not?",
    visual: noteSymbolSvg("quarter", true),
    options: [
      { label: "Gör noten hälften längre" },
      { label: "Gör noten dubbelt så lång" },
      { label: "Gör noten kortare" },
      { label: "Gör noten starkare" },
    ],
    correct: 0,
    explain: "En punkt lägger till hälften av notens längd. Punkterad fjärdedel = 1½ slag.",
  },
  {
    kind: "choice",
    prompt: "Vilken not är längst?",
    options: (["whole", "quarter", "half", "eighth"] as NoteValue[]).map((v) => ({ label: "", svg: noteSymbolSvg(v) })),
    correct: 0,
    explain: "Helnoten är längst – 4 slag. Den har inget skaft.",
  },
  {
    kind: "choice",
    prompt: "Vad skiljer en åttondelsnot från en fjärdedelsnot?",
    options: [
      { label: "Åttondelen har en flagga" },
      { label: "Åttondelen är ihålig" },
      { label: "Åttondelen saknar skaft" },
      { label: "Åttondelen har en punkt" },
    ],
    correct: 0,
    explain: "Båda är fyllda och har skaft, men åttondelen har också en flagga. Två flaggor = sextondel.",
  },
];

export const notvarden: Topic = {
  id: "notvarden",
  title: "Notvärden",
  emoji: "⏱️",
  color: "#ff8a3d",
  tagline: "Hur långa är noterna?",
  ready: true,
  learn: [
    { kind: "text", text: "**Notvärdet** visar hur **lång** en ton är. Vi räknar i **slag** – i 4/4-takt är ett slag en fjärdedelsnot." },
    {
      kind: "table",
      rows: VALUES.map((v) => ({
        svg: noteSymbolSvg(v),
        label: NOTE_NAMES[v],
        detail: beatsText(BEATS[v]),
        play: () => playValue(v),
      })),
    },
    { kind: "tip", text: "Varje gång du går ett steg ner i tabellen blir noten **hälften så lång**: 1 helnot = 2 halvnoter = 4 fjärdedelar = 8 åttondelar." },
    { kind: "text", text: "Hur känner man igen dem? **Helnot**: ihålig, inget skaft. **Halvnot**: ihålig med skaft. **Fjärdedel**: fylld med skaft. **Åttondel**: + en flagga. **Sextondel**: + två flaggor." },
    {
      kind: "visual",
      svg: noteSymbolSvg("half", true),
      caption: "En **punkt** efter noten gör den hälften längre. Punkterad halvnot = 2 + 1 = 3 slag.",
    },
  ],
  makeQuestions: (rng) => [
    ...pick(VALUES, 3, rng).map((v) => symbolToName(v, rng)),
    ...pick(VALUES, 2, rng).map((v) => nameToSymbol(v, rng)),
    ...facts,
  ],
};

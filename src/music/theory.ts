// Music theory facts the game relies on. Pure and unit-tested (theory.test.ts).
// Swedish conventions: the note between A and C is called H (not B); B means
// H lowered by a semitone.

export const LETTERS = ["C", "D", "E", "F", "G", "A", "H"] as const;
export type Letter = (typeof LETTERS)[number];
export type Accidental = "sharp" | "flat" | "natural" | null;

/**
 * Positions on a treble-clef (G-klav) staff, counted in steps (line, space,
 * line…) from the BOTTOM line, which is E4. So 0 = E (bottom line),
 * 1 = F (first space), 2 = G (second line), -2 = middle C (ledger line below).
 */
const E4_INDEX = 2; // E is index 2 in LETTERS, octave 4

export function stepToLetter(step: number): Letter {
  const i = (((step + E4_INDEX) % 7) + 7) % 7;
  return LETTERS[i];
}

const SEMITONES = [0, 2, 4, 5, 7, 9, 11];

/** MIDI number for a staff step (C4 = 60), with an optional accidental. */
export function stepToMidi(step: number, accidental: Accidental = null): number {
  const fromC4 = step + E4_INDEX;
  const octave = Math.floor(fromC4 / 7);
  const degree = ((fromC4 % 7) + 7) % 7;
  const shift = accidental === "sharp" ? 1 : accidental === "flat" ? -1 : 0;
  return 60 + octave * 12 + SEMITONES[degree] + shift;
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Swedish note name with an accidental: C♯ = Ciss, E♭ = Ess, A♭ = Ass,
 * H♭ = B, D♭ = Dess.
 */
export function swedishName(letter: Letter, accidental: Accidental): string {
  if (accidental === "sharp") return `${letter}iss`;
  if (accidental === "flat") {
    if (letter === "H") return "B";
    if (letter === "E") return "Ess";
    if (letter === "A") return "Ass";
    return `${letter}ess`;
  }
  return letter;
}

export type NoteValue = "whole" | "half" | "quarter" | "eighth" | "sixteenth";

/** Length in quarter-note beats (the beat in 4/4). */
export const BEATS: Record<NoteValue, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
};

/** A dot adds half of the note's own length. */
export function dottedBeats(value: NoteValue): number {
  return BEATS[value] * 1.5;
}

/** Dynamics from softest to loudest, with a playback volume (0–1). */
export const DYNAMICS = [
  { mark: "pp", volume: 0.06 },
  { mark: "p", volume: 0.14 },
  { mark: "mp", volume: 0.25 },
  { mark: "mf", volume: 0.4 },
  { mark: "f", volume: 0.62 },
  { mark: "ff", volume: 0.9 },
] as const;
export type DynamicMark = (typeof DYNAMICS)[number]["mark"];

// The kinds of questions a mini-game can ask.

export interface Option {
  label: string;
  /** Optional picture (SVG markup) shown on the answer button. */
  svg?: string;
}

interface Base {
  prompt: string;
  /** Picture shown with the question (SVG markup). */
  visual?: string;
  /** Sound for the question; a "listen" button appears and it plays once at the start. */
  sound?: () => void;
  /** Shown after answering — why the right answer is right. */
  explain?: string;
}

/** Pick one answer. Options are listed with the right one at `correct`; the game shuffles them. */
export interface ChoiceQuestion extends Base {
  kind: "choice";
  options: Option[];
  correct: number;
  /** Keep the options in the given order (e.g. "first time / second time"). */
  fixedOrder?: boolean;
}

/** Put the items in order; `items` is given in the correct order, the game shuffles it. */
export interface OrderQuestion extends Base {
  kind: "order";
  items: Option[];
}

/** Tap along with a steady beat. */
export interface TapQuestion extends Base {
  kind: "tap";
  bpm: number;
  /** How many beats the player must tap. */
  beats: number;
}

export type Question = ChoiceQuestion | OrderQuestion | TapQuestion;

/** A random number source in [0, 1), so question generation can be tested. */
export type Rng = () => number;

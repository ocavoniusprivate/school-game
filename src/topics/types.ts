import type { Question, Rng } from "../quiz/types";

/** A piece of the "Lär dig" page. Text may use **bold**. */
export type LearnBlock =
  | { kind: "text"; text: string }
  | { kind: "visual"; svg: string; caption?: string; play?: () => void }
  | { kind: "table"; rows: { svg?: string; label: string; detail?: string; play?: () => void }[] }
  | { kind: "tip"; text: string };

export interface Topic {
  id: string;
  title: string;
  emoji: string;
  /** Island colour (CSS colour). */
  color: string;
  tagline: string;
  /** False while the island is still being built. */
  ready: boolean;
  learn: LearnBlock[];
  /** A pool of questions; a round picks some of them. */
  makeQuestions: (rng: Rng) => Question[];
}

// The islands, in the order of the topic list for the test ("förhöret").

import type { Topic } from "./types";
import { noter } from "./noter";
import { notvarden } from "./notvarden";
import { dynamik } from "./dynamik";

/** An island that is still being built: shown on the map as "Snart!". */
const soon = (id: string, title: string, emoji: string, color: string, tagline: string): Topic => ({
  id,
  title,
  emoji,
  color,
  tagline,
  ready: false,
  learn: [],
  makeQuestions: () => [],
});

export const TOPICS: Topic[] = [
  soon("notskrift", "Notskrift", "📜", "#7a5cff", "Notsystem och klav"),
  noter,
  soon("fortecken", "Förtecken", "♯", "#13a88a", "Kors, b och återställning"),
  notvarden,
  soon("pauser", "Pauser", "🤫", "#8d6e63", "När det är tyst"),
  soon("taktart", "Taktart", "🧮", "#f2b705", "4/4, 3/4 och 2/4"),
  soon("puls", "Puls", "💓", "#ef4444", "Musikens hjärtslag"),
  soon("tempo", "Tempo", "🐇", "#22a6d6", "Snabbt och långsamt"),
  soon("klang", "Klang", "🎻", "#9b51e0", "Hur instrument låter"),
  dynamik,
  soon("form", "Form", "🧩", "#2e9e5b", "Hur en låt är byggd"),
];

export function getTopic(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}

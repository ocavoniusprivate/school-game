// Picking and scoring questions. Pure and unit-tested (engine.test.ts).

import type { Rng } from "./types";

export const QUESTIONS_PER_ROUND = 8;

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** `count` random distinct items (or all of them, if there are fewer). */
export function pick<T>(items: readonly T[], count: number, rng: Rng): T[] {
  return shuffle(items, rng).slice(0, count);
}

export function pickOne<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)];
}

/**
 * Shuffle answer options, returning the new order and where the right answer
 * ended up.
 */
export function shuffleOptions<T>(options: readonly T[], correct: number, rng: Rng): { options: T[]; correct: number } {
  const order = shuffle(
    options.map((_, i) => i),
    rng,
  );
  return { options: order.map((i) => options[i]), correct: order.indexOf(correct) };
}

/** Stars for a round: 3 = (almost) perfect, 0 = keep practising. */
export function starsFor(correct: number, total: number): number {
  if (total === 0) return 0;
  const share = correct / total;
  if (share >= 0.9) return 3;
  if (share >= 0.7) return 2;
  if (share >= 0.4) return 1;
  return 0;
}

/**
 * How steady were the taps? Each tap is compared with the nearest beat;
 * returns how many taps landed within `tolerance` seconds.
 */
export function tapsOnBeat(taps: number[], firstBeat: number, beatLength: number, tolerance = 0.15): number {
  return taps.filter((t) => {
    const offset = (t - firstBeat) / beatLength;
    const nearest = Math.round(offset);
    return nearest >= 0 && Math.abs(offset - nearest) * beatLength <= tolerance;
  }).length;
}

/** A small seeded random generator (mulberry32) for repeatable tests. */
export function seeded(seed: number): Rng {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

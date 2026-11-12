import { describe, expect, it } from "vitest";
import { pick, seeded, shuffleOptions, starsFor, tapsOnBeat } from "./engine";

describe("shuffleOptions", () => {
  it("keeps track of the right answer", () => {
    const rng = seeded(1);
    for (let i = 0; i < 20; i++) {
      const { options, correct } = shuffleOptions(["a", "b", "c", "d"], 2, rng);
      expect(options[correct]).toBe("c");
      expect([...options].sort()).toEqual(["a", "b", "c", "d"]);
    }
  });
});

describe("pick", () => {
  it("returns distinct items, at most what exists", () => {
    const got = pick([1, 2, 3], 5, seeded(2));
    expect(got).toHaveLength(3);
    expect(new Set(got).size).toBe(3);
  });
});

describe("starsFor", () => {
  it("gives 3 / 2 / 1 / 0 stars", () => {
    expect(starsFor(8, 8)).toBe(3);
    expect(starsFor(6, 8)).toBe(2);
    expect(starsFor(4, 8)).toBe(1);
    expect(starsFor(1, 8)).toBe(0);
  });
});

describe("tapsOnBeat", () => {
  it("counts taps close to a beat", () => {
    // Beats at 1.0, 1.5, 2.0, 2.5 (120 bpm).
    const taps = [1.02, 1.48, 2.3, 2.55];
    expect(tapsOnBeat(taps, 1, 0.5)).toBe(3);
  });
  it("ignores taps before the first beat", () => {
    expect(tapsOnBeat([0.5], 1, 0.5)).toBe(0);
  });
});

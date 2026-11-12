import { describe, expect, it } from "vitest";
import { dottedBeats, midiToFrequency, stepToLetter, stepToMidi, swedishName } from "./theory";

describe("treble clef positions", () => {
  it("names the lines E G H D F and the spaces F A C E", () => {
    expect([0, 2, 4, 6, 8].map(stepToLetter)).toEqual(["E", "G", "H", "D", "F"]);
    expect([1, 3, 5, 7].map(stepToLetter)).toEqual(["F", "A", "C", "E"]);
  });

  it("puts middle C on the first ledger line below", () => {
    expect(stepToLetter(-2)).toBe("C");
    expect(stepToMidi(-2)).toBe(60);
  });

  it("knows pitches incl. accidentals", () => {
    expect(stepToMidi(3)).toBe(69); // A4
    expect(stepToMidi(5)).toBe(72); // C5
    expect(stepToMidi(-2, "sharp")).toBe(61);
    expect(stepToMidi(4, "flat")).toBe(70); // H♭ = B
    expect(midiToFrequency(69)).toBeCloseTo(440);
  });
});

describe("Swedish note names", () => {
  it("uses -iss for sharps and -ess for flats, with the special cases", () => {
    expect(swedishName("C", "sharp")).toBe("Ciss");
    expect(swedishName("F", "sharp")).toBe("Fiss");
    expect(swedishName("D", "flat")).toBe("Dess");
    expect(swedishName("E", "flat")).toBe("Ess");
    expect(swedishName("A", "flat")).toBe("Ass");
    expect(swedishName("H", "flat")).toBe("B");
    expect(swedishName("G", null)).toBe("G");
  });
});

describe("note values", () => {
  it("a dotted half note lasts 3 beats", () => {
    expect(dottedBeats("half")).toBe(3);
    expect(dottedBeats("quarter")).toBe(1.5);
  });
});

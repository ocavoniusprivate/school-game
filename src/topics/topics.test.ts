import { describe, expect, it } from "vitest";
import { TOPICS } from "./index";
import { seeded } from "../quiz/engine";

// Sanity checks on every question every ready island can produce, over many
// random rounds: there must be enough questions, answers must exist, and no
// question may offer the same answer twice.
describe("islands", () => {
  const ready = TOPICS.filter((t) => t.ready);

  it("has the 11 topics from the test list, with unique ids", () => {
    expect(TOPICS).toHaveLength(11);
    expect(new Set(TOPICS.map((t) => t.id)).size).toBe(11);
  });

  for (const topic of ready) {
    it(`${topic.title}: questions are well-formed`, () => {
      for (let seed = 1; seed <= 200; seed++) {
        const questions = topic.makeQuestions(seeded(seed));
        expect(questions.length).toBeGreaterThanOrEqual(8);
        for (const q of questions) {
          expect(q.prompt.length).toBeGreaterThan(0);
          if (q.kind === "choice") {
            expect(q.options.length).toBeGreaterThanOrEqual(2);
            expect(q.correct).toBeGreaterThanOrEqual(0);
            expect(q.correct).toBeLessThan(q.options.length);
            const keys = q.options.map((o) => o.label + (o.svg ?? ""));
            expect(new Set(keys).size).toBe(keys.length);
          }
          if (q.kind === "order") {
            expect(q.items.length).toBeGreaterThanOrEqual(3);
          }
        }
      }
    });

    it(`${topic.title}: has learning content`, () => {
      expect(topic.learn.length).toBeGreaterThan(0);
    });
  }
});

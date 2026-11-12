# NOTES — School Game ("Notlära-äventyret")

_Last updated: 2026-11-12_

## Done

- 2026-11-12: Public repo + GitHub Pages. Commits use the GitHub noreply email.
- 2026-11-12: Concept from Oscar's photo of the test brief (11 music theory
  topics, Swedish) → "Notlära-äventyret" (PROJECT.md §4).
- 2026-11-12: MVP step 1 — Vite + TS app, deploy workflow, map with 11 islands,
  quiz engine (choice / order / tap), islands **Noter, Notvärden, Dynamik** with
  learn pages, sounds and questions. Verified: unit tests, build, headless-Edge
  play-through of all three islands at phone size.

- 2026-11-12: Sound fix for iPhone silent switch (`unlockAudio` in
  `src/music/audio.ts`). Verified sound output in Chromium; **not verified on
  an iPhone** — Oscar reported no sound before the fix (device unknown).

## ⏸️ Paused 2026-11-12

Oscar returned to Hangoby after this "fun test". The site stays live until he
decides to take it down (repo Settings → Pages). First thing when resuming: ask
whether sound now works on his phone (iPhone or Android?).

## ▶️ Resume here

- **Next:** MVP step 2 — the other 8 islands (Notskrift, Förtecken, Pauser,
  Taktart, Puls, Tempo, Klang, Form). `staff.ts` already draws rests, time
  signatures, bar lines and accidentals; `TapQuestion` exists for Puls.
- Then step 3: the final "Förhöret" (mixed questions from all islands).
- The original test-brief photo is not in the repo (kept out on purpose).

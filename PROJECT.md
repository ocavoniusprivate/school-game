# School Game — Project Description

> What we are building and why (the contract). How Claude works in this repo
> lives in `CLAUDE.md`; running status lives in `NOTES.md`.

_Started 2026-11-12._

## 1. Overview

A fun test project: a **school-themed game** that runs in the browser, built as a
**proof of concept** to see what can be made quickly. **Game concept: to be
defined by Oscar** — this document will be filled in when the details arrive.

## 2. Goals

- A playable **MVP live on the public web soon**, reachable by link (phone and
  computer).
- Proof of concept only — it will **not stay live forever**; take it down when
  the experiment is over.

## 3. Hosting and visibility

- **Public GitHub repository** (`ocavoniusprivate/school-game`) — anyone can read
  the code, so **nothing private goes in it**: no personal data, secrets, or
  keys.
- **Live site:** GitHub Pages — https://ocavoniusprivate.github.io/school-game/
  — updated automatically on every push to `main`.
- Kept out of search engines (`noindex`).
- **Taking it down:** disable Pages (repo Settings → Pages) and/or archive or
  delete the repository.

## 4. Game: "Notlära-äventyret"

_Defined 2026-11-12 from a photo of a teacher's test brief: "Förhör på
notlära-kompendiet"._

- **Purpose:** help pupils revise for a music theory test (notlära), in a fun way.
- **Language:** Swedish only. Swedish school conventions (H not B, Ciss/Ess,
  fjärdedelsnot…).
- **Players:** school pupils, assumed ~10–13 years old. Phone first.
- **Structure:** an adventure map with **11 islands = the 11 topics on the test
  list**: Notskrift, Noter, Förtecken, Notvärden, Pauser, Taktart, Puls, Tempo,
  Klang, Dynamik, Form. Each island: **"Lär dig"** (short explanation, pictures,
  sounds) + **"Spela!"** (a round of 8 questions, 1–3 stars). A final island
  **"Förhöret"** mixes questions from all topics.
- **Question types:** pick an answer (text or pictures), put in order, listen and
  answer, tap along with the beat.
- **Music notation** is drawn by the game (SVG); **sounds** are made in the browser
  (Web Audio) — no sound files.
- **Progress** (best stars) is saved on the device only. No accounts, no data
  sent anywhere.

### MVP order
1. Map, quiz engine, islands **Noter, Notvärden, Dynamik** — _done 2026-11-12_.
2. The other 8 islands.
3. Final "Förhöret".

## 5. Technology

- Vite + TypeScript, no framework; static files on GitHub Pages, deployed by a
  GitHub Actions workflow on every push to `main` (tests must pass first).
- Fonts from Google Fonts: Baloo 2 (text), Noto Music (G clef).

## 6. Open items

- The teacher's booklet may use slightly different wording; content follows
  standard Swedish school terms.

# CLAUDE.md — School Game

How Claude works in this repo. **What** we build is in `PROJECT.md`; running
status and the "resume here" point are in `NOTES.md`.

## Golden rules

1. **This repository is PUBLIC.** Never commit personal data, secrets, keys,
   `.env*` files, or anything from Oscar's work or private life. Use clearly
   fake data in examples and tests.
2. **Commits use the GitHub noreply email** (set in this repo's local git
   config) so Oscar's personal address is not published. Don't change it.
3. **No absolute paths** in committed files — Oscar works across several PCs.
4. **Every push to `main` goes live** (GitHub Pages). Keep `main` working; use a
   branch for anything that might break the site.
5. Don't commit or push unless Oscar asks (initial setup excepted).

## How we work

- Oscar is the product owner: explain choices in plain language, plan before
  building anything non-trivial, small verifiable steps.
- Proof of concept: favour speed and fun over polish, but keep it working on a
  phone.
- User-facing text goes in a translation file once the game has real UI (not
  hardcoded in components).
- Verify in a real browser before calling something done; say plainly what was
  and wasn't tested.
- Send a push notification when a piece of work is finished.

## Tech

- To be decided when the game concept is known (see PROJECT.md §5). Must work as
  static files on GitHub Pages.

# Trailhead

Multi-user, offline-first workout log. TCSS 490 Artifact 5. Solo project (Saeed). The plan, milestones, and task IDs are in `PLAN.md`. Read it first.

## Start of every session
1. Read `PLAN.md` and the last entry in `LOG.md`.
2. Work on **one task ID** (e.g. `M1.2`). If it isn't in the plan, add it to the plan first.
3. At the end: tick the box in PLAN.md, add a dated LOG.md entry (what was built, what changed from the plan and why, how it was verified), and commit with the task ID in the message.

## Stack
- Vite + TypeScript (strict), no UI framework. Plain DOM rendering like the Artifact 2 app.
- IndexedDB for local data, a service worker for offline, and Supabase (Auth, Postgres, Edge Functions) for the backend.
- Deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to `main`. Vite `base` is `/trailhead/`.

## Commands
- `npm run dev`: local dev server
- `npm test`: Vitest (run before every commit)
- `npm run build`: typecheck + production build (must pass before every commit)

## Layout
- `src/core/`: **pure logic only** (no DOM, no IndexedDB, no network): data types, validation, legacy import, stats, sync merge, coach facts/checks. Everything here has tests next to it (`*.test.ts`).
- `src/store/`: IndexedDB (M1)
- `src/sync/`: talks to Supabase, uses the merge function from `src/core/` (M2)
- `src/ui/`: views and rendering
- `supabase/migrations/`: SQL schema. **Never edit an applied migration.** Add a new numbered file.
- `supabase/functions/`: edge functions (M3)

## Rules that protect user data
- Every change saves locally first, then goes in the outbox. The UI never waits on the network.
- Deletes are tombstones (`deleted: true` + new `updated_at`). Never hard-delete a workout row.
- The local data shape is versioned. Changing it needs a migration plus a test that upgrades old data.
- Access control lives in Postgres RLS, not the front end. Every new table gets RLS turned on and policies in the same migration.
- Never commit `.env` or any key other than the Supabase anon key.

## Coach (carried over from Artifact 3)
- Code owns every number: facts are computed in `src/core/coach/`.
- The model owns judgement and words only. It's one call with JSON output and no tools.
- Code checks the reply (no invented lifts, targets ≤ ceiling, no number not in the facts) before anything is saved. Retry once, then fail visibly.

## Working style
- Keep tasks small enough to finish and verify in one session.
- Verify in the real app (`npm run dev`, and on my phone for offline/PWA work), not just tests.
- Don't build things from "Later" in PLAN.md unless the milestone is done.

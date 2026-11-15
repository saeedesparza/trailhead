# Trailhead: Plan

TCSS 490 Artifact 5 ("The Moonshot"). Solo: Saeed Esparza. Due **Sun Dec 13**. Show and tell **Mon Dec 7**.

## What it is

My Artifact 2 gym log and Artifact 3 coach, rebuilt as a real multi-user app:

- **Accounts.** Sign in with an email link. Your log follows you across phone, laptop, and a new phone.
- **Works with no signal.** Every tap saves to the phone first and syncs when it's back online. Gym basements have bad signal, so this is the core of the app, not a nice-to-have.
- **Installable.** It's a PWA, so it goes on the home screen like an app.
- **Coach built in.** The weekly review from Artifact 3 runs from a button in the app, not from my terminal. It keeps the same rule that code does the math and the model only makes judgement calls.
- **Friends.** Add a gym friend and see each other's PRs. Nothing else is shared.
- **Brings my old data.** Importing a `trailhead.v1` JSON export from the Artifact 2 app keeps my real history.

**Who it's for:** me, plus 2 or 3 gym friends I'll get onto it by Dec 6. That's the "real people use it" bar.

## Stack (and why)

| Piece | Choice | Why |
|---|---|---|
| Front end | Vite + TypeScript, no UI framework | Same plain-DOM style as Artifact 2, but with types and modules. The app is now too big for one `app.js`. |
| Offline | Service worker + IndexedDB | Lets the app open and save with no network. localStorage is too small and synchronous for a sync queue. |
| Backend | Supabase (free tier): Auth, Postgres, Edge Functions | Real auth and Postgres without running a server. Row-level security means the database enforces who sees what, not my front end. |
| Coach | Supabase Edge Function → Claude API (`claude-haiku-5-5`) | Can't run `claude -p` for other users. Haiku keeps a weekly review cheap. Capped at 1 review per user per week. |
| Hosting | GitHub Pages, deployed by GitHub Actions | Free, same as my other artifacts. |
| Tests | Vitest for all pure logic | Sync merging, import, and coach checks are where bugs would lose someone's data. |

## Data model

One row per workout. The exercises and sets live inside it as JSON, the same shape as `trailhead.v1`, which keeps import trivial and makes sync per-workout:

```
workouts(id uuid, user_id, date, finished, notes, unit, exercises jsonb, updated_at, deleted)
profiles(id = auth user, display_name, unit)
friendships(a, b, status: pending | accepted)
coach_reviews(id, user_id, week_end, review jsonb, created_at)
```

**Sync rule:** last write wins per workout, by `updated_at`. Deletes are tombstones (`deleted = true`), never real row deletes, so a phone that was offline for a week can't bring a deleted workout back. Only one person ever edits a workout (its owner), so per-workout LWW is safe. Two of *my* devices editing the same workout offline is the only conflict case, and the newer edit winning is fine for a gym log.

Schema: `supabase/migrations/0001_init.sql`.

## Milestones

Each task is sized for one work session. IDs go in commit messages and LOG.md.
Checkpoints are the Week 6–9 portfolio submissions.

### M0 · Scaffold. Due Sun Nov 15 (Week 6 checkpoint)
- [x] **M0.1** PLAN.md, CLAUDE.md, LOG.md, README
- [x] **M0.2** Vite + TS skeleton that builds, Vitest running
- [x] **M0.3** Port the Artifact 2 data validation + Epley 1RM into `src/core/` with tests
- [x] **M0.4** Draft Postgres schema + RLS policies
- [x] **M0.5** GitHub Actions deploy to Pages
- [x] **M0.6** Push the repo and confirm the Pages URL loads

### M1 · Local-first app. Due Sun Nov 22 (Week 7 checkpoint)
- [ ] **M1.1** IndexedDB store (`src/store/`): workouts table + outbox table, with tests using `fake-indexeddb`
- [ ] **M1.2** Port the Today view (start workout, add exercise, add/remove set, prefill, PR badge)
- [ ] **M1.3** Port History + Lifts views
- [ ] **M1.4** Import a `trailhead.v1` export; export a backup. Test it against `coach/sample-export.json` from the old repo
- [ ] **M1.5** PWA: manifest, icons, service worker. It opens in airplane mode on my phone
- [ ] **M1.6** Move my real data over and use it at the gym for the rest of the week

**Done means:** I log a real workout with the phone in airplane mode and nothing is lost.

### M2 · Accounts + sync. Due Sun Nov 29 (Week 8 checkpoint, Thanksgiving week, so it's kept small)
- [ ] **M2.1** Create the Supabase project, apply the migration, put keys in `.env`
- [ ] **M2.2** Email-link sign in / sign out; app still works signed out (local only)
- [ ] **M2.3** Sync engine (`src/sync/`): push the outbox, pull rows newer than the last sync, merge by LWW. Pure merge function, heavily tested
- [ ] **M2.4** First sign-in uploads existing local data
- [ ] **M2.5** RLS test: a second account can't read or write my workouts (run as that user against the real API)

**Done means:** log offline on my phone, reconnect, and the workout shows up on my laptop.

### M3 · Coach + friends + real users. Due Sun Dec 6 (Week 9 checkpoint)
- [ ] **M3.1** Move `facts` + `check` from `trailhead-gym-log/coach/` into `src/core/coach/` (shared by app tests and the edge function)
- [ ] **M3.2** Edge function `coach`: load the user's week → facts → Claude API (JSON output) → check → retry once → save to `coach_reviews`. 1 per user per week
- [ ] **M3.3** Coach screen in the app
- [ ] **M3.4** Friends: invite by email, accept, PR feed (a SQL function that returns only PR sets, not whole workouts)
- [ ] **M3.5** Get 2–3 gym friends using it. Write down what they say in LOG.md and fix the worst issue
- [ ] **M3.6** Show-and-tell demo script

**Done means:** a friend who isn't me signs up on their own phone, logs a workout, and sees my PR.

### M4 · Ship. Dec 7 – Dec 13
- [ ] **M4.1** Show and tell (Dec 7)
- [ ] **M4.2** Fixes from show and tell + friend feedback
- [ ] **M4.3** Final portfolio card: title, links, reflection

## Later (not this quarter unless everything above is done)
- Charts of est. 1RM over time
- Routines / templates
- Plate calculator
- Rest timer

## Risks
- **Sync bugs lose data.** Merge logic is a pure function with tests before it touches the network. Tombstones, never hard deletes. Export backup stays available.
- **API cost / abuse on the coach.** It runs only for signed-in users, max 1 per week, on Haiku, with a spend limit set in the Anthropic console.
- **Thanksgiving week.** M2 is the smallest milestone. If it slips, the friends feature (M3.4) gets cut before the coach does.
- **Too big.** Cut order if I'm behind: friends → coach → PWA install polish. Offline logging + sync is the moonshot. It stays.

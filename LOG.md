# Log

What I planned and what changed. Newest at the bottom. Task IDs match `PLAN.md`.

## 2026-11-15 · M0: Scaffold (Week 6 checkpoint)

**Decision:** Artifact 5 is the Artifact 2 gym log + Artifact 3 coach grown into a real full-stack app: accounts, offline-first sync, coach in the app, and gym friends. Solo.

**Why a new repo:** the Artifact 2 app is live and I use it, and its portfolio links should keep working. The new app imports its JSON export, so no data is lost moving over.

**Built:**
- PLAN.md (milestones M0–M4 in single-session tasks, with checkpoint dates), CLAUDE.md (session routine, layout, data-safety rules), this log, README.
- Vite + TypeScript skeleton, Vitest.
- `src/core/model.ts`: the Artifact 2 `validate()` ported to TypeScript, plus a v1 → v2 upgrade (adds `updatedAt` and `deleted` to each workout, for sync). `src/core/stats.ts`: Epley est. 1RM and best set.
- `supabase/migrations/0001_init.sql`: profiles, workouts, friendships, coach_reviews, all with RLS.
- GitHub Actions workflow that builds and deploys to Pages.

**Choices made:**
- Exercises stay as JSON inside each workout row instead of separate tables. Import stays a straight copy and sync is per-workout. The friends PR feed will need a SQL function to dig into the JSON, which is acceptable.
- Coach moves from `claude -p` to the Claude API (Haiku) in an edge function, since other users can't run my CLI. This costs real money, so it's capped at 1 review/user/week plus a console spend limit.

**Verification (M0):**
- `npm test`: 11/11 pass (v1 → v2 upgrade, bad-data rejection, the Artifact 3 sample export importing cleanly, Epley/best-set).
- `npm run build`: typecheck + build pass. `vite preview` serves the page with asset paths under `/trailhead/`.
- **Not verified yet:** the SQL migration. There's no Postgres or Supabase CLI on this machine, so it first runs for real in M2.1, and M2.5 tests the RLS policies as a second user.

**Next:** M0.6 (push + confirm Pages), then M1.1 IndexedDB store.

## 2026-11-15 · M0.6: Pushed and deployed

- Created the public repo `saeedesparza/trailhead`, turned on Pages (source: GitHub Actions), pushed.
- The first push was rejected: my `gh` token didn't have the `workflow` scope, which GitHub requires to push `.github/workflows/`. Fixed it with `gh auth refresh -s workflow`.
- **Verified:** Deploy run 43766872291 passed (build ran tests + typecheck; deploy succeeded). https://saeedesparza.github.io/trailhead/ returns 200 and serves the built assets. Portfolio card 05 links (repo, plan, log) all return 200.
- **Later:** GitHub warns that `actions/checkout@v4`, `setup-node@v4`, and `upload-artifact@v4` target the deprecated Node 20. They still run, but bump them when newer majors are out.

**M0 done.** Next: M1.1 IndexedDB store.

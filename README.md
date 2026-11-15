# Trailhead

An offline-first workout log with accounts, sync, a built-in AI coach, and gym friends. It's the full-stack version of [Trailhead Gym Log](https://github.com/saeedesparza/trailhead-gym-log). TCSS 490 Artifact 5.

- Live: https://saeedesparza.github.io/trailhead/
- Plan: [PLAN.md](PLAN.md) · Log: [LOG.md](LOG.md) · Agent instructions: [CLAUDE.md](CLAUDE.md)

## Run it

```
npm install
cp .env.example .env   # add Supabase URL + anon key (from M2 on)
npm run dev
npm test
npm run build
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages. One-time setup: repo Settings → Pages → Source: **GitHub Actions**. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repo Actions variables once Supabase exists.

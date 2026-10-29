# Deployment

[← back to AGENTS.md](AGENTS.md)

## Setup (done)

1. **GitHub:** code is on `main` of https://github.com/Lyra-4leafclover/CandleLit. In the agent's checkout the remote is called `github`, not `origin`.
2. **Vercel:** project `candle-lit`, preset **Other**. Every push to `main` deploys automatically.
3. **Database:** Neon (free) connected from Vercel → Storage. The app reads `DATABASE_URL`, `POSTGRES_URL` or `STORAGE_URL` (the owner left the default `STORAGE` prefix once, so all three are accepted).
4. **Local:** without any of those variables, `server.py` uses SQLite at `data/candlelit.db` (gitignored).

Moving local accounts to Neon:

```bash
pip install "psycopg[binary]"
DATABASE_URL="<your Neon connection string>" python3 tools/migrate_to_postgres.py
```

Checking accounts: Neon console → Tables → `users`, or the SQL Editor. Don't share the `pw_hash` / `salt` columns.

## Environment variables

| Name | Needed | Purpose |
|---|---|---|
| `DATABASE_URL` / `POSTGRES_URL` / `STORAGE_URL` | Yes, on Vercel | Postgres connection |
| `VISITOR_SALT` | No | Key for hashing visitor IPs (falls back to one derived from the database URL) |
| `PORT`, `DB_PATH` | No, local only | Server port and SQLite path |

## Why Vercel + Neon

Vercel doesn't run `server.py` as an always-on process and has no lasting disk, so SQLite would be wiped. Options were Render/Railway (no code changes, about $5–7/month) or Vercel + a free hosted Postgres with the server rewritten as a function. The owner chose Vercel + Neon. Study parties used in-memory rooms, which serverless can't keep, so they are "Coming soon".

## Rollback tags

Each deploy gets a tag on the commit before it, pushed to GitHub. To roll back, reset `main` to the tag and push.

| Tag | Version before… |
|---|---|
| `pre-fit-v4` | fit-to-screen changes, demo-mode removal, Connect tab |
| `pre-zoom-v4` | proportional responsive scaling |
| `pre-authfix-v4` | full-height login page under scaling |
| `pre-visits-v4` | visitor counter |

Older tags: `cakes-classic` (before 3D cakes), `painted-v1`, `painted-v2`, `watercolor-v3`.

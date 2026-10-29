# Candlelit: agent memory

This is the project memory for **Candlelit**, a pomodoro web app where a candle melts while you focus and every finished session ends up on a cake. Read this file first, then follow the links. It records every request and decision from the build chat, so a new agent or collaborator can continue the work without the original conversation.

> **Update rule:** after every user message or iteration, add an entry to [history.md](history.md) and update whichever topic files changed. Keep this index accurate. Never write passwords, connection strings, cookies or API keys here, because the repo is public.

## Quick facts

| | |
|---|---|
| Owner | Lyra ([GitHub](https://github.com/Lyra-4leafclover) · [X](https://x.com/Lyra_void) · [portfolio](https://lyradossier.vercel.app/)) |
| Repo | https://github.com/Lyra-4leafclover/CandleLit (`main` is what Vercel deploys) |
| Live site | https://candle-lit-ten.vercel.app (Vercel project `candle-lit`) |
| Stack | Vanilla HTML/CSS/JS ES modules, SVG + painted WebP art, Python `server.py` |
| Database | Neon Postgres on Vercel, SQLite (`data/candlelit.db`) locally |
| Run locally | `python3 server.py` → http://localhost:8080 (`PORT` env to change) |
| Current version | v4 (catalog of 87 candles, 34 cakes, 7 toppers, 19 scenes) |

## Files in this folder

| File | What's in it |
|---|---|
| [product.md](product.md) | What the app is, the core loop, and every product rule the owner set |
| [design.md](design.md) | Visual direction, art modes (Watercolor / Classic), and design feedback |
| [architecture.md](architecture.md) | Code map: which file does what, data model, API endpoints |
| [art-pipeline.md](art-pipeline.md) | How painted art and melt stages are generated and wired in |
| [deployment.md](deployment.md) | GitHub → Vercel → Neon setup, environment variables, rollback tags |
| [versions.md](versions.md) | v1 → v4 timeline and what each version added |
| [marketing.md](marketing.md) | README, demo video, X post copy, Product Hunt logo |
| [gotchas.md](gotchas.md) | Bugs we hit and traps to avoid |
| [history.md](history.md) | Log of every request in the build chat and what was done |

## How the owner likes to work

- **Rollback first:** before any visual overhaul or deploy, keep the previous version (git tag, or a toggle in the app) so it can be restored. See [deployment.md](deployment.md#rollback-tags).
- **Add alongside, don't replace:** when trying a new art direction, add it next to the old one so both can be compared on the site.
- **Both modes, every item:** a feature, fix or new item must work in both Watercolor and Classic modes and for all candles, unless the request says otherwise.
- **Scope changes exactly:** when asked to change one mode (e.g. Watercolor), don't touch the other. Reverts mean one step back, not several.
- **Quality bar for art is high:** look at renders zoomed in before showing them. "Looks AI generated", "bad art", "too basic" and "random PNGs" have all been rejected.
- **Cozy, clean UI:** pastel cards, cream background, clean type. "Maximalist" describes the candles, not the UI.
- **Responsive like a normal site:** never size the layout to one person's screen.

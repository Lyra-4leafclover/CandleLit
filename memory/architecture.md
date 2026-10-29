# Architecture

[← back to AGENTS.md](AGENTS.md)

## Code map

| Path | Role |
|---|---|
| `index.html` | App shell, top bar, loads `js/app.js` as an ES module |
| `css/style.css` | All styles: pastel theme, dark mode, responsive `--z` scaling |
| `js/app.js` | Views (`focus`, `done`, `break`, `bakery`, `shop`, `studio`, `party`, `connect`, `stats`, `tasks`), timer, auth screen, share card, boot |
| `js/data.js` | Catalog: `CANDLES`, `CAKES`, `TOPPERS`, `STUDIO`, `AMBIENCE`, `DURATIONS`, `RARITY`, `STUDIO_COST` |
| `js/render.js` | SVG + painted rendering: `candleSVG`, `cakeSVG`, `sculptureSVG`, `setArtMode`, `ART`/`CAKE_ART`, `VESSELS`, `moldedCandle`, `PSTUDIO`, `onColor`, `phase()` |
| `js/art3.js`, `art4.js`, `art6.js`, `art7.js` | Generated metadata for painted art in `art3/`, `art4/`, `art6/`, `art7/` (melt stages, wick points, cake art) |
| `js/scenes.js` | Classic Bakery/share-card scenes (`sceneSVG`) |
| `js/stats.js` | Period stats and charts (bar, donut, hour, trend, heatmap) |
| `js/store.js` | Local state, versioned sync with the server |
| `js/api.js` | `api()` fetch helper and `auth` (me, login, signup, logout, rename) |
| `js/audio.js` | Crossfaded WebAudio loops of `audio/*.mp3` |
| `js/party.js` | Study party client (feature parked as "Coming soon") |
| `server.py` | Python stdlib server: static files, auth, state sync, visitor counter, party API. SQLite or Postgres. |
| `api/index.py` | Vercel Python function that wraps `server.Handler` |
| `vercel.json` | Rewrites `/api/*` to `api/index`; keeps art/audio out of the function bundle |
| `tools/migrate_to_postgres.py` | Copies local SQLite accounts and progress into Postgres |
| `docs/readme/` | README screenshots |
| `art*/`, `audio/` | Painted WebP art and recorded ambience |

## Data model

Tables (created by `init_db()` in `server.py`, same schema for SQLite and Postgres):

- `users`: id, username (holds the email for new accounts), display_name, pw_hash (PBKDF2-SHA256, 200k rounds), salt, created
- `sessions`: token, user_id, expires (HttpOnly cookie `cl_session`, 30 days)
- `states`: user_id, data (JSON of the whole app state), version, updated
- `saved_rooms`: permanent study-party rooms (parked)
- `visitors`: id (keyed hash of IP), first_seen, last_seen, visits, guest, account

App state JSON (`states.data`, or localStorage for guests) holds `flames`, `wax`, owned items, `cake` (the current cake, null for a fresh account), gallery, tasks, tags, `tagColors`, sessions history, goals, `recent`, `acquired` and settings.

## API

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/me` | GET | Current user or `{"user": null}` |
| `/api/auth/signup` | POST | `{email, password, name?}` |
| `/api/auth/login` | POST | `{email, password}` (old username accounts also work) |
| `/api/auth/logout` | POST | Ends the session |
| `/api/auth/profile` | POST | Rename display name |
| `/api/state` | GET / PUT | Load and save progress. PUT needs the current `version`, otherwise 409 and the client reloads. |
| `/api/visit` | POST | Counts a visitor, `{guest: bool}` |
| `/api/party/*` | POST | Study party (parked) |

On Vercel, if no database variable is set, every API call returns 503 with a clear message.

## Visitor counter

Added so the owner can see total users including guests. Each visitor is stored as an HMAC-SHA256 of their IP (first `X-Forwarded-For` entry); raw IPs are never saved. The HMAC key is `VISITOR_SALT` if set, otherwise derived from the database URL, so hashes can't be reversed from the public code. The client calls `/api/visit` once per tab session and again with `guest: true` when "Continue as guest" is clicked. `guest` and `account` flags stay set once true.

Query in the Neon SQL Editor:

```sql
SELECT COUNT(*) AS unique_visitors, SUM(guest) AS used_as_guest, SUM(account) AS signed_in,
       SUM(visits) AS total_visits,
       COUNT(*) FILTER (WHERE last_seen > extract(epoch FROM now()) - 86400) AS visitors_last_24h
FROM visitors;
```

Limits: people on the same network share one IP, and switching networks counts twice. Vercel Web Analytics is a free alternative that hasn't been enabled.

# Candlelit

A Pomodoro study app where your candle melts as you focus and finished candles fill cakes in your Bakery.

## Run locally

```
python3 server.py
```

Open http://localhost:8080. Needs only Python 3. Accounts are stored in `data/candlelit.db` (SQLite).

## Deploy to Vercel

The site's static files are served by Vercel, and `api/index.py` runs the server code as a Vercel Python function.
Vercel has no lasting disk, so accounts are stored in a Postgres database (Neon has a free plan).

1. Push this folder to a GitHub repository.
2. In Vercel, click **Add New → Project**, import the repository, keep the framework preset as **Other**, and deploy.
3. In the project, open **Storage → Create Database → Neon** (free plan) and connect it to the project.
   This adds a `DATABASE_URL` environment variable. Tables are created automatically.
4. Redeploy (Deployments → ⋯ → Redeploy) so the function picks up the database.

To bring local accounts along:

```
pip install "psycopg[binary]"
DATABASE_URL="<connection string from Neon>" python3 tools/migrate_to_postgres.py
```

Study parties are shown as "Coming soon"; they need a realtime service to work on Vercel.
Credit the ambience recordings listed in `audio/CREDITS.txt` if the site is public.

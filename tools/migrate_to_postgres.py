#!/usr/bin/env python3
"""Copy accounts and progress from the local SQLite database into Postgres (e.g. Neon).

Usage: DATABASE_URL="postgresql://..." python3 tools/migrate_to_postgres.py [path/to/candlelit.db]
Existing Postgres accounts with the same email/username are left untouched.
"""
import os
import sqlite3
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import server  # noqa: E402

if not server.DATABASE_URL:
    sys.exit("Set DATABASE_URL to your Postgres connection string first.")
src = sys.argv[1] if len(sys.argv) > 1 else server.DB_PATH
lite = sqlite3.connect(src)
lite.row_factory = sqlite3.Row
server.init_db()
copied = 0
with server.db() as c:
    for u in lite.execute("SELECT * FROM users"):
        row = c.execute(
            "INSERT INTO users (username, display_name, pw_hash, salt, created) VALUES (?, ?, ?, ?, ?) "
            "ON CONFLICT(username) DO NOTHING RETURNING id",
            (u["username"], u["display_name"], u["pw_hash"], u["salt"], u["created"]),
        ).fetchone()
        if not row:
            continue
        st = lite.execute("SELECT data, version, updated FROM states WHERE user_id = ?", (u["id"],)).fetchone()
        if st:
            c.execute(
                "INSERT INTO states (user_id, data, version, updated) VALUES (?, ?, ?, ?)",
                (row["id"], st["data"], st["version"], st["updated"]),
            )
        copied += 1
print(f"Copied {copied} account(s).")

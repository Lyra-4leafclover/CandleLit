#!/usr/bin/env python3
"""Candlelit server: static files, accounts, per-user progress sync, and study parties.

Uses SQLite locally. When DATABASE_URL (or POSTGRES_URL) is set, e.g. on Vercel with Neon, it uses Postgres."""
import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import string
import threading
import time
import mimetypes
mimetypes.add_type('image/webp', '.webp')
from http.cookies import SimpleCookie
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("DB_PATH", os.path.join(ROOT, "data", "candlelit.db"))
COOKIE = "cl_session"
SESSION_DAYS = 30
MEMBER_TIMEOUT = 30
ROOM_TIMEOUT = 900
MAX_MEMBERS = 16
MAX_BODY = 2_000_000
USERNAME_RE = re.compile(r"^[a-z0-9_.]{3,24}$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

rooms = {}
lock = threading.Lock()
db_lock = threading.Lock()


DATABASE_URL = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")
INTEGRITY_ERRORS = (sqlite3.IntegrityError,)
if DATABASE_URL:
    import psycopg
    from psycopg.rows import dict_row

    INTEGRITY_ERRORS += (psycopg.IntegrityError,)


class PgConn:
    """Wraps a psycopg connection so the SQLite-style '?' queries below work unchanged."""

    def __init__(self):
        self.conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)

    def execute(self, sql, params=()):
        return self.conn.execute(sql.replace("?", "%s"), params)

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        with self.conn:
            if exc[0]:
                self.conn.rollback()
        return False


def db():
    if DATABASE_URL:
        return PgConn()
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


PG_SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  pw_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created DOUBLE PRECISION NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires DOUBLE PRECISION NOT NULL
);
CREATE TABLE IF NOT EXISTS saved_rooms (
  code TEXT PRIMARY KEY,
  owner BIGINT NOT NULL,
  name TEXT NOT NULL,
  cake TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS states (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated DOUBLE PRECISION NOT NULL
);
"""


def init_db():
    if DATABASE_URL:
        with db() as c:
            for stmt in PG_SCHEMA.split(";"):
                if stmt.strip():
                    c.execute(stmt)
        return
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with db() as c:
        c.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT UNIQUE NOT NULL,
              display_name TEXT NOT NULL,
              pw_hash TEXT NOT NULL,
              salt TEXT NOT NULL,
              created REAL NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sessions (
              token TEXT PRIMARY KEY,
              user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              expires REAL NOT NULL
            );
            CREATE TABLE IF NOT EXISTS saved_rooms (
              code TEXT PRIMARY KEY,
              owner INTEGER NOT NULL,
              name TEXT NOT NULL,
              cake TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS states (
              user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
              data TEXT NOT NULL,
              version INTEGER NOT NULL DEFAULT 1,
              updated REAL NOT NULL
            );
            """
        )


def hash_pw(password, salt):
    return hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 200_000).hex()


def public_user(row):
    return {"id": row["id"], "username": row["username"], "name": row["display_name"]}


def new_code():
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    while True:
        code = "".join(secrets.choice(alphabet) for _ in range(5))
        if code not in rooms:
            return code


def prune():
    now = time.time()
    for code in list(rooms):
        room = rooms[code]
        for uid in list(room["members"]):
            if now - room["members"][uid]["lastSeen"] > MEMBER_TIMEOUT:
                del room["members"][uid]
        if room["members"] and room["host"] not in room["members"]:
            room["host"] = next(iter(room["members"]))
        if not room["members"] and now - room["updated"] > ROOM_TIMEOUT:
            del rooms[code]


def find_room_of(uid):
    for code, room in rooms.items():
        if uid in room["members"]:
            return code
    return None


def public_room(code, uid=None):
    room = rooms[code]
    return {
        "code": code,
        "host": room["host"],
        "session": room["session"],
        "now": time.time() * 1000,
        "you": uid,
        "members": [{"id": mid, **{k: v for k, v in m.items() if k != "lastSeen"}} for mid, m in room["members"].items()],
        "chat": room["chat"][-50:],
        "cake": room.get("cake", "funfetti"),
        "saved": room.get("saved", False),
        "name": room.get("name", ""),
        "board": sorted(room.get("board", {}).values(), key=lambda b: -b["minutes"])[:10],
    }


def add_member(room, uid, user, body):
    room["members"][uid] = {
        "name": user["name"],
        "username": user["username"],
        "design": str(body.get("design") or "classic")[:40],
        "subject": str(body.get("subject") or "")[:24],
        "status": "idle",
        "lastSeen": time.time(),
    }
    room["updated"] = time.time()


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, *args):
        pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def send_json(self, data, status=200, cookie=None):
        payload = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        if cookie is not None:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()
        self.wfile.write(payload)

    def read_body(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length > MAX_BODY:
            return None
        try:
            return json.loads(self.rfile.read(length) or b"{}")
        except (json.JSONDecodeError, UnicodeDecodeError):
            return {}

    def session_cookie(self, token, max_age):
        secure = "; Secure" if self.headers.get("X-Forwarded-Proto") == "https" else ""
        return f"{COOKIE}={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age={max_age}{secure}"

    def current_user(self):
        raw = self.headers.get("Cookie")
        if not raw:
            return None
        morsel = SimpleCookie(raw).get(COOKIE)
        if not morsel:
            return None
        with db() as c:
            row = c.execute(
                "SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires > ?",
                (morsel.value, time.time()),
            ).fetchone()
        return public_user(row) if row else None

    def start_session(self, user_id):
        token = secrets.token_urlsafe(32)
        with db() as c:
            c.execute("DELETE FROM sessions WHERE expires < ?", (time.time(),))
            c.execute("INSERT INTO sessions VALUES (?, ?, ?)", (token, user_id, time.time() + SESSION_DAYS * 86400))
        return self.session_cookie(token, SESSION_DAYS * 86400)

    # ---------- routing ----------
    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/auth/me":
            user = self.current_user()
            return self.send_json({"user": user})
        if path == "/api/state":
            user = self.current_user()
            if not user:
                return self.send_json({"error": "Please sign in"}, 401)
            with db() as c:
                row = c.execute("SELECT data, version FROM states WHERE user_id = ?", (user["id"],)).fetchone()
            return self.send_json({"data": json.loads(row["data"]) if row else None, "version": row["version"] if row else 0})
        if path == "/api/party/mine":
            user = self.current_user()
            if not user:
                return self.send_json({"error": "Please sign in"}, 401)
            with lock:
                prune()
                code = find_room_of(user["id"])
                if not code:
                    return self.send_json({"room": None})
                rooms[code]["members"][user["id"]]["lastSeen"] = time.time()
                return self.send_json({"room": public_room(code, user["id"])})
        if path.startswith("/api/"):
            return self.send_json({"error": "Not found"}, 404)
        if path.startswith("/data") or path.endswith((".py", ".db")) or "/." in path:
            return self.send_json({"error": "Not found"}, 404)
        return super().do_GET()

    def do_PUT(self):
        path = urlparse(self.path).path
        if path != "/api/state":
            return self.send_json({"error": "Not found"}, 404)
        user = self.current_user()
        if not user:
            return self.send_json({"error": "Please sign in"}, 401)
        body = self.read_body()
        if body is None:
            return self.send_json({"error": "Too large"}, 413)
        data = body.get("data")
        if not isinstance(data, dict):
            return self.send_json({"error": "Bad data"}, 400)
        with db_lock, db() as c:
            row = c.execute("SELECT version FROM states WHERE user_id = ?" + (" FOR UPDATE" if DATABASE_URL else ""), (user["id"],)).fetchone()
            base = body.get("base")
            if row and (not isinstance(base, int) or base < row["version"]):
                return self.send_json({"error": "stale", "version": row["version"]}, 409)
            version = (row["version"] if row else 0) + 1
            c.execute(
                "INSERT INTO states (user_id, data, version, updated) VALUES (?, ?, ?, ?) "
                "ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, version = excluded.version, updated = excluded.updated",
                (user["id"], json.dumps(data), version, time.time()),
            )
        return self.send_json({"ok": True, "version": version})

    def do_POST(self):
        path = urlparse(self.path).path
        body = self.read_body()
        if body is None:
            return self.send_json({"error": "Too large"}, 413)
        if path.startswith("/api/auth/"):
            return self.auth(path, body)
        if path.startswith("/api/party/"):
            user = self.current_user()
            if not user:
                return self.send_json({"error": "Sign in to join study parties"}, 401)
            return self.party(path, body, user)
        return self.send_json({"error": "Not found"}, 404)

    def auth(self, path, body):
        if path == "/api/auth/logout":
            raw = self.headers.get("Cookie")
            morsel = SimpleCookie(raw).get(COOKIE) if raw else None
            if morsel:
                with db() as c:
                    c.execute("DELETE FROM sessions WHERE token = ?", (morsel.value,))
            return self.send_json({"ok": True}, cookie=self.session_cookie("", 0))
        username = str(body.get("email") or body.get("username") or "").strip().lower()[:254]
        password = str(body.get("password") or "")
        if path == "/api/auth/signup":
            if not EMAIL_RE.match(username):
                return self.send_json({"error": "Enter a valid email address"}, 400)
            name = str(body.get("name") or "").strip()[:24] or username.split("@")[0][:24]
            if len(password) < 8:
                return self.send_json({"error": "Use at least 8 characters for your password"}, 400)
            salt = secrets.token_hex(16)
            try:
                with db_lock, db() as c:
                    uid = c.execute(
                        "INSERT INTO users (username, display_name, pw_hash, salt, created) VALUES (?, ?, ?, ?, ?) RETURNING id",
                        (username, name, hash_pw(password, salt), salt, time.time()),
                    ).fetchone()["id"]
            except INTEGRITY_ERRORS:
                return self.send_json({"error": "An account with that email already exists. Try signing in."}, 409)
            return self.send_json({"user": {"id": uid, "username": username, "name": name}}, cookie=self.start_session(uid))
        if path == "/api/auth/login":
            with db() as c:
                row = c.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
            if not row or not hmac.compare_digest(row["pw_hash"], hash_pw(password, row["salt"])):
                time.sleep(0.4)
                return self.send_json({"error": "Wrong email or password"}, 401)
            return self.send_json({"user": public_user(row)}, cookie=self.start_session(row["id"]))
        if path == "/api/auth/profile":
            user = self.current_user()
            if not user:
                return self.send_json({"error": "Please sign in"}, 401)
            name = str(body.get("name") or "").strip()[:24]
            if not name:
                return self.send_json({"error": "Name can't be empty"}, 400)
            with db() as c:
                c.execute("UPDATE users SET display_name = ? WHERE id = ?", (name, user["id"]))
            with lock:
                code = find_room_of(user["id"])
                if code:
                    rooms[code]["members"][user["id"]]["name"] = name
            return self.send_json({"user": {**user, "name": name}})
        return self.send_json({"error": "Not found"}, 404)

    def party(self, path, body, user):
        uid = user["id"]
        with lock:
            prune()
            if path in ("/api/party/create", "/api/party/join"):
                old = find_room_of(uid)
                if old:
                    rooms[old]["members"].pop(uid, None)
                    if rooms[old]["members"] and rooms[old]["host"] == uid:
                        rooms[old]["host"] = next(iter(rooms[old]["members"]))
                if path == "/api/party/create":
                    code = new_code()
                    rooms[code] = {"members": {}, "host": uid, "session": None, "chat": [], "updated": time.time(), "cake": str(body.get("cake") or "funfetti")[:40], "board": {}}
                else:
                    code = str(body.get("code") or "").strip().upper()
                    if code not in rooms:
                        with db() as c:
                            saved = c.execute("SELECT * FROM saved_rooms WHERE code = ?", (code,)).fetchone()
                        if saved:
                            rooms[code] = {"members": {}, "host": uid, "session": None, "chat": [], "updated": time.time(), "cake": saved["cake"], "board": {}, "saved": True, "name": saved["name"]}
                    if code not in rooms:
                        return self.send_json({"error": "No party with that code. Check it and try again."}, 404)
                    if len(rooms[code]["members"]) >= MAX_MEMBERS:
                        return self.send_json({"error": "This party is full"}, 409)
                add_member(rooms[code], uid, user, body)
                rooms[code]["chat"].append({"system": True, "text": f"{user['name']} joined", "at": time.time() * 1000})
                return self.send_json({"room": public_room(code, uid)})

            code = find_room_of(uid)
            if not code:
                return self.send_json({"error": "You're not in a party"}, 404)
            room = rooms[code]
            member = room["members"][uid]
            member["lastSeen"] = time.time()
            room["updated"] = time.time()

            if path == "/api/party/ping":
                pass
            elif path == "/api/party/start":
                if uid != room["host"]:
                    return self.send_json({"error": "Only the host can light the candles"}, 403)
                minutes = max(1, min(180, int(body.get("minutes") or 25)))
                duration_ms = max(5000, min(180 * 60000, int(body.get("durationMs") or minutes * 60000)))
                room["session"] = {"id": secrets.token_hex(4), "startAt": time.time() * 1000 + 5000, "durationMs": duration_ms, "minutes": minutes}
                for m in room["members"].values():
                    m["status"] = "burning"
                room["chat"].append({"system": True, "text": f"{user['name']} lit everyone's candles · {minutes} min", "at": time.time() * 1000})
            elif path == "/api/party/status":
                if body.get("status") == "done" and member["status"] == "burning" and room["session"]:
                    entry = room.setdefault("board", {}).setdefault(str(uid), {"name": user["name"], "minutes": 0, "sessions": 0})
                    entry["minutes"] += room["session"]["minutes"]
                    entry["sessions"] += 1
                for key in ("status", "design", "subject"):
                    if key in body:
                        member[key] = str(body[key])[:40]
                if body.get("status") == "quit":
                    room["chat"].append({"system": True, "text": f"{user['name']} blew out early", "at": time.time() * 1000})
            elif path == "/api/party/reset":
                if uid == room["host"]:
                    room["session"] = None
                    for m in room["members"].values():
                        m["status"] = "idle"
            elif path == "/api/party/cake":
                if uid != room["host"]:
                    return self.send_json({"error": "Only the host picks the party cake"}, 403)
                room["cake"] = str(body.get("cake") or "funfetti")[:40]
            elif path == "/api/party/save":
                if uid != room["host"]:
                    return self.send_json({"error": "Only the host can save the room"}, 403)
                room["saved"] = True
                room["name"] = str(body.get("name") or f"{user['name']}'s study room")[:40]
                with db() as c:
                    c.execute(
                        "INSERT INTO saved_rooms VALUES (?, ?, ?, ?) ON CONFLICT(code) DO UPDATE SET owner = excluded.owner, name = excluded.name, cake = excluded.cake",
                        (code, uid, room["name"], room["cake"]),
                    )
            elif path == "/api/party/chat":
                text = str(body.get("text") or "").strip()[:240]
                if text:
                    room["chat"].append({"from": uid, "name": user["name"], "text": text, "at": time.time() * 1000})
                    room["chat"] = room["chat"][-100:]
            elif path == "/api/party/cheer":
                to = body.get("to")
                target = room["members"].get(to)
                if target:
                    room["chat"].append({"system": True, "cheer": True, "text": f"{user['name']} cheered {target['name']} on", "at": time.time() * 1000})
            elif path == "/api/party/host":
                if uid == room["host"] and body.get("to") in room["members"]:
                    room["host"] = body["to"]
            elif path == "/api/party/leave":
                del room["members"][uid]
                room["chat"].append({"system": True, "text": f"{user['name']} left", "at": time.time() * 1000})
                if room["members"] and room["host"] == uid:
                    room["host"] = next(iter(room["members"]))
                return self.send_json({"ok": True})
            else:
                return self.send_json({"error": "Not found"}, 404)
            return self.send_json({"room": public_room(code, uid)})


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", "8080"))
    print(f"Candlelit running on http://localhost:{port}")
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()

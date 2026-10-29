#!/usr/bin/env python3
"""Candlelit: static file server + tiny in-memory study-party API."""
import json
import os
import random
import string
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
MEMBER_TIMEOUT = 30
ROOM_TIMEOUT = 600
rooms = {}
lock = threading.Lock()


def new_id(n=8, alphabet=string.ascii_lowercase + string.digits):
    return "".join(random.choice(alphabet) for _ in range(n))


def prune():
    now = time.time()
    for code in list(rooms):
        room = rooms[code]
        for mid in list(room["members"]):
            if now - room["members"][mid]["lastSeen"] > MEMBER_TIMEOUT:
                del room["members"][mid]
        if room["members"] and room["host"] not in room["members"]:
            room["host"] = next(iter(room["members"]))
        if not room["members"] and now - room["updated"] > ROOM_TIMEOUT:
            del rooms[code]


def public_room(code):
    room = rooms[code]
    return {
        "code": code,
        "host": room["host"],
        "session": room["session"],
        "now": time.time() * 1000,
        "members": [
            {"id": mid, **{k: v for k, v in m.items() if k != "lastSeen"}}
            for mid, m in room["members"].items()
        ],
    }


def add_member(room, body):
    mid = new_id()
    room["members"][mid] = {
        "name": str(body.get("name") or "Friend")[:24],
        "design": str(body.get("design") or "classic")[:40],
        "status": "idle",
        "subject": "",
        "lastSeen": time.time(),
    }
    room["updated"] = time.time()
    return mid


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, *args):
        pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, data, status=200):
        payload = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def read_body(self):
        length = int(self.headers.get("Content-Length") or 0)
        try:
            return json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            return {}

    def do_GET(self):
        url = urlparse(self.path)
        if url.path == "/api/party/state":
            q = parse_qs(url.query)
            code = (q.get("code") or [""])[0].upper()
            mid = (q.get("member") or [""])[0]
            with lock:
                prune()
                room = rooms.get(code)
                if not room or mid not in room["members"]:
                    return self.send_json({"error": "Party not found"}, 404)
                room["members"][mid]["lastSeen"] = time.time()
                return self.send_json(public_room(code))
        if url.path.startswith("/api/"):
            return self.send_json({"error": "Not found"}, 404)
        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        body = self.read_body()
        with lock:
            prune()
            if path == "/api/party/create":
                code = new_id(5, string.ascii_uppercase.replace("O", "").replace("I", "") + "23456789")
                rooms[code] = {"members": {}, "host": None, "session": None, "updated": time.time()}
                mid = add_member(rooms[code], body)
                rooms[code]["host"] = mid
                return self.send_json({"code": code, "memberId": mid, "room": public_room(code)})

            code = str(body.get("code") or "").upper()
            room = rooms.get(code)
            if not room:
                return self.send_json({"error": "Party not found"}, 404)

            if path == "/api/party/join":
                mid = add_member(room, body)
                return self.send_json({"code": code, "memberId": mid, "room": public_room(code)})

            mid = body.get("memberId")
            member = room["members"].get(mid)
            if not member:
                return self.send_json({"error": "Not in this party"}, 403)
            member["lastSeen"] = time.time()
            room["updated"] = time.time()

            if path == "/api/party/start":
                if mid != room["host"]:
                    return self.send_json({"error": "Only the host can light the candles"}, 403)
                minutes = max(1, min(180, int(body.get("minutes") or 25)))
                duration_ms = int(body.get("durationMs") or minutes * 60000)
                room["session"] = {
                    "id": new_id(),
                    "startAt": time.time() * 1000 + 4000,
                    "durationMs": duration_ms,
                    "minutes": minutes,
                }
                for m in room["members"].values():
                    m["status"] = "burning"
                return self.send_json(public_room(code))
            if path == "/api/party/status":
                for key in ("status", "design", "subject"):
                    if key in body:
                        member[key] = str(body[key])[:40]
                return self.send_json(public_room(code))
            if path == "/api/party/reset":
                if mid == room["host"]:
                    room["session"] = None
                    for m in room["members"].values():
                        m["status"] = "idle"
                return self.send_json(public_room(code))
            if path == "/api/party/leave":
                del room["members"][mid]
                if room["members"] and room["host"] == mid:
                    room["host"] = next(iter(room["members"]))
                return self.send_json({"ok": True})
        return self.send_json({"error": "Not found"}, 404)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    print(f"Candlelit running on http://localhost:{port}")
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()

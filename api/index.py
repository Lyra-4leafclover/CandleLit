"""Vercel entry point: every /api/* request is rewritten here and handled by server.Handler."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import server  # noqa: E402

server.init_db()


class handler(server.Handler):
    pass

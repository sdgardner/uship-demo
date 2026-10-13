#!/usr/bin/env python3
"""Static server for the uShip demo with caching disabled (dev only)."""
import functools
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    root = os.path.dirname(os.path.abspath(__file__))
    handler = functools.partial(NoCacheHandler, directory=root)
    print(f"Serving {root} on http://localhost:4173 (no-cache)")
    HTTPServer(("", 4173), handler).serve_forever()

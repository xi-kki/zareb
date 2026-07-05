"""
Vercel Serverless entry point for Zareb API.

Imports the FastAPI app from main.py and wraps it for Vercel's
Python runtime (ASGI). Vercel will discover this file automatically
when the project is configured with Python framework.
"""
import sys
import os

# Ensure the repo root is on the path so main.py and app/ are importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

# Vercel ASGI handler — the serverless runtime looks for `app`
handler = app

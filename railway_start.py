"""Railway-specific startup with enhanced diagnostics.

This script handles PORT binding, database URL configuration,
and provides clear startup logging for Railway's environment.
Use as: python railway_start.py
"""

import os
import sys
import logging

logging.basicConfig(
    level=logging.INFO,
    stream=sys.stdout,
    format="%(asctime)s [Zareb] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("railway")

# Log Railway environment info
logger.info("=== Zareb Railway Startup ===")
logger.info(f"PORT={os.environ.get('PORT', 'not set')}")
logger.info(f"DATABASE_URL={'set' if os.environ.get('DATABASE_URL') else 'not set'}")
logger.info(f"GROQ_API_KEY={'set' if os.environ.get('GROQ_API_KEY') else 'not set'}")
logger.info(f"JWT_SECRET={'set' if os.environ.get('JWT_SECRET') else 'not set'}")

# ── Database URL handling ────────────────────────────────
db_url = os.environ.get("DATABASE_URL", "")
if db_url and db_url.startswith("postgres://"):
    # Railway gives postgres:// but SQLAlchemy needs postgresql://
    fixed_url = db_url.replace("postgres://", "postgresql://", 1)
    os.environ["DATABASE_URL"] = fixed_url
    logger.info("Fixed DATABASE_URL prefix: postgres:// → postgresql://")

# ── Import and run the app ───────────────────────────────
port = os.environ.get("PORT", "8000")
host = "0.0.0.0"

logger.info(f"Starting uvicorn on {host}:{port}...")

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=host,
        port=int(port),
        log_level="info",
        workers=1,
    )

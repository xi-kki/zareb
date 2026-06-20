"""Zareb API — AI Compliance Document Checker

Production entry point. Run with:
    uvicorn main:app --host 0.0.0.0 --port 8000
"""

import logging
import os
import sys
import warnings

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger("zareb")

# ── Graceful imports ───────────────────────────────────────
# Each module is imported here so that a single broken import
# doesn't prevent the app from starting and serving /health.

from app.core.config import settings
from app.core.database import init_db
from app.services.ai_service import ai_service

_route_modules = []
_import_errors = []

for _mod_name in ["auth", "documents", "analysis", "reports", "chat", "checklists", "knowledge", "admin"]:
    try:
        _mod = __import__(f"app.api.{_mod_name}", fromlist=["router"])
        _route_modules.append((_mod_name, _mod))
        logger.info("Loaded route module: %s", _mod_name)
    except Exception as exc:
        logger.warning("Route module '%s' failed to load: %s", _mod_name, exc)
        _import_errors.append(_mod_name)


# ── Production safety checks ──────────────────────────────

def _check_production_settings():
    if settings.DEBUG:
        logger.warning("SECURITY: DEBUG mode is ON.")
    if settings.JWT_SECRET == "zareb-dev-secret-change-in-production-32chars":
        logger.warning("SECURITY: JWT_SECRET is the insecure dev default.")

_check_production_settings()


# ── App lifecycle ──────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await init_db()
        logger.info("Database tables initialized.")
    except Exception as e:
        logger.warning("DB init deferred (will retry on first request): %s", e)
    yield
    # Graceful shutdown
    try:
        if hasattr(ai_service, "close"):
            await ai_service.close()
            logger.info("AI service connections closed.")
    except Exception as e:
        logger.warning("AI service shutdown warning: %s", e)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)


# ── CORS ───────────────────────────────────────────────────

cors_origins = settings.cors_origins_list
if not cors_origins or cors_origins == [""]:
    cors_origins = ["http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
)


# ── Register routes ────────────────────────────────────────

for mod_name, mod in _route_modules:
    try:
        app.include_router(mod.router)
        logger.info("Registered routes from: %s", mod_name)
    except Exception as exc:
        logger.warning("Failed to register routes from '%s': %s", mod_name, exc)


# ── Healthcheck (always works, even if DB or routes are down) ──

@app.get("/health")
async def health():
    return {"status": "ok", "service": "zareb-api", "version": settings.APP_VERSION}


# ── Startup banner ────────────────────────────────────────

if _import_errors:
    logger.warning("App started with %d module(s) unavailable: %s", len(_import_errors), _import_errors)
else:
    logger.info("All route modules loaded successfully.")

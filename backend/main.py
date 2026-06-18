"""Kamara API — AI Compliance Document Checker

Production entry point. Run with:
    uvicorn main:app --host 0.0.0.0 --port 8000
"""

import os
import warnings

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.api import auth, documents, analysis, reports, chat, checklists, knowledge

# ── Production safety checks ──────────────────────────────

def _check_production_settings():
    """Warn about insecure defaults that must be overridden in production."""
    if settings.DEBUG:
        warnings.warn(
            "SECURITY: DEBUG mode is ON. This exposes SQL queries and stack traces. "
            "Set DEBUG=false in production."
        )
    
    if settings.JWT_SECRET == "kamara-dev-secret-change-in-production-32chars":
        warnings.warn(
            "SECURITY: JWT_SECRET is the insecure development default. "
            "Generate a random 32+ char secret and set JWT_SECRET in your .env file."
        )

_check_production_settings()


# ── App lifecycle ──────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    # Disable OpenAPI docs in production
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# ── CORS (hardened for production) ─────────────────────────

cors_origins = settings.cors_origins_list
if not cors_origins or cors_origins == [""]:
    # Fallback to safe defaults
    cors_origins = ["http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With",
    ],
)

# ── Routers ─────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(analysis.router)
app.include_router(reports.router)
app.include_router(chat.router)
app.include_router(checklists.router)
app.include_router(knowledge.router)


@app.get("/health")
async def health():
    """Health check endpoint for Railway/load balancers."""
    return {"status": "ok", "service": "kamara-api", "version": settings.APP_VERSION}

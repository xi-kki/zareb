"""Zareb API — AI Compliance Document Checker

Production entry point. Run with:
    uvicorn main:app --host 0.0.0.0 --port 8000
"""

import os
import warnings

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
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
    
    if settings.JWT_SECRET == "zareb-dev-secret-change-in-production-32chars":
        warnings.warn(
            "SECURITY: JWT_SECRET is the insecure development default. "
            "Generate a random 32+ char secret and set JWT_SECRET in your .env file."
        )

_check_production_settings()


# ── App lifecycle ──────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await init_db()
    except Exception as e:
        # App can still serve healthcheck even if DB is down.
        # DB will be retried on first request.
        print(f"[Zareb] DB init deferred (will retry): {e}")
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    # Disable OpenAPI docs in production
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # Only set CSP in non-dev or if explicitly configured
    if not settings.DEBUG:
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https:; "
            "font-src 'self' data:; "
        )
    return response

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
    return {"status": "ok", "service": "zareb-api", "version": settings.APP_VERSION}

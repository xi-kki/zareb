"""Database setup with SQLAlchemy — supports both sync and async."""

import asyncio
import logging
import os

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.config import settings

logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    pass


# --- Sync engine (for Alembic, scripts) ---
if settings.DATABASE_URL.startswith("sqlite"):
    sync_engine = create_engine(
        settings.DATABASE_URL.replace("sqlite+aiosqlite", "sqlite"),
        connect_args={"check_same_thread": False},
    )
else:
    sync_engine = create_engine(settings.DATABASE_URL)

SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)


# --- Async engine (for FastAPI endpoints) ---
def _get_async_url():
    url = settings.DATABASE_URL
    if url.startswith("sqlite://"):
        url = url.replace("sqlite://", "sqlite+aiosqlite://", 1)
    elif url.startswith("postgresql://"):
        # Railway provides DATABASE_URL as postgresql://...
        # Async SQLAlchemy needs postgresql+asyncpg://
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


async_engine = create_async_engine(_get_async_url(), echo=settings.DEBUG)
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db():
    """Create all tables if they don't exist yet.
    
    Retries up to 5 times with exponential backoff to handle
    transient PostgreSQL connectivity issues (common on Railway
    during initial deployment / database provisioning).
    """
    max_retries = 5
    base_delay = 1.0  # seconds

    for attempt in range(1, max_retries + 1):
        try:
            async with async_engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all, checkfirst=True)
            logger.info("Database tables ready.")
            return
        except Exception as exc:
            if attempt < max_retries:
                delay = base_delay * (2 ** (attempt - 1))
                logger.warning(
                    "DB connection attempt %d/%d failed: %s. Retrying in %.1fs...",
                    attempt, max_retries, exc, delay,
                )
                await asyncio.sleep(delay)
            else:
                logger.error(
                    "DB connection failed after %d attempts: %s",
                    max_retries, exc,
                )
                raise


async def get_db():
    """Dependency that provides an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

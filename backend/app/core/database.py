"""Database setup with SQLAlchemy — supports both sync and async."""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.config import settings


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
    return url


async_engine = create_async_engine(_get_async_url(), echo=settings.DEBUG)
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db():
    """Create all tables if they don't exist yet."""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all, checkfirst=True)


async def get_db():
    """Dependency that provides an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

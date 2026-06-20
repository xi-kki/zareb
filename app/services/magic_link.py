"""
Magic Link Authentication — passwordless one-time login tokens.

Flow:
1. User enters email → POST /api/auth/magic-link
2. Server creates one-time JWT (15min expiry), stores in DB
3. Returns magic link URL (in dev: logs to console)
4. User clicks link → GET /api/auth/verify-magic?token=xxx
5. Server validates one-time token, exchanges for session JWT
"""

from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from app.core.config import settings


def generate_magic_token(email: str) -> str:
    """Generate a one-time magic link JWT (valid 15 minutes)."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    payload = {
        "sub": email,
        "type": "magic_link",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_magic_token(token: str) -> str | None:
    """
    Verify a magic link token.
    Returns the email if valid, None if expired/invalid.
    """
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        if payload.get("type") != "magic_link":
            return None
        return payload.get("sub")
    except JWTError:
        return None


def build_magic_link(token: str, base_url: str = "") -> str:
    """Build the full magic link URL."""
    if not base_url:
        base_url = "http://localhost:5173"
    return f"{base_url}/auth/verify-magic?token={token}"

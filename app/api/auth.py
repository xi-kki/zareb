from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, field_validator
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token, validate_password_strength
from app.models.user import User
from app.services.magic_link import generate_magic_token, verify_magic_token, build_magic_link
from app.services.captcha_service import verify_captcha
from app.services.email_service import send_magic_link_email
import re

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

# In-memory rate limiting (simple sliding window)
_RATE_LIMIT_CACHE: dict[str, list[float]] = {}
_RATE_LIMIT_WINDOW = 60  # 60 seconds
_RATE_LIMIT_MAX = 10  # max 10 requests per window

def _check_rate_limit(key: str) -> bool:
    """Check if request exceeds rate limit. Returns True if allowed."""
    import time
    now = time.time()
    if key not in _RATE_LIMIT_CACHE:
        _RATE_LIMIT_CACHE[key] = []
    # Clean old entries
    _RATE_LIMIT_CACHE[key] = [t for t in _RATE_LIMIT_CACHE[key] if now - t < _RATE_LIMIT_WINDOW]
    if len(_RATE_LIMIT_CACHE[key]) >= _RATE_LIMIT_MAX:
        return False
    _RATE_LIMIT_CACHE[key].append(now)
    return True


class RegisterRequest(BaseModel):
    email: str
    password: str
    company_name: str = ""
    country: str = "Other"
    export_market: str = "EU"
    captcha_token: str = ""  # Google reCAPTCHA v3 token

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Strict email validation using regex."""
        pattern = r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
        if not re.match(pattern, v.strip()):
            raise ValueError("Invalid email format")
        return v.strip().lower()

    @field_validator("export_market")
    @classmethod
    def validate_market(cls, v: str) -> str:
        if v not in ("EU", "UK", "Both"):
            raise ValueError("export_market must be EU, UK, or Both")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    user: dict


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Rate limit by IP
    if not _check_rate_limit(f"register:{request.email}"):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many requests. Please wait.")

    # Verify CAPTCHA
    captcha_valid = await verify_captcha(request.captcha_token)
    if not captcha_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="CAPTCHA verification failed. Please try again.")

    # Validate password strength
    pwd_error = validate_password_strength(request.password)
    if pwd_error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=pwd_error)

    # Check if email already exists
    result = await db.execute(select(User).where(User.email == request.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # Create user
    user = User(
        email=request.email,
        hashed_password=get_password_hash(request.password),
        company_name=request.company_name,
        country=request.country,
        export_market=request.export_market,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Generate token
    access_token = create_access_token(data={"sub": str(user.id)})
    return AuthResponse(access_token=access_token, user=user.to_dict())


@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Rate limit by IP
    if not _check_rate_limit(f"login:{request.email}"):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many attempts. Please wait.")

    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "user": user.to_dict()}


@router.get("/me", response_model=dict)
async def get_me(user: User = Depends(get_current_user)):
    return user.to_dict()


class UpdateProfileRequest(BaseModel):
    company_name: str = ""
    country: str = "Other"
    export_market: str = "EU"

    @field_validator("export_market")
    @classmethod
    def validate_market(cls, v: str) -> str:
        if v not in ("EU", "UK", "Both"):
            raise ValueError("export_market must be EU, UK, or Both")
        return v


@router.patch("/me")
async def update_profile(
    request: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update user profile (company name, country, export market)."""
    user.company_name = request.company_name
    user.country = request.country
    user.export_market = request.export_market
    await db.commit()
    await db.refresh(user)
    return user.to_dict()


class MagicLinkRequest(BaseModel):
    email: str


class MagicLinkResponse(BaseModel):
    message: str
    link: str
    expires_in: str


@router.post("/magic-link")
async def request_magic_link(
    request: MagicLinkRequest,
    db: AsyncSession = Depends(get_db),
):
    """Request a magic link for passwordless login."""
    # Rate limit by IP
    if not _check_rate_limit(f"magic:{request.email}"):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many requests. Please wait.")

    # Check if email exists — if not, silently respond (don't reveal if registered)
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if user:
        # Generate one-time magic token
        token = generate_magic_token(request.email)
        # Use frontend URL for the magic link
        frontend_url = os.getenv("SITE_URL", "https://zareb.netlify.app")
        link = build_magic_link(token, base_url=frontend_url)
        
        # Send email via SendGrid (falls back to console)
        sent = send_magic_link_email(request.email, link)
        
        if sent:
            return MagicLinkResponse(
                message="Magic link sent! Check your email.",
                link=link if settings.DEBUG else "",
                expires_in="15 minutes",
            )
        else:
            return MagicLinkResponse(
                message="Could not send email. Please try again.",
                link="",
                expires_in="",
            )
    else:
        # Don't reveal if email exists — but for UX, still show success
        return MagicLinkResponse(
            message="If this email is registered, a magic link has been sent.",
            link="",
            expires_in="15 minutes",
        )


@router.get("/verify-magic")
async def verify_magic(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """Verify a magic link token and return an auth JWT."""
    email = verify_magic_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired magic link. Please request a new one.",
        )

    # Find user by email
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found. Please register first.",
        )

    # Generate session JWT
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "user": user.to_dict()}

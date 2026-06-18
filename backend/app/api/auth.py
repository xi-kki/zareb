from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token, validate_password_strength
from app.models.user import User
from app.services.magic_link import generate_magic_token, verify_magic_token, build_magic_link

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()


class RegisterRequest(BaseModel):
    email: str
    password: str
    company_name: str = ""
    country: str = "Other"
    export_market: str = "EU"


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
    # Validate password strength
    pwd_error = validate_password_strength(request.password)
    if pwd_error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=pwd_error)

    # Validate email format (basic check)
    if "@" not in request.email or "." not in request.email.split("@")[-1]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email format")

    # Check if email already exists
    result = await db.execute(select(User).where(User.email == request.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # Validate export_market
    if request.export_market not in ("EU", "UK", "Both"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="export_market must be EU, UK, or Both")

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
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "user": user.to_dict()}


@router.get("/me", response_model=dict)
async def get_me(user: User = Depends(get_current_user)):
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
    # Check if email exists — if not, silently respond (don't reveal if registered)
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if user:
        # Generate one-time magic token
        token = generate_magic_token(request.email)
        link = build_magic_link(token)
        print(f"[Nuri] Magic link for {request.email}: {link}")
        return MagicLinkResponse(
            message="Magic link sent! Check your email (or server console in dev mode).",
            link=link,
            expires_in="15 minutes",
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

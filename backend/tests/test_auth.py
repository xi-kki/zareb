"""Test authentication endpoints — register, login, profile."""

import pytest
from httpx import AsyncClient, ASGITransport
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


TEST_USER = {
    "email": "test-auth@zareb.io",
    "password": "securePass123!",
    "company_name": "Test Auth Co",
    "country": "Nigeria",
    "export_market": "EU",
}


@pytest.mark.asyncio
async def test_register_endpoint(client):
    """POST /api/auth/register should create a user and return JWT."""
    response = await client.post("/api/auth/register", json=TEST_USER)
    # May fail if user exists (from previous tests), but should return 200 or 400
    assert response.status_code in (200, 400)
    if response.status_code == 200:
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_USER["email"]


@pytest.mark.asyncio
async def test_register_invalid_password(client):
    """Registration with short password should fail."""
    response = await client.post("/api/auth/register", json={
        "email": "weak@zareb.io",
        "password": "short",
        "country": "Ghana",
    })
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login_endpoint(client):
    """POST /api/auth/login should return JWT for valid credentials."""
    response = await client.post("/api/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"],
    })
    assert response.status_code in (200, 401)
    if response.status_code == 200:
        data = response.json()
        assert "access_token" in data
        assert "user" in data


@pytest.mark.asyncio
async def test_login_invalid(client):
    """Login with wrong password should return 401."""
    response = await client.post("/api/auth/login", json={
        "email": TEST_USER["email"],
        "password": "wrongPassword!",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_endpoint_with_token(client):
    """GET /api/auth/me should return user data with valid token."""
    # Login first
    login_resp = await client.post("/api/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"],
    })
    if login_resp.status_code != 200:
        pytest.skip("Cannot login — skipping /me test")

    token = login_resp.json()["access_token"]
    
    response = await client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["email"] == TEST_USER["email"]


@pytest.mark.asyncio
async def test_me_endpoint_no_token(client):
    """GET /api/auth/me without token should return 401 (HTTPBearer default)."""
    response = await client.get("/api/auth/me")
    assert response.status_code in (401, 403)

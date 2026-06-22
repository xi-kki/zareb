"""Test the health endpoint and basic app startup."""

import pytest
from httpx import AsyncClient, ASGITransport
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app
from app.core.config import settings


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.asyncio
async def test_health_endpoint(client):
    """The /health endpoint should always respond 200."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "zareb-api"
    assert "version" in data


@pytest.mark.asyncio
async def test_app_title(client):
    """App title should be set."""
    assert settings.APP_NAME == "Zareb API"


@pytest.mark.asyncio
async def test_cors_origins(client):
    """CORS origins should be parseable."""
    origins = settings.cors_origins_list
    assert isinstance(origins, list)
    assert len(origins) > 0
    for origin in origins:
        assert origin.startswith("http")


@pytest.mark.asyncio
async def test_health_returns_json(client):
    """Health endpoint should return proper JSON."""
    response = await client.get("/health")
    assert response.headers["content-type"].startswith("application/json")

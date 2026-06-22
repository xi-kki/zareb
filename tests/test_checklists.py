"""Test checklist and knowledge base endpoints."""

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


@pytest.mark.asyncio
async def test_checklist_haccp(client):
    """GET /api/checklists/HACCP should return HACCP items."""
    response = await client.get("/api/checklists/HACCP")
    assert response.status_code == 200
    data = response.json()
    assert data["standard"] == "HACCP"
    assert len(data["items"]) == 7


@pytest.mark.asyncio
async def test_checklist_fsma(client):
    """GET /api/checklists/FSMA should return FSMA items."""
    response = await client.get("/api/checklists/FSMA")
    assert response.status_code == 200
    data = response.json()
    assert data["standard"] == "FSMA"
    assert len(data["items"]) > 0


@pytest.mark.asyncio
async def test_checklist_fda_eu(client):
    """GET /api/checklists/FDA_EU should return EU items."""
    response = await client.get("/api/checklists/FDA_EU")
    assert response.status_code == 200
    data = response.json()
    assert data["standard"] == "FDA_EU"
    assert len(data["items"]) == 10


@pytest.mark.asyncio
async def test_checklist_invalid_standard(client):
    """GET /api/checklists/INVALID should return 404."""
    response = await client.get("/api/checklists/INVALID")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_knowledge_stats(client):
    """GET /api/knowledge/stats should return knowledge base stats."""
    response = await client.get("/api/knowledge/stats")
    assert response.status_code == 200
    data = response.json()
    assert "chunks" in data
    assert "sources" in data
    assert "status" in data

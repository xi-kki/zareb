"""
RAG Knowledge Base Search API — search food safety regulations.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.services.rag_service import rag

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])


class SearchResult(BaseModel):
    text: str
    source: str
    score: float


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResult]
    total: int


@router.get("/search", response_model=SearchResponse)
async def search_knowledge(
    q: str = Query(..., description="Search query about food safety regulations"),
    top_k: int = Query(5, ge=1, le=20, description="Number of results to return"),
):
    """Search the food safety regulation knowledge base."""
    rag.initialize()
    results = rag.search(q, top_k=top_k)
    return SearchResponse(
        query=q,
        results=[SearchResult(**r) for r in results],
        total=len(results),
    )


@router.get("/stats")
async def knowledge_stats():
    """Get knowledge base statistics."""
    rag.initialize()
    if not rag.chunks:
        return {"chunks": 0, "sources": [], "status": "empty"}
    
    sources = list(set(c["source"] for c in rag.chunks))
    return {
        "chunks": len(rag.chunks),
        "sources": sources,
        "status": "loaded",
    }

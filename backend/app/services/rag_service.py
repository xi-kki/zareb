"""
RAG Knowledge Base — TF-IDF semantic search over food safety regulations.

Seeded with:
- EU Regulation 1169/2011 (food labeling)
- BRCGS Issue 9 (food safety standard)
- NAFDAC rules (Nigeria) + KEBS (Kenya)

Usage:
    from app.services.rag_service import rag
    chunks = rag.search("allergen labeling EU requirements")
    # chunks = [{"text": "...", "score": 0.85, "source": "EU_Reg_1169_2011"}, ...]
"""

import os
import re
import json
import pickle
from pathlib import Path
from typing import Optional

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


KNOWLEDGE_DIR = Path(__file__).resolve().parent.parent / "knowledge_data"
CACHE_FILE = KNOWLEDGE_DIR / ".rag_cache.pkl"


def _chunk_text(text: str, source: str, chunk_size: int = 500, overlap: int = 100) -> list[dict]:
    """Split text into overlapping chunks with source tracking."""
    paragraphs = re.split(r'\n\s*\n', text)
    chunks = []
    current = ""
    current_count = 0
    
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        words = para.split()
        
        if current_count + len(words) > chunk_size and current:
            chunks.append({"text": current.strip(), "source": source})
            # Keep overlap words
            overlap_words = current.split()[-overlap:] if overlap > 0 else []
            current = " ".join(overlap_words) + " " if overlap_words else ""
            current_count = len(overlap_words)
        
        current += " " + para
        current_count += len(words)
    
    if current.strip():
        chunks.append({"text": current.strip(), "source": source})
    
    return chunks


class RAGKnowledgeBase:
    """Lightweight RAG using TF-IDF vector similarity."""

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words="english",
            ngram_range=(1, 2),
            lowercase=True,
            strip_accents="unicode",
        )
        self.chunks: list[dict] = []
        self._tfidf_matrix = None
        self._loaded = False

    def _load_seed_files(self) -> list[dict]:
        """Load and chunk all knowledge base text files."""
        all_chunks = []
        if not KNOWLEDGE_DIR.exists():
            print(f"[RAG] Knowledge directory not found: {KNOWLEDGE_DIR}")
            return all_chunks

        for fpath in sorted(KNOWLEDGE_DIR.glob("*.txt")):
            if fpath.name.startswith("."):
                continue
            try:
                text = fpath.read_text(encoding="utf-8")
                source = fpath.stem
                file_chunks = _chunk_text(text, source)
                all_chunks.extend(file_chunks)
                print(f"[RAG] Loaded {len(file_chunks)} chunks from {fpath.name}")
            except Exception as e:
                print(f"[RAG] Error loading {fpath.name}: {e}")

        return all_chunks

    def initialize(self, force: bool = False):
        """Build the TF-IDF index. Caches to disk for fast reload."""
        if self._loaded and not force:
            return

        # Try loading from cache
        if not force and CACHE_FILE.exists():
            try:
                with open(CACHE_FILE, "rb") as f:
                    data = pickle.load(f)
                self.chunks = data["chunks"]
                self.vectorizer = data["vectorizer"]
                self._tfidf_matrix = data["matrix"]
                self._loaded = True
                print(f"[RAG] Loaded {len(self.chunks)} chunks from cache")
                return
            except Exception as e:
                print(f"[RAG] Cache load failed: {e}")

        # Build from seed files
        self.chunks = self._load_seed_files()
        if not self.chunks:
            print("[RAG] WARNING: No knowledge chunks loaded!")
            self._loaded = True
            return

        texts = [c["text"] for c in self.chunks]
        self._tfidf_matrix = self.vectorizer.fit_transform(texts)
        self._loaded = True

        # Cache to disk
        try:
            with open(CACHE_FILE, "wb") as f:
                pickle.dump({
                    "chunks": self.chunks,
                    "vectorizer": self.vectorizer,
                    "matrix": self._tfidf_matrix,
                }, f)
            print(f"[RAG] Cached {len(self.chunks)} chunks to {CACHE_FILE}")
        except Exception as e:
            print(f"[RAG] Cache write failed: {e}")

        print(f"[RAG] Index built with {len(self.chunks)} chunks, {self._tfidf_matrix.shape[1]} features")

    def search(self, query: str, top_k: int = 5, min_score: float = 0.05) -> list[dict]:
        """Search the knowledge base. Returns top-k chunks with relevance scores."""
        if not self._loaded:
            self.initialize()
        if not self.chunks or self._tfidf_matrix is None:
            return []

        query_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vec, self._tfidf_matrix).flatten()
        
        top_indices = scores.argsort()[::-1][:top_k]
        results = []
        for idx in top_indices:
            if scores[idx] >= min_score:
                results.append({
                    "text": self.chunks[idx]["text"],
                    "source": self.chunks[idx]["source"],
                    "score": round(float(scores[idx]), 4),
                })
        return results

    def enrich_prompt(self, query: str, max_chars: int = 3000) -> str:
        """Enrich a prompt with relevant regulation context."""
        results = self.search(query, top_k=5)
        if not results:
            return ""
        
        context_parts = ["=== RELEVANT REGULATION CONTEXT ==="]
        total_chars = 0
        for r in results:
            entry = f"\n[{r['source']}] (relevance: {r['score']:.2f})\n{r['text']}\n"
            if total_chars + len(entry) > max_chars:
                break
            context_parts.append(entry)
            total_chars += len(entry)
        
        return "\n".join(context_parts)


# Singleton
rag = RAGKnowledgeBase()

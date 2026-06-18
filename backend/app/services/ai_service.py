"""
AI Service — Multi-provider support for Nuri compliance analysis.

Supports:
- Grok (xAI) — OpenAI-compatible API, free tier available
- Claude (Anthropic) — fallback option
"""

import json
import os
from typing import AsyncGenerator, Optional

from app.core.config import settings
from app.services.rag_service import rag

# ──────────────────────────────────────────────
# System Prompts (shared across providers)
# ──────────────────────────────────────────────

def _build_rag_prompt(standard: str) -> str:
    """Build system prompt enriched with RAG context from the knowledge base."""
    rag.initialize()
    rag_context = rag.enrich_prompt(food_safety_compliance_rag_query_for(standard))
    return SYSTEM_PROMPT.replace("{rag_context}", rag_context)


def food_safety_compliance_rag_query_for(standard: str) -> str:
    """Generate a search query for the RAG knowledge base based on the standard."""
    standard_lower = standard.lower()
    if standard_lower == "haccp":
        return "HACCP principles hazard analysis critical control points food safety plan"
    elif standard_lower == "fsma":
        return "FSMA preventive controls food safety modernization act traceability supplier verification"
    elif standard_lower in ("brcgs", "brc"):
        return "BRCGS Issue 9 food safety standard management commitment site standards audit"
    elif standard_lower == "sqf":
        return "SQF safe quality food safety plan food safety culture site conformity"
    elif standard_lower == "iso22000":
        return "ISO 22000 food safety management system HACCP prerequisite programmes traceability"
    elif standard_lower == "nafdac":
        return "NAFDAC Nigeria food labeling registration requirements ingredients list"
    elif standard_lower == "kebs":
        return "KEBS Kenya Bureau of Standards food labeling standardization mark"
    elif standard_lower in ("fda_eu", "eu"):
        return "EU Regulation 1169/2011 food labeling allergens nutritional declaration country of origin"
    else:
        return f"{standard} food safety compliance regulations requirements"


SYSTEM_PROMPT = """You are Nuri, an expert AI food safety compliance auditor with 20 years of experience auditing food manufacturers in Africa, EU, and UK markets. You specialize in HACCP, FSMA, SQF, BRCGS, ISO 22000, NAFDAC (Nigeria), KEBS (Kenya), and FDA EU regulations.

## KNOWLEDGE BASE

### HACCP 7 PRINCIPLES (must check all 7 are addressed)
1. Conduct hazard analysis
2. Identify Critical Control Points (CCPs)
3. Establish critical limits
4. Establish monitoring procedures
5. Establish corrective actions
6. Establish verification procedures
7. Establish record-keeping and documentation

### FSMA KEY REQUIREMENTS
- Preventive Controls for Human Food rule
- Food Traceability Rule (FSMA 204) - deadline 2028
- Supplier verification programs
- Environmental monitoring programs

### BRCGS ISSUE 9 KEY SECTIONS
- Senior management commitment
- Food safety plan (HACCP)
- Food safety and quality management system
- Site standards
- Product control
- Process control
- Personnel

### NAFDAC TO EU/UK COMMON GAPS (Africa-specific)
- Allergen labeling (EU requires 14 major allergens declared)
- Nutritional information per 100g (EU mandatory)
- Country of origin labeling
- Best before vs use by distinction
- Additive E-numbers vs natural equivalents
- Traceability lot codes on packaging
- Responsible person in EU/UK requirement post-Brexit

### ANALYSIS RULES
When analyzing a compliance document, you must:
1. IDENTIFY the document type and what standard it should comply with
2. SCORE it 0-100 based on completeness and compliance
3. FIND specific gaps -- exact missing sections, missing data fields, unclear language
4. FLAG critical issues that would cause immediate audit failure (label these CRITICAL)
5. FLAG moderate issues that need fixing (MODERATE)
6. FLAG minor improvements (MINOR)
7. GIVE specific, actionable recommendations with example language the founder can copy-paste
8. HIGHLIGHT Africa-to-EU/UK export specific requirements they commonly miss

Always respond in this exact JSON format. Use the provided regulation context below to give accurate, specific, regulation-backed guidance.

Regulation context:
{rag_context}
{
  "overall_score": <0-100>,
  "document_summary": "<2 sentences>",
  "standard_assessed": "<standard name>",
  "gaps_found": [
    {
      "severity": "CRITICAL|MODERATE|MINOR",
      "section": "<section name>",
      "issue": "<specific problem>",
      "fix": "<exact action to take>"
    }
  ],
  "critical_issues": ["<issue 1>", "<issue 2>"],
  "recommendations": [
    {
      "title": "<recommendation title>",
      "detail": "<specific steps>",
      "example_language": "<copy-paste text if applicable>"
    }
  ],
  "export_specific_notes": "<Africa to EU/UK specific flags>",
  "audit_readiness": "NOT READY|NEEDS WORK|MOSTLY READY|AUDIT READY"
}"""

CHAT_SYSTEM_PROMPT = """You are Nuri, a food safety compliance expert. The user has just received a compliance report. Answer their questions clearly and specifically. If they ask about fixing a specific gap, give them exact template language they can use."""


# ──────────────────────────────────────────────
# Groq Provider (groq.com — free, OpenAI-compatible)
# ──────────────────────────────────────────────

class GroqProvider:
    """Provider using Groq's free API (groq.com). Uses httpx directly to avoid broken openai/aiohttp deps."""

    def __init__(self):
        import httpx
        api_key = os.getenv("GROQ_API_KEY") or settings.GROQ_API_KEY or ""
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY is not set. "
                "Get your free key at https://console.groq.com"
            )
        self._api_key = api_key
        self._client = httpx.AsyncClient(
            base_url="https://api.groq.com/openai/v1",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            timeout=httpx.Timeout(60.0, connect=10.0),
        )
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    async def analyze_document(self, parsed_text: str, standard: str) -> dict:
        """Send document text to Groq and get structured compliance analysis, enriched with RAG context."""
        try:
            # Build RAG-enriched system prompt
            rag.initialize()
            rag_context = rag.enrich_prompt(food_safety_compliance_rag_query_for(standard))
            enriched_prompt = SYSTEM_PROMPT.replace("{rag_context}", rag_context)
            
            response = await self._client.post("/chat/completions", json={
                "model": self.model,
                "max_tokens": settings.AI_MAX_TOKENS,
                "temperature": 0.1,
                "messages": [
                    {"role": "system", "content": enriched_prompt},
                    {
                        "role": "user",
                        "content": (
                            f"Please analyze this {standard} compliance document:\n\n"
                            f"{parsed_text[:50000]}\n\n"
                            f"Target standard: {standard}"
                        ),
                    },
                ],
            })
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"] or "{}"
            return self._parse_json(content, standard)
        except Exception as e:
            raise RuntimeError(f"Groq API error: {str(e)}")

    async def chat_stream(
        self, message: str, report_context: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Stream a chat response from Groq."""
        context = ""
        if report_context:
            context = f"\n\nRelevant report context:\n{report_context[:10000]}"

        messages = [
            {"role": "system", "content": CHAT_SYSTEM_PROMPT},
            {"role": "user", "content": f"{message}{context}"},
        ]

        async with self._client.stream("POST", "/chat/completions", json={
            "model": self.model,
            "max_tokens": 1000,
            "temperature": 0.3,
            "messages": messages,
            "stream": True,
        }) as stream:
            async for line in stream.aiter_lines():
                if line.startswith("data: "):
                    chunk_data = line[6:].strip()
                    if chunk_data == "[DONE]":
                        break
                    if chunk_data:
                        try:
                            chunk = json.loads(chunk_data)
                            delta = chunk["choices"][0].get("delta", {})
                            if "content" in delta and delta["content"]:
                                yield delta["content"]
                        except (json.JSONDecodeError, KeyError):
                            continue

    def _parse_json(self, content: str, standard: str) -> dict:
        """Extract JSON from Groq response."""
        try:
            if "{" in content:
                json_start = content.index("{")
                json_end = content.rindex("}") + 1
                json_str = content[json_start:json_end]
                return json.loads(json_str)
            return json.loads(content)
        except (json.JSONDecodeError, ValueError):
            return {
                "overall_score": 0,
                "document_summary": "Error parsing AI response.",
                "standard_assessed": standard,
                "gaps_found": [],
                "critical_issues": [f"Analysis parsing failed"],
                "recommendations": [],
                "export_specific_notes": "",
                "audit_readiness": "NOT READY",
            }


# ──────────────────────────────────────────────
# Claude Provider (Anthropic — fallback)
# ──────────────────────────────────────────────

class ClaudeProvider:
    """Provider using Anthropic's Claude API (fallback option)."""

    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY") or settings.ANTHROPIC_API_KEY or ""
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY is not set")

        try:
            import anthropic
            self.client = anthropic.Anthropic(api_key=api_key)
        except ImportError:
            raise RuntimeError("The 'anthropic' package is required for Claude. Run: pip install anthropic")

        self.model = os.getenv("CLAUDE_MODEL", settings.CLAUDE_MODEL)

    async def analyze_document(self, parsed_text: str, standard: str) -> dict:
        """Send document text to Claude and get structured compliance analysis with RAG context."""
        try:
            rag.initialize()
            rag_context = rag.enrich_prompt(food_safety_compliance_rag_query_for(standard))
            enriched_prompt = SYSTEM_PROMPT.replace("{rag_context}", rag_context)
            response = self.client.messages.create(
                model=self.model,
                max_tokens=settings.AI_MAX_TOKENS,
                system=enriched_prompt,
                messages=[
                    {
                        "role": "user",
                        "content": (
                            f"Please analyze this {standard} compliance document:\n\n"
                            f"{parsed_text[:50000]}\n\n"
                            f"Target standard: {standard}"
                        ),
                    }
                ],
            )
            content = response.content[0].text if response.content else "{}"
            return self._parse_json(content, standard)
        except Exception as e:
            raise RuntimeError(f"Claude API error: {str(e)}")

    async def chat_stream(
        self, message: str, report_context: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Stream a chat response from Claude."""
        context = ""
        if report_context:
            context = f"\n\nRelevant report context:\n{report_context[:10000]}"

        with self.client.messages.stream(
            model=self.model,
            max_tokens=1000,
            system=CHAT_SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"{message}{context}",
                }
            ],
        ) as stream:
            for text in stream.text_stream:
                yield text

    def _parse_json(self, content: str, standard: str) -> dict:
        """Extract JSON from Claude response."""
        try:
            if "{" in content:
                json_start = content.index("{")
                json_end = content.rindex("}") + 1
                json_str = content[json_start:json_end]
                return json.loads(json_str)
            return json.loads(content)
        except (json.JSONDecodeError, ValueError):
            return {
                "overall_score": 0,
                "document_summary": "Error parsing AI response.",
                "standard_assessed": standard,
                "gaps_found": [],
                "critical_issues": [f"Analysis parsing failed"],
                "recommendations": [],
                "export_specific_notes": "",
                "audit_readiness": "NOT READY",
            }


# ──────────────────────────────────────────────
# Mock Provider (for local dev without API keys)
# ──────────────────────────────────────────────

class MockProvider:
    """Mock provider for local development without API keys."""

    async def analyze_document(self, parsed_text: str, standard: str) -> dict:
        """Return a mock compliance report."""
        word_count = len(parsed_text.split())
        return {
            "overall_score": 65,
            "document_summary": f"This is a mock analysis of your {standard} document. It contains approximately {word_count} words. Configure XAI_API_KEY in your .env file for real AI analysis.",
            "standard_assessed": standard,
            "gaps_found": [
                {
                    "severity": "CRITICAL",
                    "section": "Hazard Analysis",
                    "issue": "No biological hazard assessment found (mock)",
                    "fix": "Add a detailed biological hazard analysis covering pathogens relevant to your product category"
                },
                {
                    "severity": "MODERATE",
                    "section": "Allergen Labeling",
                    "issue": "EU 14 major allergens not declared (mock)",
                    "fix": "Declare all 14 EU major allergens on your label: cereals, crustaceans, eggs, fish, peanuts, soybeans, milk, nuts, celery, mustard, sesame, sulphur dioxide, lupin, molluscs"
                },
                {
                    "severity": "MINOR",
                    "section": "Documentation",
                    "issue": "Version control not clearly indicated (mock)",
                    "fix": "Add document version number, revision date, and approval signature to all pages"
                }
            ],
            "critical_issues": ["Hazard analysis missing biological hazards (mock)", "No traceability lot code system documented (mock)"],
            "recommendations": [
                {
                    "title": "Set up XAI_API_KEY for real analysis",
                    "detail": "Go to https://console.x.ai, create a free account, get your API key and add it to backend/.env as XAI_API_KEY=xai-...",
                    "example_language": "XAI_API_KEY=xai-your-key-here"
                },
                {
                    "title": "Complete your HACCP plan - Principle 1: Hazard Analysis",
                    "detail": "List all biological, chemical, and physical hazards for each step of your process",
                    "example_language": "Hazard: Salmonella (biological)\nSource: Raw poultry\nControl: Cooking to 74°C internal temp\nPreventive Measure: CCP with critical limit of 74°C for 15 seconds"
                }
            ],
            "export_specific_notes": "This is a mock analysis. For real Africa-to-EU/UK export compliance checking, configure your GROQ_API_KEY in .env. Get a free key at https://console.groq.com. Common EU requirements: EU 14 allergens, nutritional table per 100g, best-before dating, responsible person in EU, product traceability lot codes.",
            "audit_readiness": "NEEDS WORK"
        }

    async def chat_stream(
        self, message: str, report_context: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Return a mock streaming response."""
        mock_response = (
            "I'm running in mock mode because no API key is configured. "
            "To get real AI-powered analysis, set your GROQ_API_KEY in the .env file. "
            "Get a free key at https://console.groq.com. "
            f"\n\nYou asked: \"{message}\""
        )
        if report_context:
            mock_response += f"\n\nReport context loaded: {report_context[:100]}..."
        for word in mock_response.split():
            yield word + " "


# ──────────────────────────────────────────────
# Factory — picks provider based on config & key availability
# ──────────────────────────────────────────────

class AIService:
    """Unified AI service that delegates to configured provider."""

    def __init__(self):
        provider = (os.getenv("AI_PROVIDER") or settings.AI_PROVIDER or "grok").lower()

        if provider == "groq":
            if os.getenv("GROQ_API_KEY") or settings.GROQ_API_KEY:
                try:
                    self._provider = GroqProvider()
                    print(f"[Nuri] AI provider: GROQ (groq.com - free)")
                    return
                except Exception as e:
                    print(f"[Nuri] Groq init failed: {e}")
            print("[Nuri] No GROQ_API_KEY set, trying Claude...")

        if provider == "claude" or not os.getenv("GROQ_API_KEY"):
            if os.getenv("ANTHROPIC_API_KEY") or settings.ANTHROPIC_API_KEY:
                try:
                    self._provider = ClaudeProvider()
                    print(f"[Nuri] AI provider: CLAUDE (Anthropic)")
                    return
                except Exception as e:
                    print(f"[Nuri] Claude init failed: {e}")

        # No API keys available — use mock provider
        print("[Nuri] WARNING: No AI API keys found. Using MOCK provider for development.")
        print("[Nuri] Set GROQ_API_KEY in .env for real AI analysis")
        self._provider = MockProvider()

    async def analyze_document(self, parsed_text: str, standard: str) -> dict:
        return await self._provider.analyze_document(parsed_text, standard)

    async def chat_stream(
        self, message: str, report_context: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        async for token in self._provider.chat_stream(message, report_context):
            yield token


# Singleton
ai_service = AIService()

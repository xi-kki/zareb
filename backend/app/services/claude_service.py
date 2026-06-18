import anthropic
import json
from typing import AsyncGenerator, Optional
from app.core.config import settings

SYSTEM_PROMPT = """You are Nuri, an expert AI food safety compliance auditor with 20 years of experience auditing food manufacturers in Africa, EU, and UK markets. You specialize in HACCP, FSMA, SQF, BRCGS, ISO 22000, NAFDAC (Nigeria), KEBS (Kenya), and FDA EU regulations.

When analyzing a compliance document, you must:
1. IDENTIFY the document type and what standard it should comply with
2. SCORE it 0-100 based on completeness and compliance
3. FIND specific gaps -- exact missing sections, missing data fields, unclear language
4. FLAG critical issues that would cause immediate audit failure (label these CRITICAL)
5. FLAG moderate issues that need fixing (MODERATE)
6. FLAG minor improvements (MINOR)
7. GIVE specific, actionable recommendations with example language the founder can copy-paste
8. HIGHLIGHT Africa-to-EU/UK export specific requirements they commonly miss

Always respond in this exact JSON format:
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


class ClaudeService:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def analyze_document(self, parsed_text: str, standard: str) -> dict:
        """Send document text to Claude and get structured compliance analysis."""
        try:
            response = self.client.messages.create(
                model=settings.CLAUDE_MODEL,
                max_tokens=settings.CLAUDE_MAX_TOKENS,
                system=SYSTEM_PROMPT,
                messages=[
                    {
                        "role": "user",
                        "content": f"Please analyze this {standard} compliance document:\n\n{parsed_text[:50000]}\n\nTarget standard: {standard}",
                    }
                ],
            )
            content = response.content[0].text if response.content else "{}"
            # Extract JSON from response
            if "{" in content:
                json_start = content.index("{")
                json_end = content.rindex("}") + 1
                json_str = content[json_start:json_end]
                return json.loads(json_str)
            return json.loads(content)
        except json.JSONDecodeError as e:
            return {
                "overall_score": 0,
                "document_summary": "Error parsing Claude's response.",
                "standard_assessed": standard,
                "gaps_found": [],
                "critical_issues": [f"Analysis failed: {str(e)}"],
                "recommendations": [],
                "export_specific_notes": "",
                "audit_readiness": "NOT READY",
            }
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
            model=settings.CLAUDE_MODEL,
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


claude_service = ClaudeService()

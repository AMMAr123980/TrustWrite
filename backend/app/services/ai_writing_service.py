import re
import uuid
from typing import List, Dict, Any, Optional
import httpx
from app.schemas.analysis import QuickRewriteResponse, WritingImprovementSuggestion
from app.core.config import settings

class AIWritingService:
    @classmethod
    def generate_heuristic_suggestions(cls, text: str) -> List[WritingImprovementSuggestion]:
        suggestions: List[WritingImprovementSuggestion] = []
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if len(s.strip()) > 15]

        # 1. Identify very long sentences (> 30 words) for clarity/splitting
        for sent in sentences:
            words = sent.split()
            if len(words) > 30:
                half = len(words) // 2
                split_draft = " ".join(words[:half]) + ". Furthermore, " + " ".join(words[half:])
                suggestions.append(WritingImprovementSuggestion(
                    id=f"clarity_{uuid.uuid4().hex[:8]}",
                    category="clarity",
                    original=sent,
                    suggested=split_draft,
                    explanation="This sentence is over 30 words. Splitting it improves flow and prevents reader fatigue.",
                    confidence="high"
                ))

        # 2. Awkward or informal phrasings
        informal_pairs = [
            (r"\bkinda\b", "somewhat", "Replace informal colloquialism 'kinda' with 'somewhat' or 'relatively'."),
            (r"\bsorta\b", "partially", "Replace informal colloquialism 'sorta' with 'partially'."),
            (r"\ba bunch of\b", "several", "Use 'several' or 'numerous' for stronger academic/business tone."),
            (r"\blots of\b", "many", "Replace conversational 'lots of' with 'many' or 'substantial'."),
            (r"\bget rid of\b", "eliminate", "Use 'eliminate' or 'remove' for crisp professional tone."),
            (r"\bgood enough\b", "sufficient", "Replace 'good enough' with 'adequate' or 'sufficient'.")
        ]

        for pattern, replacement, expl in informal_pairs:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                orig_span = match.group(0)
                # find sentence context
                for sent in sentences:
                    if orig_span in sent:
                        new_sent = re.sub(pattern, replacement, sent, flags=re.IGNORECASE)
                        suggestions.append(WritingImprovementSuggestion(
                            id=f"tone_{uuid.uuid4().hex[:8]}",
                            category="tone",
                            original=sent,
                            suggested=new_sent,
                            explanation=expl,
                            confidence="high"
                        ))
                        break

        return suggestions[:6]

    @classmethod
    async def rewrite_text(cls, text: str, instruction: str = "professional") -> QuickRewriteResponse:
        instruction_lower = instruction.lower()
        
        # If OpenAI key is present, try LLM for advanced rewrites
        if settings.OPENAI_API_KEY:
            try:
                system_prompt = (
                    "You are TrustWrite AI Writing Assistant. Rewrite the user's text following the requested style: "
                    f"'{instruction}'. Maintain the core meaning and facts. Return only the revised text."
                )
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                        json={
                            "model": "gpt-4o-mini",
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": text}
                            ],
                            "temperature": 0.3
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        revised_output = data["choices"][0]["message"]["content"].strip()
                        return QuickRewriteResponse(
                            original=text,
                            revised=revised_output,
                            changes_made=[f"Applied {instruction} styling via AI Assistant", "Enhanced cadence and clarity"],
                            explanation=f"Rewrote content with a focus on {instruction} tone and clarity."
                        )
            except Exception:
                pass # Fallback to deterministic rewrite engine

        # High quality deterministic / rule-based rewrites
        revised = text
        changes: List[str] = []

        if instruction_lower in ["professional", "formal"]:
            replacements = {
                r"\bcan't\b": "cannot",
                r"\bdon't\b": "do not",
                r"\bwon't\b": "will not",
                r"\bit's\b": "it is",
                r"\bkinda\b": "somewhat",
                r"\bsorta\b": "moderately",
                r"\ba bunch of\b": "a substantial number of",
                r"\blots of\b": "numerous",
                r"\bget rid of\b": "eliminate",
                r"\bmake sure\b": "ensure",
                r"\blook into\b": "investigate",
                r"\bcome up with\b": "develop",
                r"\bbig\b": "significant",
                r"\bgood\b": "effective"
            }
            for pat, rep in replacements.items():
                if re.search(pat, revised, re.IGNORECASE):
                    revised = re.sub(pat, rep, revised, flags=re.IGNORECASE)
                    changes.append(f"Formalized terminology: '{pat[2:-2]}' -> '{rep}'")
            explanation = "Elevated formal vocabulary, eliminated conversational contractions, and sharpened tone."

        elif instruction_lower == "concise":
            replacements = {
                r"\bin order to\b": "to",
                r"\bdue to the fact that\b": "because",
                r"\bat this point in time\b": "currently",
                r"\bfor the purpose of\b": "for",
                r"\bin the event that\b": "if",
                r"\bwith the exception of\b": "except",
                r"\bin close proximity to\b": "near",
                r"\ba large number of\b": "many",
                r"\bboth of these\b": "both",
                r"\butilize\b": "use"
            }
            for pat, rep in replacements.items():
                if re.search(pat, revised, re.IGNORECASE):
                    revised = re.sub(pat, rep, revised, flags=re.IGNORECASE)
                    changes.append(f"Trimmed wordiness: '{pat[2:-2]}' -> '{rep}'")
            explanation = "Stripped filler phrases and tightened sentence structure without loss of substance."

        elif instruction_lower == "simplify":
            replacements = {
                r"\bcommence\b": "start",
                r"\bterminate\b": "end",
                r"\bfacilitate\b": "help",
                r"\bimplement\b": "carry out",
                r"\bexpeditiously\b": "quickly",
                r"\bsubsequently\b": "later",
                r"\bdemonstrate\b": "show",
                r"\bascertain\b": "find out"
            }
            for pat, rep in replacements.items():
                if re.search(pat, revised, re.IGNORECASE):
                    revised = re.sub(pat, rep, revised, flags=re.IGNORECASE)
                    changes.append(f"Simplified complex term: '{pat[2:-2]}' -> '{rep}'")
            explanation = "Replaced jargon and archaic words with direct, accessible language."

        elif instruction_lower == "summarize":
            # Extract key 2-3 sentences based on transition/summary markers
            sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
            if len(sentences) > 3:
                revised = " ".join([sentences[0], sentences[len(sentences)//2], sentences[-1]])
            else:
                revised = text
            changes.append("Distilled core premise, supporting argument, and conclusion.")
            explanation = "Extracted central thesis and concluding remarks."
        else:
            explanation = "Refined clarity and flow."

        if not changes:
            changes.append("Text is already well aligned with the selected target profile.")

        return QuickRewriteResponse(
            original=text,
            revised=revised,
            changes_made=changes,
            explanation=explanation
        )

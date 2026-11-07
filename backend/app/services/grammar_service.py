import re
import uuid
from typing import List, Optional
import httpx
from app.schemas.analysis import WritingFinding, TextLocation
from app.core.config import settings

COMMON_RULES = [
    # Subject-verb agreement
    (
        r"\b(he|she|it)\s+don't\b",
        "doesn't",
        "grammar",
        "Subject-verb agreement error",
        "Use 'doesn't' with third-person singular subjects (he, she, it)."
    ),
    (
        r"\b(he|she|it)\s+have\b",
        "has",
        "grammar",
        "Subject-verb agreement error",
        "Use 'has' with third-person singular subjects."
    ),
    (
        r"\b(they|we|you)\s+doesn't\b",
        "don't",
        "grammar",
        "Subject-verb agreement error",
        "Use 'don't' with plural subjects and 'you'."
    ),
    (
        r"\b(they|we|you)\s+has\b",
        "have",
        "grammar",
        "Subject-verb agreement error",
        "Use 'have' with plural subjects and 'you'."
    ),
    # Homophones & Confused Words
    (
        r"\btheir\s+(is|are|was|were)\b",
        "there",
        "word_choice",
        "Confused word: 'their' vs 'there'",
        "'Their' indicates possession. Use 'there' to indicate a location or existential phrase ('there is/are')."
    ),
    (
        r"\byour\s+(welcome|right|wrong|going|doing|invited)\b",
        "you're",
        "word_choice",
        "Contraction error: 'your' vs 'you're'",
        "'Your' is possessive. Use 'you're' (contraction of 'you are')."
    ),
    (
        r"\bits\s+(a|an|the|very|important|obvious|clear|getting|been)\b",
        "it's",
        "punctuation",
        "Apostrophe error: 'its' vs 'it's'",
        "'Its' is possessive. Use 'it's' when you mean 'it is' or 'it has'."
    ),
    (
        r"\bmore\s+then\b",
        "more than",
        "word_choice",
        "Comparative error: 'then' vs 'than'",
        "Use 'than' for comparisons ('more than'). 'Then' refers to time or consequence."
    ),
    (
        r"\bless\s+then\b",
        "less than",
        "word_choice",
        "Comparative error: 'then' vs 'than'",
        "Use 'than' for comparisons ('less than')."
    ),
    (
        r"\balot\b",
        "a lot",
        "spelling",
        "Spelling error: 'alot'",
        "'Alot' is not standard English; write it as two separate words: 'a lot'."
    ),
    (
        r"\bdefinately\b",
        "definitely",
        "spelling",
        "Spelling error: 'definately'",
        "The correct spelling is 'definitely' (from 'finite')."
    ),
    (
        r"\bseperate\b",
        "separate",
        "spelling",
        "Spelling error: 'seperate'",
        "The correct spelling is 'separate' (remember: there is 'a rat' in separate)."
    ),
    (
        r"\boccured\b",
        "occurred",
        "spelling",
        "Spelling error: 'occured'",
        "The past tense of 'occur' doubles the 'r': 'occurred'."
    ),
    (
        r"\baccomodate\b",
        "accommodate",
        "spelling",
        "Spelling error: 'accomodate'",
        "'Accommodate' has two c's and two m's."
    ),
    # Wordiness & Clarity
    (
        r"\bin\s+order\s+to\b",
        "to",
        "clarity",
        "Conciseness recommendation",
        "'In order to' can almost always be simplified to 'to' without changing meaning."
    ),
    (
        r"\bdue\s+to\s+the\s+fact\s+that\b",
        "because",
        "clarity",
        "Wordiness warning",
        "'Due to the fact that' is unnecessarily wordy. Use 'because' or 'since'."
    ),
    (
        r"\bat\s+this\s+point\s+in\s+time\b",
        "now",
        "clarity",
        "Conciseness recommendation",
        "'At this point in time' can be replaced with 'now' or 'currently'."
    ),
    (
        r"\butilize\b",
        "use",
        "word_choice",
        "Plain language recommendation",
        "'Use' is direct, clear, and preferred over 'utilize' in modern professional prose."
    ),
    (
        r"\bin\s+the\s+event\s+that\b",
        "if",
        "clarity",
        "Conciseness recommendation",
        "'In the event that' can be replaced by 'if' for sharper writing."
    ),
    # Double words
    (
        r"\b(the|and|is|in|that|of|to|with)\s+\1\b",
        r"\1",
        "redundancy",
        "Repeated word detected",
        "The word is accidentally duplicated."
    )
]

class GrammarService:
    @classmethod
    def check_text(cls, text: str) -> List[WritingFinding]:
        findings: List[WritingFinding] = []
        if not text.strip():
            return findings

        # 1. Apply Deterministic Linguistic & Spelling Rules
        for pattern, replacement, category, msg, explanation in COMMON_RULES:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                orig_match = match.group(0)
                if orig_match.lower().startswith(("he don't", "she don't", "it don't")):
                    pronoun = orig_match.split()[0]
                    suggested_str = f"{pronoun} doesn't"
                elif orig_match.lower().startswith(("he have", "she have", "it have")):
                    pronoun = orig_match.split()[0]
                    suggested_str = f"{pronoun} has"
                elif orig_match.lower().startswith(("they doesn't", "we doesn't", "you doesn't")):
                    pronoun = orig_match.split()[0]
                    suggested_str = f"{pronoun} don't"
                elif orig_match.lower().startswith(("they has", "we has", "you has")):
                    pronoun = orig_match.split()[0]
                    suggested_str = f"{pronoun} have"
                elif orig_match[0].isupper() and len(replacement) > 0 and not replacement.startswith("\\"):
                    suggested_str = replacement[0].upper() + replacement[1:]
                elif replacement.startswith("\\"):
                    suggested_str = match.group(1)
                else:
                    suggested_str = replacement

                findings.append(WritingFinding(
                    id=f"rule_{uuid.uuid4().hex[:8]}",
                    category=category,
                    original=orig_match,
                    suggestion=suggested_str,
                    message=msg,
                    explanation=explanation,
                    location=TextLocation(
                        start=match.start(),
                        end=match.end()
                    ),
                    confidence="high"
                ))

        # 2. Check for punctuation spacing (e.g. word ,word or word.Word)
        punct_spacing_regex = re.compile(r"([A-Za-z0-9])\s+([,.:;?!])")
        for match in punct_spacing_regex.finditer(text):
            orig_str = match.group(0)
            clean_str = f"{match.group(1)}{match.group(2)}"
            findings.append(WritingFinding(
                id=f"punct_{uuid.uuid4().hex[:8]}",
                category="punctuation",
                original=orig_str,
                suggestion=clean_str,
                message="Unnecessary space before punctuation",
                explanation="Do not place a space immediately before punctuation marks like commas or periods.",
                location=TextLocation(start=match.start(), end=match.end()),
                confidence="high"
            ))

        missing_space_regex = re.compile(r"([,.!?:;])([A-Za-z])")
        for match in missing_space_regex.finditer(text):
            orig_str = match.group(0)
            clean_str = f"{match.group(1)} {match.group(2)}"
            findings.append(WritingFinding(
                id=f"punct_{uuid.uuid4().hex[:8]}",
                category="punctuation",
                original=orig_str,
                suggestion=clean_str,
                message="Missing space after punctuation",
                explanation="Punctuation marks should typically be followed by a space.",
                location=TextLocation(start=match.start(), end=match.end()),
                confidence="high"
            ))

        # Sort findings by starting position
        findings.sort(key=lambda f: f.location.start)
        return findings

    @classmethod
    async def check_with_fallback(cls, text: str) -> List[WritingFinding]:
        """Runs local deterministic checker, and supplements with LanguageTool if available"""
        local_findings = cls.check_text(text)
        
        # If external LanguageTool is specified and accessible, try it
        if settings.LANGUAGETOOL_API_URL and len(text) < 20000:
            try:
                async with httpx.AsyncClient(timeout=3.0) as client:
                    resp = await client.post(
                        settings.LANGUAGETOOL_API_URL,
                        data={"text": text, "language": "en-US"}
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        matches = data.get("matches", [])
                        for m in matches:
                            offset = m.get("offset", 0)
                            length = m.get("length", 0)
                            replacements = m.get("replacements", [])
                            repl_str = replacements[0].get("value") if replacements else ""
                            orig_snippet = text[offset:offset+length]
                            
                            # Avoid duplicate findings at same offset
                            if not any(f.location.start == offset for f in local_findings):
                                cat_rule = m.get("rule", {}).get("issueType", "grammar")
                                if "spell" in cat_rule.lower():
                                    cat = "spelling"
                                elif "style" in cat_rule.lower():
                                    cat = "clarity"
                                else:
                                    cat = "grammar"

                                local_findings.append(WritingFinding(
                                    id=f"lt_{uuid.uuid4().hex[:8]}",
                                    category=cat,
                                    original=orig_snippet,
                                    suggestion=repl_str if repl_str else orig_snippet,
                                    message=m.get("message", "Writing issue"),
                                    explanation=m.get("shortMessage") or m.get("message") or "Suggested correction for grammar and syntax.",
                                    location=TextLocation(start=offset, end=offset + length),
                                    confidence="medium"
                                ))
            except Exception:
                # Silently fallback to our deterministic engine
                pass

        local_findings.sort(key=lambda f: f.location.start)
        return local_findings

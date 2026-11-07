import re
from typing import List, Dict, Any, Tuple, Optional
import httpx
from app.schemas.analysis import CitationReview, CitationItem
from app.core.config import settings

# DOI regex standard: 10.NNNN/...
DOI_REGEX = re.compile(r"\b(10\.\d{4,9}/[-._;()/:A-Za-z0-9]+)\b")
URL_REGEX = re.compile(r"https?://[^\s<>\")]+", re.IGNORECASE)

# In-text APA/MLA citations
# Matches (Smith, 2023), (Smith & Jones, 2021), (Taylor et al., 2020), (Smith, 2019; Davis, 2022)
PAREN_CITATION_REGEX = re.compile(
    r"\(([A-Z][a-zA-Z'’\-]+(?:\s+(?:et\s+al\.|and|&)\s+[A-Z][a-zA-Z'’\-]+)*),\s*(\d{4}[a-z]?)\)",
)

# Narrative citations: Smith (2023), Smith et al. (2020)
NARRATIVE_CITATION_REGEX = re.compile(
    r"\b([A-Z][a-zA-Z'’\-]+(?:\s+et\s+al\.)?)\s+\((\d{4}[a-z]?)\)"
)

BIBLIOGRAPHY_HEADERS = re.compile(
    r"^(references|works cited|bibliography|sources)\b",
    re.IGNORECASE | re.MULTILINE
)

class CitationService:
    @classmethod
    def extract_bibliography_and_body(cls, text: str) -> Tuple[str, str, List[str]]:
        """Splits document into main body and references section if present"""
        match = BIBLIOGRAPHY_HEADERS.search(text)
        if match:
            body = text[:match.start()]
            ref_section = text[match.end():]
            # Split references into entries (separated by blank lines or hanging indents/numbered lines)
            entries = [e.strip() for e in re.split(r'\n(?=[A-Z0-9\[])|\n\s*\n', ref_section) if len(e.strip()) > 15]
            return body, ref_section, entries
        return text, "", []

    @classmethod
    def check_citations(cls, text: str) -> CitationReview:
        body, ref_section, bib_entries = cls.extract_bibliography_and_body(text)

        in_text_citations: List[CitationItem] = []
        found_signatures = set()

        # 1. Find parenthetical citations in body
        for match in PAREN_CITATION_REGEX.finditer(body):
            author_str = match.group(1).strip()
            year_str = match.group(2).strip()
            raw = match.group(0)
            sig = f"{author_str}_{year_str}"
            if sig not in found_signatures:
                found_signatures.add(sig)
                in_text_citations.append(CitationItem(
                    raw_citation=raw,
                    authors=author_str,
                    year=year_str,
                    has_matching_reference=False
                ))

        # 2. Find narrative citations in body
        for match in NARRATIVE_CITATION_REGEX.finditer(body):
            author_str = match.group(1).strip()
            year_str = match.group(2).strip()
            raw = match.group(0)
            sig = f"{author_str}_{year_str}"
            if sig not in found_signatures:
                found_signatures.add(sig)
                in_text_citations.append(CitationItem(
                    raw_citation=raw,
                    authors=author_str,
                    year=year_str,
                    has_matching_reference=False
                ))

        # 3. Match in-text citations against references list
        unmatched: List[str] = []
        for cite in in_text_citations:
            lead_author = cite.authors.split()[0].replace(',', '').replace(';', '')
            # Check if lead author and year appear in any bibliography entry
            matched = False
            for entry in bib_entries:
                if re.search(r'\b' + re.escape(lead_author) + r'\b', entry, re.IGNORECASE) and cite.year in entry:
                    matched = True
                    break
            cite.has_matching_reference = matched
            if not matched:
                unmatched.append(f"{cite.raw_citation} (Missing from References)")

        # 4. Check DOIs
        dois_in_doc = DOI_REGEX.findall(text)
        doi_summary: Dict[str, Any] = {
            "total_dois_found": len(dois_in_doc),
            "valid_format_count": 0,
            "sample_dois": []
        }
        for d in set(dois_in_doc):
            # standard check: begins with 10. and has a slash
            is_valid = bool(re.match(r"^10\.\d{4,9}/[a-zA-Z0-9._:\(\)/-]+$", d))
            if is_valid:
                doi_summary["valid_format_count"] += 1
            doi_summary["sample_dois"].append({"doi": d, "valid_format": is_valid})

        # 5. Check duplicate bibliography entries
        duplicates: List[str] = []
        seen_entries = set()
        for entry in bib_entries:
            norm = re.sub(r'[^a-zA-Z0-9]', '', entry.lower())[:60]
            if norm in seen_entries:
                duplicates.append(entry[:100] + "...")
            else:
                seen_entries.add(norm)

        return CitationReview(
            in_text_citations_found=len(in_text_citations),
            bibliography_entries_found=len(bib_entries),
            citations=in_text_citations,
            unmatched_in_text_citations=unmatched,
            duplicate_references=duplicates,
            doi_validation_summary=doi_summary
        )

    @classmethod
    async def verify_live_source_url(cls, url: str) -> Dict[str, Any]:
        """Verifies a live source URL or DOI via Context.dev Web Scraping & Markdown Extraction API"""
        clean_url = url.strip()
        if clean_url.startswith("10."):
            clean_url = f"https://doi.org/{clean_url}"
        elif not clean_url.startswith(("http://", "https://")):
            clean_url = f"https://{clean_url}"

        result: Dict[str, Any] = {
            "url": clean_url,
            "status": "unverified",
            "provider": "Context.dev",
            "exists": False,
            "title": "",
            "snippet": "",
            "markdown_excerpt": ""
        }

        api_key = settings.CONTEXT_DEV_API_KEY
        if not api_key:
            # Fallback to direct head check if no key provided
            try:
                async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
                    resp = await client.head(clean_url)
                    result["exists"] = resp.status_code < 400
                    result["status"] = "verified" if result["exists"] else "not_found"
            except Exception as e:
                result["status"] = f"error: {str(e)}"
            return result

        # Call Context.dev API: GET /web/scrape/markdown?url=...
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = {
                    "x-context-dev-api-key": api_key,
                    "Accept": "application/json"
                }
                # Call Context.dev web scraper
                resp = await client.get(
                    "https://api.context.dev/web/scrape/markdown",
                    params={"url": clean_url},
                    headers=headers
                )
                if resp.status_code == 200:
                    data = resp.json() if "application/json" in resp.headers.get("content-type", "") else {"markdown": resp.text}
                    markdown_content = data.get("markdown") or data.get("content") or resp.text
                    result["exists"] = True
                    result["status"] = "verified"
                    result["markdown_excerpt"] = markdown_content[:500] if markdown_content else ""
                    # Try to extract first markdown heading or line as title
                    lines = [ln.strip("# *") for ln in markdown_content.split("\n") if ln.strip()]
                    result["title"] = lines[0] if lines else "Live Web Source"
                    result["snippet"] = " ".join(lines[1:3]) if len(lines) > 1 else ""
                else:
                    # Direct check fallback
                    async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as direct_client:
                        direct_resp = await direct_client.get(clean_url)
                        result["exists"] = direct_resp.status_code < 400
                        result["status"] = "verified" if result["exists"] else "not_found"
                        result["title"] = f"Source ({direct_resp.status_code})"
        except Exception as e:
            result["status"] = "error"
            result["snippet"] = str(e)

        return result


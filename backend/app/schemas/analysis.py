from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class TextLocation(BaseModel):
    start: int
    end: int
    sentence_index: Optional[int] = None
    paragraph_index: Optional[int] = None

class WritingFinding(BaseModel):
    id: str
    category: str # "grammar", "spelling", "punctuation", "clarity", "word_choice", "redundancy"
    original: str
    suggestion: str
    message: str
    explanation: str
    location: TextLocation
    confidence: str = "high" # high, medium, low

class ReadabilityMetrics(BaseModel):
    word_count: int
    sentence_count: int
    paragraph_count: int
    char_count: int
    avg_sentence_length: float
    avg_word_length: float
    flesch_reading_ease: float
    flesch_reading_ease_label: str
    flesch_kincaid_grade: float
    gunning_fog_index: float
    coleman_liau_index: float
    automated_readability_index: float
    passive_voice_count: int
    passive_sentences: List[str] = []
    complex_word_count: int
    complex_words: List[str] = []
    transition_word_count: int
    reading_time_minutes: float

class PassageSignal(BaseModel):
    paragraph_index: int
    preview: str
    signal_level: str # "Consistent patterns", "Pattern variation", "Inconclusive"
    confidence_level: str # "High", "Moderate", "Uncertain"
    explanation: str
    highlight_recommendation: bool

class AISignalReview(BaseModel):
    overall_status: str # "Consistent Language Patterns", "Mixed Signals (Review Suggested)", "Inconclusive Confidence"
    overall_score: int # 0 to 100 indicator (educational, not proof)
    confidence_tier: str # "Educational Indicator", "Low Uncertainty", "High Uncertainty"
    disclaimer: str
    passages: List[PassageSignal] = []
    features_detected: List[str] = []

class CitationItem(BaseModel):
    raw_citation: str
    authors: Optional[str] = None
    year: Optional[str] = None
    has_matching_reference: bool
    doi: Optional[str] = None
    is_doi_valid_format: Optional[bool] = None

class CitationReview(BaseModel):
    in_text_citations_found: int
    bibliography_entries_found: int
    citations: List[CitationItem] = []
    unmatched_in_text_citations: List[str] = []
    duplicate_references: List[str] = []
    doi_validation_summary: Dict[str, Any] = {}

class WritingImprovementSuggestion(BaseModel):
    id: str
    category: str # "clarity", "conciseness", "tone", "awkward"
    original: str
    suggested: str
    explanation: str
    confidence: str = "high"

class FullAnalysisRequest(BaseModel):
    text: str
    document_id: Optional[str] = None
    document_type: str = "general" # "general", "academic", "blog", "business", "essay"
    language: str = "en"
    checks: List[str] = Field(default_factory=lambda: ["grammar", "readability", "ai_signals", "citations"])
    external_provider_consent: bool = True

class FullAnalysisResponse(BaseModel):
    analysis_id: str
    status: str
    overall_score: int
    document_type: str
    metrics: ReadabilityMetrics
    grammar_findings: List[WritingFinding]
    ai_signals: AISignalReview
    citations: CitationReview
    writing_suggestions: List[WritingImprovementSuggestion]

class QuickRewriteRequest(BaseModel):
    text: str
    instruction: str # "professional", "concise", "simplify", "formal", "expand", "summarize"
    target_tone: Optional[str] = "professional"

class QuickRewriteResponse(BaseModel):
    original: str
    revised: str
    changes_made: List[str]
    explanation: str

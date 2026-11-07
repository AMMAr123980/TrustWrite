import pytest
from app.services.readability_service import ReadabilityService
from app.services.grammar_service import GrammarService
from app.services.citation_service import CitationService
from app.services.ai_detection_service import AIDetectionService

def test_readability_metrics():
    sample_text = (
        "Good writing is concise, clear, and direct. Readers appreciate simplicity because it saves time. "
        "However, academic writing frequently requires specialized terminology and structured argumentation. "
        "Therefore, writers must carefully balance technical precision with accessible prose."
    )
    metrics = ReadabilityService.calculate_metrics(sample_text)
    assert metrics.word_count > 25
    assert metrics.sentence_count >= 4
    assert metrics.flesch_reading_ease > 0
    assert metrics.transition_word_count >= 2

def test_grammar_corrections():
    bad_grammar = "He don't know how to write professional emails. Their is alot of errors."
    findings = GrammarService.check_text(bad_grammar)
    
    assert len(findings) >= 3
    categories = [f.category for f in findings]
    assert "grammar" in categories
    assert "spelling" in categories
    assert any("doesn't" in f.suggestion for f in findings)
    assert any("a lot" in f.suggestion for f in findings)

def test_citations_and_references():
    paper_text = (
        "According to Smith (2023), early intervention significantly enhances student literacy. "
        "Similar conclusions were confirmed by Taylor et al. (2020).\n\n"
        "References\n"
        "Smith, J. (2023). Educational Strategies for Success. Journal of Learning, 10.1000/182.\n"
    )
    result = CitationService.check_citations(paper_text)
    assert result.in_text_citations_found >= 2
    assert result.bibliography_entries_found >= 1
    # Taylor should be flagged as unmatched
    assert any("Taylor" in u for u in result.unmatched_in_text_citations)

def test_ai_detection_signals():
    text = (
        "Machine learning models are trained on large corpuses of digital text. "
        "These models identify statistical patterns in the token distribution. "
        "Consequently, natural language processing applications can generate fluent textual sequences."
    )
    review = AIDetectionService.evaluate_burstiness_and_perplexity(text)
    assert review.disclaimer != ""
    assert "ethical" in review.disclaimer.lower()
    assert review.overall_status in [
        "Consistent Language Patterns",
        "Mixed Signals (Review Suggested)",
        "Inconclusive Confidence"
    ]

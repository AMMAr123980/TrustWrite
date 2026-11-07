import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import AnalysisJob, Document
from app.schemas.analysis import (
    FullAnalysisRequest,
    FullAnalysisResponse,
    ReadabilityMetrics,
    AISignalReview,
    CitationReview
)
from app.services.readability_service import ReadabilityService
from app.services.grammar_service import GrammarService
from app.services.ai_detection_service import AIDetectionService
from app.services.citation_service import CitationService
from app.services.ai_writing_service import AIWritingService

router = APIRouter(prefix="/analyses", tags=["Analyses"])

def compute_overall_quality_score(
    metrics: ReadabilityMetrics,
    grammar_count: int,
    citation_unmatched_count: int
) -> int:
    score = 100

    # Grammar penalty: 3 points per issue, max 30 penalty
    grammar_penalty = min(30, grammar_count * 3)
    score -= grammar_penalty

    # Reading ease calibration: optimal is 50-75. If < 30 or > 90 in formal/academic, minor penalty
    if metrics.flesch_reading_ease < 35:
        score -= 10
    elif metrics.flesch_reading_ease < 50:
        score -= 5

    # Excessive passive voice penalty
    if metrics.word_count > 0:
        passive_ratio = metrics.passive_voice_count / max(1, metrics.sentence_count)
        if passive_ratio > 0.35:
            score -= 10
        elif passive_ratio > 0.20:
            score -= 5

    # Missing citation penalties
    citation_penalty = min(15, citation_unmatched_count * 5)
    score -= citation_penalty

    return max(20, min(100, score))

@router.post("", response_model=FullAnalysisResponse)
async def run_analysis(
    req: FullAnalysisRequest,
    db: Session = Depends(get_db)
):
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Cannot analyze empty text.")

    # 1. Deterministic Readability Engine
    metrics = ReadabilityService.calculate_metrics(text)

    # 2. Grammar & Spelling Engine
    grammar_findings = []
    if "grammar" in req.checks:
        grammar_findings = await GrammarService.check_with_fallback(text)

    # 3. AI Writing Pattern Review
    if "ai_signals" in req.checks:
        ai_signals = AIDetectionService.evaluate_burstiness_and_perplexity(text)
    else:
        ai_signals = AISignalReview(
            overall_status="Not Requested",
            overall_score=0,
            confidence_tier="N/A",
            disclaimer="",
            passages=[],
            features_detected=[]
        )

    # 4. Citation & Reference Review
    if "citations" in req.checks:
        citations = CitationService.check_citations(text)
    else:
        citations = CitationReview(
            in_text_citations_found=0,
            bibliography_entries_found=0,
            citations=[],
            unmatched_in_text_citations=[],
            duplicate_references=[],
            doi_validation_summary={}
        )

    # 5. Writing Assistant Improvements
    writing_suggestions = AIWritingService.generate_heuristic_suggestions(text)

    # Overall Composite Score
    overall_score = compute_overall_quality_score(
        metrics,
        len(grammar_findings),
        len(citations.unmatched_in_text_citations)
    )

    analysis_id = f"anl_{uuid.uuid4().hex[:12]}"

    # Save to database if linked to document or persistence
    job = AnalysisJob(
        id=analysis_id,
        document_id=req.document_id,
        status="completed",
        requested_checks=req.checks,
        summary_score=overall_score,
        metrics=metrics.model_dump(),
        grammar_findings=[g.model_dump() for g in grammar_findings],
        ai_signals=ai_signals.model_dump(),
        citations=citations.model_dump(),
        suggestions=[s.model_dump() for s in writing_suggestions]
    )
    db.add(job)
    db.commit()

    return FullAnalysisResponse(
        analysis_id=analysis_id,
        status="completed",
        overall_score=overall_score,
        document_type=req.document_type,
        metrics=metrics,
        grammar_findings=grammar_findings,
        ai_signals=ai_signals,
        citations=citations,
        writing_suggestions=writing_suggestions
    )

@router.get("/{analysis_id}", response_model=FullAnalysisResponse)
def get_analysis_result(analysis_id: str, db: Session = Depends(get_db)):
    job = db.query(AnalysisJob).filter(AnalysisJob.id == analysis_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Analysis result not found.")
    
    return FullAnalysisResponse(
        analysis_id=job.id,
        status=job.status,
        overall_score=job.summary_score,
        document_type="general",
        metrics=job.metrics,
        grammar_findings=job.grammar_findings,
        ai_signals=job.ai_signals,
        citations=job.citations,
        writing_suggestions=job.suggestions
    )

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import AnalysisJob, Document
from app.schemas.analysis import FullAnalysisResponse
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/{analysis_id}/pdf")
def export_analysis_pdf(analysis_id: str, db: Session = Depends(get_db)):
    job = db.query(AnalysisJob).filter(AnalysisJob.id == analysis_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Analysis report not found.")

    doc_title = "TrustWrite Document Review"
    if job.document_id:
        doc = db.query(Document).filter(Document.id == job.document_id).first()
        if doc and doc.title:
            doc_title = doc.title

    analysis_resp = FullAnalysisResponse(
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

    pdf_bytes = ReportService.generate_pdf_report(analysis_resp, document_title=doc_title)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=trustwrite_report_{analysis_id}.pdf"}
    )

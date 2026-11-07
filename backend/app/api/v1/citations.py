from pydantic import BaseModel
from fastapi import APIRouter
from app.schemas.analysis import CitationReview
from app.services.citation_service import CitationService

router = APIRouter(prefix="/citations", tags=["Citations"])

class CitationCheckRequest(BaseModel):
    text: str

class SourceVerifyRequest(BaseModel):
    url: str

@router.post("/check", response_model=CitationReview)
def check_citations(req: CitationCheckRequest):
    return CitationService.check_citations(req.text)

@router.post("/verify-source")
async def verify_source(req: SourceVerifyRequest):
    return await CitationService.verify_live_source_url(req.url)

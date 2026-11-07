from pydantic import BaseModel
from fastapi import APIRouter
from app.schemas.analysis import ReadabilityMetrics
from app.services.readability_service import ReadabilityService

router = APIRouter(prefix="/readability", tags=["Readability"])

class ReadabilityRequest(BaseModel):
    text: str

@router.post("/check", response_model=ReadabilityMetrics)
def check_readability(req: ReadabilityRequest):
    return ReadabilityService.calculate_metrics(req.text)

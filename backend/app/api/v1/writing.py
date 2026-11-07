from fastapi import APIRouter
from app.schemas.analysis import QuickRewriteRequest, QuickRewriteResponse
from app.services.ai_writing_service import AIWritingService

router = APIRouter(prefix="/writing", tags=["AI Writing Assistant"])

@router.post("/rewrite", response_model=QuickRewriteResponse)
async def rewrite(req: QuickRewriteRequest):
    return await AIWritingService.rewrite_text(req.text, req.instruction)

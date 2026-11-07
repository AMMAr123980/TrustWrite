from typing import List
from pydantic import BaseModel
from fastapi import APIRouter
from app.schemas.analysis import WritingFinding
from app.services.grammar_service import GrammarService

router = APIRouter(prefix="/grammar", tags=["Grammar"])

class GrammarCheckRequest(BaseModel):
    text: str

@router.post("/check", response_model=List[WritingFinding])
async def check_grammar(req: GrammarCheckRequest):
    return await GrammarService.check_with_fallback(req.text)

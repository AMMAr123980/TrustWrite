from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class DocumentCreate(BaseModel):
    title: Optional[str] = "Untitled Document"
    content: str
    document_type: Optional[str] = "general"
    language: Optional[str] = "en"

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    document_type: Optional[str] = None

class DocumentResponse(BaseModel):
    id: str
    title: str
    content: str
    document_type: str
    language: str
    word_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DocumentVersionResponse(BaseModel):
    id: str
    version_number: int
    content: str
    change_summary: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

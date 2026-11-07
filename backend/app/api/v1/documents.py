import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import Document, DocumentVersion
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse, DocumentVersionResponse
from app.services.document_service import DocumentService
from app.services.readability_service import ReadabilityService

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("", response_model=DocumentResponse)
def create_document(doc_in: DocumentCreate, db: Session = Depends(get_db)):
    words = ReadabilityService.extract_words(doc_in.content)
    new_doc = Document(
        title=doc_in.title or "Untitled Document",
        content=doc_in.content,
        document_type=doc_in.document_type or "general",
        language=doc_in.language or "en",
        word_count=len(words)
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # Version 1
    v1 = DocumentVersion(
        document_id=new_doc.id,
        version_number=1,
        content=doc_in.content,
        change_summary="Initial document draft"
    )
    db.add(v1)
    db.commit()

    return DocumentResponse.model_validate(new_doc)

@router.get("", response_model=List[DocumentResponse])
def list_documents(limit: int = 50, db: Session = Depends(get_db)):
    docs = db.query(Document).order_by(Document.updated_at.desc()).limit(limit).all()
    return [DocumentResponse.model_validate(d) for d in docs]

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return DocumentResponse.model_validate(doc)

@router.patch("/{document_id}", response_model=DocumentResponse)
def update_document(document_id: str, doc_in: DocumentUpdate, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if doc_in.title is not None:
        doc.title = doc_in.title
    if doc_in.document_type is not None:
        doc.document_type = doc_in.document_type
    if doc_in.content is not None and doc_in.content != doc.content:
        doc.content = doc_in.content
        words = ReadabilityService.extract_words(doc.content)
        doc.word_count = len(words)

        # Record new version
        ver_count = db.query(DocumentVersion).filter(DocumentVersion.document_id == document_id).count()
        new_v = DocumentVersion(
            document_id=doc.id,
            version_number=ver_count + 1,
            content=doc.content,
            change_summary="Document update"
        )
        db.add(new_v)

    db.commit()
    db.refresh(doc)
    return DocumentResponse.model_validate(doc)

@router.delete("/{document_id}")
def delete_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    db.delete(doc)
    db.commit()
    return {"status": "deleted", "id": document_id}

@router.get("/{document_id}/versions", response_model=List[DocumentVersionResponse])
def get_versions(document_id: str, db: Session = Depends(get_db)):
    versions = db.query(DocumentVersion).filter(DocumentVersion.document_id == document_id).order_by(DocumentVersion.version_number.desc()).all()
    return [DocumentVersionResponse.model_validate(v) for v in versions]

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("general"),
    db: Session = Depends(get_db)
):
    content_bytes = await file.read()
    if len(content_bytes) > 10 * 1024 * 1024: # 10MB limit
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit.")

    extracted_text = DocumentService.extract_text(file.filename or "upload.txt", content_bytes)
    words = ReadabilityService.extract_words(extracted_text)

    new_doc = Document(
        title=file.filename or "Uploaded Document",
        content=extracted_text,
        document_type=document_type,
        word_count=len(words)
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    v1 = DocumentVersion(
        document_id=new_doc.id,
        version_number=1,
        content=extracted_text,
        change_summary="Uploaded file initial version"
    )
    db.add(v1)
    db.commit()

    return DocumentResponse.model_validate(new_doc)

from pydantic import BaseModel
class ExportDocxRequest(BaseModel):
    title: str = "Untitled Document"
    content: str

@router.post("/export-docx")
def export_docx(req: ExportDocxRequest):
    import io
    import docx
    from docx.shared import Pt, RGBColor
    from fastapi.responses import Response

    doc = docx.Document()
    
    # Title
    title_p = doc.add_heading(req.title, level=0)
    if title_p.runs:
        title_p.runs[0].font.size = Pt(22)
        title_p.runs[0].font.bold = True
        title_p.runs[0].font.color.rgb = RGBColor(15, 23, 42)

    # Subtitle / metadata
    meta_p = doc.add_paragraph("Exported from TrustWrite Writing Intelligence Platform")
    if meta_p.runs:
        meta_p.runs[0].font.italic = True
        meta_p.runs[0].font.size = Pt(9.5)
        meta_p.runs[0].font.color.rgb = RGBColor(100, 116, 139)
    doc.add_paragraph()

    # Paragraphs
    paragraphs = req.content.split("\n\n")
    for para in paragraphs:
        text = para.strip()
        if not text:
            continue
        if text.lower() in ("references", "works cited", "bibliography"):
            h = doc.add_heading(text, level=1)
            if h.runs:
                h.runs[0].font.size = Pt(14)
                h.runs[0].font.bold = True
        else:
            p = doc.add_paragraph(text)
            p.paragraph_format.line_spacing = 1.25
            p.paragraph_format.space_after = Pt(8)
            if p.runs:
                p.runs[0].font.size = Pt(11)

    file_stream = io.BytesIO()
    doc.save(file_stream)
    file_stream.seek(0)

    clean_filename = "".join(c for c in req.title if c.isalnum() or c in (" ", "_", "-")).strip().replace(" ", "_")
    if not clean_filename:
        clean_filename = "trustwrite_document"

    return Response(
        content=file_stream.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{clean_filename}.docx"'}
    )

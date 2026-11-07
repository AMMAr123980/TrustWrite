import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    analyses = relationship("AnalysisJob", back_populates="user", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    title = Column(String(255), default="Untitled Document")
    content = Column(Text, default="")
    document_type = Column(String(50), default="general") # general, academic, blog, business, essay
    language = Column(String(10), default="en")
    word_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="documents")
    analyses = relationship("AnalysisJob", back_populates="document", cascade="all, delete-orphan")
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")

class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    change_summary = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    document = relationship("Document", back_populates="versions")

class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    status = Column(String(50), default="completed") # queued, processing, completed, failed
    requested_checks = Column(JSON, default=list) # ["grammar", "readability", "ai_signals", "citations"]
    summary_score = Column(Integer, default=85) # Overall 0-100 score
    metrics = Column(JSON, default=dict) # Readability & length metrics
    grammar_findings = Column(JSON, default=list) # Standardized grammar suggestions
    ai_signals = Column(JSON, default=dict) # Ethical writing patterns analysis
    citations = Column(JSON, default=dict) # Citation and reference results
    suggestions = Column(JSON, default=list) # AI writing improvements
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="analyses")
    document = relationship("Document", back_populates="analyses")

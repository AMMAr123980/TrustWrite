from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1 import (
    auth,
    documents,
    analyses,
    writing,
    grammar,
    readability,
    citations,
    reports
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="TrustWrite - Complete AI-Powered Writing Intelligence and Improvement Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development allow all; configured per settings in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(analyses.router, prefix=settings.API_V1_STR)
app.include_router(writing.router, prefix=settings.API_V1_STR)
app.include_router(grammar.router, prefix=settings.API_V1_STR)
app.include_router(readability.router, prefix=settings.API_V1_STR)
app.include_router(citations.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "deterministic_engine": "active"
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to TrustWrite Writing Intelligence API",
        "tagline": "Write Better. Verify More. Communicate with Confidence.",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

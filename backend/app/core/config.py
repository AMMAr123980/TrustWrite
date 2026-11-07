import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "TrustWrite"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "trustwrite-super-secure-production-ready-jwt-secret-key-32chars")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./trustwrite.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    # External Provider Keys (Optional / Pluggable)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GPTZERO_API_KEY: str = os.getenv("GPTZERO_API_KEY", "")
    CONTEXT_DEV_API_KEY: str = os.getenv("CONTEXT_DEV_API_KEY", "ctxt_secret_2679299ddc27420c804d741a2bfa6a44")
    LANGUAGETOOL_API_URL: str = os.getenv("LANGUAGETOOL_API_URL", "https://api.languagetoolplus.com/v2/check")
    
    # Free usage limits
    FREE_WORDS_PER_ANALYSIS: int = 5000
    ANONYMOUS_DAILY_LIMIT: int = 20

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()

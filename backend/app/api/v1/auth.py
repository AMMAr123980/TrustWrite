from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.entities import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    new_user = User(
        email=user_in.email,
        name=user_in.name or user_in.email.split("@")[0],
        hashed_password=get_password_hash(user_in.password),
        is_active=True,
        is_verified=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = create_access_token(new_user.id)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(new_user))

@router.post("/login", response_model=TokenResponse)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse)
def get_me():
    # Demo anonymous user representation for frictionless quick review
    return UserResponse(
        id="demo-user",
        email="demo@trustwrite.app",
        name="Workspace User",
        is_active=True,
        is_verified=True,
        created_at="2026-01-01T00:00:00Z"
    )

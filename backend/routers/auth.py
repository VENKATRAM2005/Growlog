from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.models.user import User
from backend.schemas.repo import RepoInput
from backend.schemas.user import (
    AuthTokenResponse,
    MessageResponse,
    UserCreate,
    UserProfileResponse,
)
from backend.utils.dependencies import get_current_user, get_db
from backend.utils.rate_limit import limiter
from backend.utils.security import create_access_token, hash_password, verify_password

router = APIRouter()


@router.post("/register", response_model=MessageResponse, status_code=201)
@limiter.limit("5/minute")
def register(
    request: Request,
    user: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = db.query(User).filter(User.username == user.username).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = User(username=user.username, password_hash=hash_password(user.password))

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


@router.post("/login", response_model=AuthTokenResponse)
@limiter.limit("5/minute")
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    invalid_credentials = HTTPException(
        status_code=401,
        detail="Invalid username or password",
    )

    user = db.query(User).filter(User.username == form_data.username).first()

    if user is None:
        raise invalid_credentials

    if not verify_password(form_data.password, user.password_hash):
        raise invalid_credentials

    access_token = create_access_token(
        {
            "sub": str(user.username),
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post("/set-repo", response_model=MessageResponse)
def set_github_repo(
    repo: RepoInput,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    current_user.github_repo = repo.repo_url
    db.commit()

    return {"message": "GitHub repo saved"}


@router.get("/user/me", response_model=UserProfileResponse)
def get_me(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "github_repo": current_user.github_repo,
    }

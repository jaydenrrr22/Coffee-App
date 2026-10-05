from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import (
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from app.dependencies.database import get_db
from app.models.user import User
from app.schemas.user import (
    AuthResponse,
    NameUpdate,
    PasswordUpdate,
    PreferencesUpdate,
    UserCreate,
    UserLogin,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED
)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    email = payload.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=email,
        name=payload.name.strip(),
        hashed_password=get_password_hash(payload.password),
        roast_preferences=[],
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"token": create_access_token(user.id), "user": user}


@router.post("/login", response_model=AuthResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if (
        user is None
        or not user.is_active
        or not verify_password(payload.password, user.hashed_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    return {"token": create_access_token(user.id), "user": user}


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserResponse)
def update_name(
    payload: NameUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.name = payload.name.strip()
    db.commit()
    db.refresh(user)
    return user


@router.put("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def update_password(
    payload: PasswordUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.hashed_password = get_password_hash(payload.password)
    db.commit()


@router.put("/me/preferences", response_model=UserResponse)
def update_preferences(
    payload: PreferencesUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.roast_preferences = list(dict.fromkeys(payload.roasts))
    db.commit()
    db.refresh(user)
    return user


@router.post("/me/deactivate", status_code=status.HTTP_204_NO_CONTENT)
def deactivate(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.is_active = False
    db.commit()

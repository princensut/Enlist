from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    AuthUserResponse,
    MessageResponse,
)
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


def set_auth_cookie(response: Response, token: str):
    is_production = settings.ENVIRONMENT.lower() == "production"

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="none" if is_production else "lax",
        secure=is_production,
        max_age=3600 * 24,
        path="/",
    )


@router.post(
    "/register",
    response_model=AuthUserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    req: RegisterRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    user = AuthService.register_student(db, req)

    _, token = AuthService.authenticate_user(
        db,
        LoginRequest(
            email=req.email,
            password=req.password,
        ),
    )

    set_auth_cookie(response, token)

    return user


@router.post(
    "/login",
    response_model=AuthUserResponse,
)
def login(
    req: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    user, token = AuthService.authenticate_user(db, req)

    set_auth_cookie(response, token)

    return user


@router.post(
    "/logout",
    response_model=MessageResponse,
)
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/",
    )

    return MessageResponse(
        success=True,
        message="Successfully logged out.",
    )


@router.get(
    "/me",
    response_model=AuthUserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user
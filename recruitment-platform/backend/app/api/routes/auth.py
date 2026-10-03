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
    # Frontend and API live on different vercel.app subdomains (cross-site),
    # so the cookie must be SameSite=None; Secure. localhost stays lax.
    is_local = settings.ENVIRONMENT.lower() in ("development", "dev", "local")

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax" if is_local else "none",
        secure=not is_local,
        max_age=3600 * 24,
        path="/",
    )
    # Also expose the token so the SPA can send it as a Bearer header when
    # the browser blocks third-party cookies.
    response.headers["X-Access-Token"] = token


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
        samesite="none",
        secure=True,
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
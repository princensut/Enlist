from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.auth import RegisterRequest, LoginRequest

class AuthService:
    @staticmethod
    def register_student(db: Session, req: RegisterRequest) -> User:
        existing = db.query(User).filter(User.email == req.email.lower()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address is already registered."
            )

        hashed = hash_password(req.password)
        # Force STUDENT role on public registration
        user = User(
            name=req.name,
            email=req.email.lower(),
            password_hash=hashed,
            role=UserRole.STUDENT
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(db: Session, req: LoginRequest) -> tuple[User, str]:
        user = db.query(User).filter(User.email == req.email.lower()).first()
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        token = create_access_token({"sub": user.id, "role": user.role.value, "email": user.email})
        return user, token
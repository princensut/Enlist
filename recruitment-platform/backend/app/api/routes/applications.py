from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.application import ApplicationSubmitRequest, ApplicationResponse
from app.services.application_service import ApplicationService
from app.core.dependencies import require_student, get_current_user
from app.models.user import User

router = APIRouter(prefix="/applications", tags=["Student Applications"])

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def submit_application(
    req: ApplicationSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    return ApplicationService.submit_application(db, current_user.id, req)

@router.get("/me", response_model=list[ApplicationResponse])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    return ApplicationService.get_student_applications(db, current_user.id)

@router.get("/{id}", response_model=ApplicationResponse)
def get_application(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ApplicationService.get_application_by_id(db, id, current_user)
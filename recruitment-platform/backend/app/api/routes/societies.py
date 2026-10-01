from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.society import SocietyResponse, SocietyCreate, SocietyUpdate
from app.services.society_service import SocietyService
from app.core.dependencies import require_admin, get_current_user
from app.models.user import User

router = APIRouter(prefix="/societies", tags=["Societies"])

@router.get("", response_model=list[SocietyResponse])
def list_societies(category: str | None = None, db: Session = Depends(get_db)):
    return SocietyService.get_all_societies(db, category=category)

@router.get("/{id}", response_model=SocietyResponse)
def get_society(id: str, db: Session = Depends(get_db)):
    return SocietyService.get_society_by_id(db, id)

@router.post("", response_model=SocietyResponse, status_code=status.HTTP_201_CREATED)
def create_society(req: SocietyCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return SocietyService.create_society(db, req)

@router.patch("/{id}", response_model=SocietyResponse)
def update_society(id: str, req: SocietyUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return SocietyService.update_society(db, id, req)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_society(id: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    SocietyService.delete_society(db, id)
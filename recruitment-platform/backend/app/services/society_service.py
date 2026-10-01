from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.society import Society
from app.schemas.society import SocietyCreate, SocietyUpdate

class SocietyService:
    @staticmethod
    def get_all_societies(db: Session, category: str | None = None, is_active: bool | None = True) -> list[Society]:
        query = db.query(Society)
        if is_active is not None:
            query = query.filter(Society.is_active == is_active)
        if category:
            query = query.filter(Society.category == category)
        return query.order_by(Society.name.asc()).all()

    @staticmethod
    def get_society_by_id(db: Session, society_id: str) -> Society:
        society = db.query(Society).filter(Society.id == society_id).first()
        if not society:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Society not found.")
        return society

    @staticmethod
    def create_society(db: Session, req: SocietyCreate) -> Society:
        society = Society(**req.model_dump())
        db.add(society)
        db.commit()
        db.refresh(society)
        return society

    @staticmethod
    def update_society(db: Session, society_id: str, req: SocietyUpdate) -> Society:
        society = SocietyService.get_society_by_id(db, society_id)
        update_data = req.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(society, field, value)
        db.commit()
        db.refresh(society)
        return society

    @staticmethod
    def delete_society(db: Session, society_id: str) -> None:
        society = SocietyService.get_society_by_id(db, society_id)
        # Soft-delete by setting inactive to preserve historical records
        society.is_active = False
        db.commit()
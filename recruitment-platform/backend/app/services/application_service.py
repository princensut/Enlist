from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.models.application import Application, ApplicationStatus
from app.models.society import Society
from app.schemas.application import ApplicationSubmitRequest

class ApplicationService:
    @staticmethod
    def submit_application(db: Session, student_id: str, req: ApplicationSubmitRequest) -> Application:
        # 1. Verify society exists
        society = db.query(Society).filter(Society.id == req.society_id).first()
        if not society:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target society not found.")

        if not society.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Applications for this society are currently inactive."
            )

        # 2. Server-side Deadline Enforcement
        now_utc = datetime.now(timezone.utc)
        society_deadline = society.deadline
        if society_deadline.tzinfo is None:
            society_deadline = society_deadline.replace(tzinfo=timezone.utc)

        if now_utc >= society_deadline:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Applications for this society are closed. Recruitment deadline has passed."
            )

        # 3. Duplicate Application Check
        existing = db.query(Application).filter(
            Application.student_id == student_id,
            Application.society_id == req.society_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already submitted an application to this society."
            )

        # 4. Insert Application with Database Integrity Fallback
        try:
            application = Application(
                student_id=student_id,
                society_id=req.society_id,
                answers=req.answers.model_dump(),
                status=ApplicationStatus.Pending
            )
            db.add(application)
            db.commit()
            db.refresh(application)
            return application
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Duplicate application detected. You have already applied to this society."
            )

    @staticmethod
    def get_student_applications(db: Session, student_id: str) -> list[Application]:
        return db.query(Application)\
            .options(joinedload(Application.society))\
            .filter(Application.student_id == student_id)\
            .order_by(Application.submitted_at.desc())\
            .all()

    @staticmethod
    def get_application_by_id(db: Session, application_id: str, current_user) -> Application:
        app = db.query(Application)\
            .options(joinedload(Application.society), joinedload(Application.student))\
            .filter(Application.id == application_id)\
            .first()

        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

        # Data Isolation Check
        if current_user.role != "ADMIN" and app.student_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You can only view your own applications."
            )

        return app
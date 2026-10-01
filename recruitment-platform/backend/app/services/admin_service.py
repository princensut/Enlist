from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func, or_
from fastapi import HTTPException, status
from app.models.application import Application, ApplicationStatus
from app.models.user import User
from app.models.society import Society
from app.models.audit_log import AuditLog

class AdminService:
    @staticmethod
    def get_paginated_applications(
        db: Session,
        page: int = 1,
        limit: int = 10,
        search: str | None = None,
        status_filter: ApplicationStatus | None = None,
        society_id: str | None = None,
        category: str | None = None
    ):
        query = db.query(Application)\
            .join(User, Application.student_id == User.id)\
            .join(Society, Application.society_id == Society.id)\
            .options(joinedload(Application.student), joinedload(Application.society))

        if status_filter:
            query = query.filter(Application.status == status_filter)

        if society_id:
            query = query.filter(Application.society_id == society_id)

        if category:
            query = query.filter(Society.category == category)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    User.name.ilike(search_pattern),
                    User.email.ilike(search_pattern),
                    Society.name.ilike(search_pattern)
                )
            )

        total = query.count()
        pages = (total + limit - 1) // limit if total > 0 else 1
        offset = (page - 1) * limit

        items = query.order_by(Application.submitted_at.desc()).offset(offset).limit(limit).all()

        return {
            "items": items,
            "page": page,
            "limit": limit,
            "total": total,
            "pages": pages
        }

    @staticmethod
    def update_application_status(
        db: Session,
        application_id: str,
        new_status: ApplicationStatus,
        admin_id: str
    ) -> Application:
        app = db.query(Application).filter(Application.id == application_id).first()
        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

        old_status = app.status.value
        app.status = new_status

        # Create audit log
        audit = AuditLog(
            actor_id=admin_id,
            action="UPDATE_STATUS",
            entity_type="Application",
            entity_id=application_id,
            old_value={"status": old_status},
            new_value={"status": new_status.value}
        )
        db.add(audit)
        db.commit()
        db.refresh(app)
        return app
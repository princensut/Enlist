import csv
import io
from fastapi import APIRouter, Depends, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.application import PaginatedApplicationsResponse, ApplicationStatusUpdate, ApplicationResponse
from app.services.admin_service import AdminService
from app.services.analytics_service import AnalyticsService
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.application import ApplicationStatus

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/applications", response_model=PaginatedApplicationsResponse)
def search_and_filter_applicants(
    page: int = 1,
    limit: int = 10,
    search: str | None = None,
    status: ApplicationStatus | None = None,
    society_id: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    return AdminService.get_paginated_applications(
        db, page=page, limit=limit, search=search, status_filter=status, society_id=society_id, category=category
    )

@router.patch("/applications/{id}/status", response_model=ApplicationResponse)
def update_application_status(
    id: str,
    req: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return AdminService.update_application_status(db, id, req.status, current_user.id)

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return AnalyticsService.get_dashboard_metrics(db)

@router.get("/applications/export")
def export_applicants_csv(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    result = AdminService.get_paginated_applications(db, page=1, limit=10000)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Application ID", "Student Name", "Student Email", "Society Name", "Status", "Submitted At"])

    for item in result["items"]:
        writer.writerow([
            item.id,
            item.student.name if item.student else "N/A",
            item.student.email if item.student else "N/A",
            item.society.name if item.society else "N/A",
            item.status.value,
            item.submitted_at.isoformat()
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=recruitment_applicants.csv"}
    )
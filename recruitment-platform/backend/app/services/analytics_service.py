from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.society import Society
from app.models.application import Application, ApplicationStatus

class AnalyticsService:
    @staticmethod
    def get_dashboard_metrics(db: Session) -> dict:
        total_societies = db.query(func.count(Society.id)).scalar() or 0
        active_societies = db.query(func.count(Society.id)).filter(Society.is_active == True).scalar() or 0
        total_applications = db.query(func.count(Application.id)).scalar() or 0

        status_counts = db.query(
            Application.status, func.count(Application.id)
        ).group_by(Application.status).all()

        counts_map = {status.value: count for status, count in status_counts}

        # Applications per society breakdown
        society_breakdown = db.query(
            Society.name, func.count(Application.id).label("count")
        ).join(Application, Society.id == Application.society_id)\
         .group_by(Society.name).all()

        return {
            "total_societies": total_societies,
            "active_societies": active_societies,
            "total_applications": total_applications,
            "pending_applications": counts_map.get("Pending", 0),
            "accepted_applications": counts_map.get("Accepted", 0),
            "rejected_applications": counts_map.get("Rejected", 0),
            "applications_by_society": [{"society": name, "count": count} for name, count in society_breakdown]
        }
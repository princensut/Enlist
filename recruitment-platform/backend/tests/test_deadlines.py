from datetime import datetime, timedelta, timezone
from app.models.society import Society
from app.models.user import User, UserRole
from app.core.security import create_access_token

def test_expired_deadline_rejection(client, db_session):
    # Setup student
    student = User(name="Stud2", email="stud2@test.com", password_hash="hash", role=UserRole.STUDENT)
    db_session.add(student)
    
    # Setup expired society
    expired_soc = Society(
        name="Expired Soc",
        description="Expired",
        category="Tech",
        deadline=datetime.now(timezone.utc) - timedelta(days=1),
        eligibility="All"
    )
    db_session.add(expired_soc)
    db_session.commit()

    token = create_access_token({"sub": student.id, "role": student.role.value})
    client.cookies.set("access_token", token)

    payload = {
        "society_id": expired_soc.id,
        "answers": {
            "branch": "CS",
            "year": "2nd",
            "skills": ["Python"],
            "experience": "Built apps",
            "why_join": "Interest in coding"
        }
    }
    response = client.post("/api/applications", json=payload)
    assert response.status_code == 400
    assert "closed" in response.json()["detail"].lower()
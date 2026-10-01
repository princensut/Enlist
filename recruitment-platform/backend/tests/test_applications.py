from datetime import datetime, timedelta, timezone
from app.models.society import Society
from app.models.user import User, UserRole
from app.core.security import create_access_token

def test_duplicate_application_prevention(client, db_session):
    student = User(name="Stud3", email="stud3@test.com", password_hash="hash", role=UserRole.STUDENT)
    db_session.add(student)

    active_soc = Society(
        name="Active Soc",
        description="Active",
        category="Tech",
        deadline=datetime.now(timezone.utc) + timedelta(days=5),
        eligibility="All"
    )
    db_session.add(active_soc)
    db_session.commit()

    token = create_access_token({"sub": student.id, "role": student.role.value})
    client.cookies.set("access_token", token)

    payload = {
        "society_id": active_soc.id,
        "answers": {
            "branch": "EC",
            "year": "3rd",
            "skills": ["C++"],
            "experience": "Robotics",
            "why_join": "Passionate about bots"
        }
    }

    # First attempt - Success
    res1 = client.post("/api/applications", json=payload)
    assert res1.status_code == 201

    # Second attempt - Duplicate Conflict
    res2 = client.post("/api/applications", json=payload)
    assert res2.status_code == 409
import sys
import os
from datetime import datetime, timedelta, timezone
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal
from app.models.society import Society
from app.models.user import User, UserRole
from app.core.security import hash_password

def seed_sample_data():
    db = SessionLocal()
    try:
        # Seed Test Student
        if not db.query(User).filter(User.email == "student@example.com").first():
            student = User(
                name="Alice Johnson",
                email="student@example.com",
                password_hash=hash_password("StudentPassword123!"),
                role=UserRole.STUDENT
            )
            db.add(student)

        # Seed Active & Expired Societies
        societies = [
            Society(
                name="Computer Society",
                description="The premier algorithmic and software engineering society.",
                category="Technical",
                deadline=datetime.now(timezone.utc) + timedelta(days=7),
                eligibility="Open to all years",
                is_active=True,
                contact_email="cs@college.edu"
            ),
            Society(
                name="Robotics Society",
                description="Designing autonomous bots and embedded hardware systems.",
                category="Technical",
                deadline=datetime.now(timezone.utc) - timedelta(days=2), # Expired deadline
                eligibility="Engineering students",
                is_active=True,
                contact_email="robotics@college.edu"
            ),
            Society(
                name="Debating League",
                description="Public speaking, parliament debates, and MUN competitions.",
                category="Cultural",
                deadline=datetime.now(timezone.utc) + timedelta(days=14),
                eligibility="Open to all students",
                is_active=True,
                contact_email="debate@college.edu"
            )
        ]

        for soc in societies:
            if not db.query(Society).filter(Society.name == soc.name).first():
                db.add(soc)

        db.commit()
        print("Successfully seeded sample test data.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_sample_data()
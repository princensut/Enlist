import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password

def seed_admin():
    db = SessionLocal()
    try:
        admin_email = "admin@college.edu"
        existing = db.query(User).filter(User.email == admin_email).first()
        if not existing:
            admin = User(
                name="Platform Administrator",
                email=admin_email,
                password_hash=hash_password("AdminSecurePassword123!"),
                role=UserRole.ADMIN
            )
            db.add(admin)
            db.commit()
            print(f"Successfully created admin user: {admin_email}")
        else:
            print(f"Admin user already exists: {admin_email}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
from app.database.session import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password

ADMIN_EMAIL = "admin@college.edu"
ADMIN_PASSWORD = "AdminSecurePassword123!"
ADMIN_NAME = "College Administrator"


def create_admin():
    db = SessionLocal()

    try:
        existing = (
            db.query(User)
            .filter(User.email == ADMIN_EMAIL)
            .first()
        )

        if existing:
            if existing.role != UserRole.ADMIN:
                existing.role = UserRole.ADMIN
                db.commit()
                print("Existing account promoted to ADMIN.")
            else:
                print("Admin account already exists.")

            return

        admin = User(
            name=ADMIN_NAME,
            email=ADMIN_EMAIL,
            password_hash=hash_password(ADMIN_PASSWORD),
            role=UserRole.ADMIN
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("Admin account created successfully.")
        print("Email:", ADMIN_EMAIL)
        print("Password:", ADMIN_PASSWORD)
        print("Role:", admin.role.value)

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
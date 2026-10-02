from app.database.session import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password

db = SessionLocal()

try:
    email = "admin@college.edu"

    existing = db.query(User).filter(User.email == email).first()

    if existing:
        existing.role = UserRole.ADMIN
        db.commit()
        print("Existing account promoted to ADMIN.")
    else:
        admin = User(
            name="College Administrator",
            email=email,
            password_hash=hash_password("AdminSecurePassword123!"),
            role=UserRole.ADMIN
        )

        db.add(admin)
        db.commit()

        print("Admin account created successfully.")

finally:
    db.close()
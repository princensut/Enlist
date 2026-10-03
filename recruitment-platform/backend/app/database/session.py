import ssl

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

# Import all models so SQLAlchemy knows about relationships
from app.models.user import User
from app.models.society import Society
from app.models.application import Application
from app.models.audit_log import AuditLog


# Use the pure-python driver and drop Aiven's "?ssl-mode=REQUIRED",
# which PyMySQL does not understand.
DATABASE_URL = settings.DATABASE_URL
if DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)
DATABASE_URL = DATABASE_URL.split("?")[0]

# Aiven requires an encrypted connection.
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=1,       # small pool: Vercel runs many short-lived instances
    max_overflow=0,
    connect_args={"ssl": ssl_ctx},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
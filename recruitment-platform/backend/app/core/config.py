import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "College Society Recruitment Platform"
    API_V1_STR: str = "/api"
    
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/recruitment_db"
    
    SECRET_KEY: str = "super-secret-key-change-this-in-production-environment-32chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    FRONTEND_URL: str = "http://localhost:5173"
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
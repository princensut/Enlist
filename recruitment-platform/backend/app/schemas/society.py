from pydantic import BaseModel, HttpUrl, EmailStr, Field
from datetime import datetime

class SocietyCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: str = Field(..., min_length=10)
    category: str = Field(..., min_length=2, max_length=100)
    deadline: datetime
    eligibility: str = Field(..., min_length=2)
    is_active: bool = True
    logo_url: str | None = None
    contact_email: EmailStr | None = None
    recruitment_instructions: str | None = None

class SocietyUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=150)
    description: str | None = Field(None, min_length=10)
    category: str | None = Field(None, min_length=2, max_length=100)
    deadline: datetime | None = None
    eligibility: str | None = None
    is_active: bool | None = None
    logo_url: str | None = None
    contact_email: EmailStr | None = None
    recruitment_instructions: str | None = None

class SocietyResponse(BaseModel):
    id: str
    name: str
    description: str
    category: str
    deadline: datetime
    eligibility: str
    is_active: bool
    logo_url: str | None = None
    contact_email: str | None = None
    recruitment_instructions: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
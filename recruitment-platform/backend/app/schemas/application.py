from pydantic import BaseModel, Field
from datetime import datetime
from app.models.application import ApplicationStatus
from app.schemas.society import SocietyResponse
from app.schemas.auth import AuthUserResponse

class ApplicationAnswers(BaseModel):
    branch: str = Field(..., min_length=2, max_length=100)
    year: str = Field(..., min_length=1, max_length=20)
    skills: list[str] = Field(..., min_items=1)
    experience: str = Field(..., min_length=5, max_length=2000)
    why_join: str = Field(..., min_length=10, max_length=2000)
    portfolio_url: str | None = None

class ApplicationSubmitRequest(BaseModel):
    society_id: str
    answers: ApplicationAnswers

class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus

class ApplicationResponse(BaseModel):
    id: str
    student_id: str
    society_id: str
    answers: dict
    status: ApplicationStatus
    submitted_at: datetime
    updated_at: datetime
    student: AuthUserResponse | None = None
    society: SocietyResponse | None = None

    class Config:
        from_attributes = True

class PaginatedApplicationsResponse(BaseModel):
    items: list[ApplicationResponse]
    page: int
    limit: int
    total: int
    pages: int
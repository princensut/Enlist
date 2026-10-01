from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthUserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    success: bool
    message: str
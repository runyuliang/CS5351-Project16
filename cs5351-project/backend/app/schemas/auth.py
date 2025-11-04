# auth.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    sub: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    email: EmailStr
    role: Optional[str] = "member"

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None

class UserRead(BaseModel):
    id: int
    username: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None
    role: Optional[str] = None

    class Config:
        from_attributes = True
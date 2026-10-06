from pydantic import EmailStr, Field

from app.schemas import CamelModel, RoastKey


class UserCreate(CamelModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(default="", max_length=128)


class UserLogin(CamelModel):
    email: EmailStr
    password: str


class UserResponse(CamelModel):
    id: int
    email: str
    name: str
    roasts: list[RoastKey]


class AuthResponse(CamelModel):
    token: str
    user: UserResponse


class NameUpdate(CamelModel):
    name: str = Field(min_length=1, max_length=128)


class PasswordUpdate(CamelModel):
    old_password: str
    password: str = Field(min_length=8, max_length=128)


class PreferencesUpdate(CamelModel):
    roasts: list[RoastKey] = Field(max_length=4)

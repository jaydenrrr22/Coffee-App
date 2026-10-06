from datetime import datetime

from pydantic import Field

from app.schemas import CamelModel, RoastKey


class ReviewCreate(CamelModel):
    place_id: str = Field(min_length=1, max_length=300)
    place_name: str = Field(min_length=1, max_length=200)
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1, max_length=1000)
    roast: RoastKey | None = None
    origin: str | None = Field(default=None, max_length=50)
    brew_method: str | None = Field(default=None, max_length=50)


class ReviewResponse(CamelModel):
    id: int
    place_id: str
    place_name: str
    user_id: int
    author_name: str
    rating: int
    comment: str
    roast: str | None
    origin: str | None
    brew_method: str | None
    created_at: datetime

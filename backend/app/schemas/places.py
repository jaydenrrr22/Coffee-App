from pydantic import Field

from app.schemas import CamelModel, RoastKey


class PlaceSearch(CamelModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    roasts: list[RoastKey] = Field(default_factory=list, max_length=4)

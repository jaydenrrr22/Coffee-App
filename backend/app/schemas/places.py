from pydantic import Field

from app.schemas import CamelModel, RoastKey


class PlaceSearch(CamelModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    roasts: list[RoastKey] = Field(default_factory=list, max_length=4)


class PlaceStatsQuery(CamelModel):
    place_ids: list[str] = Field(min_length=1, max_length=60, alias="placeIds")

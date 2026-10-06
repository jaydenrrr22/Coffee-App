import logging

import httpx
from fastapi import APIRouter, HTTPException, Path

from app.core.config import conf
from app.schemas.places import PlaceSearch
from app.services import google_places

router = APIRouter(prefix="/places", tags=["places"])
logger = logging.getLogger(__name__)


def _require_api_key():
    if not conf.google_places_api_key:
        raise HTTPException(
            status_code=503,
            detail="Shop search isn't set up yet. Add GOOGLE_PLACES_API_KEY to backend/.env.",
        )
    return conf.google_places_api_key


@router.post("/search")
async def search(payload: PlaceSearch):
    api_key = _require_api_key()
    try:
        places = await google_places.search_nearby(
            api_key, payload.latitude, payload.longitude, list(dict.fromkeys(payload.roasts))
        )
    except httpx.HTTPError as error:
        logger.error("Google Text Search failed: %s", error)
        raise HTTPException(status_code=502, detail="Shop search is temporarily unavailable")
    return {"places": places}


@router.get("/{place_id}")
async def details(place_id: str = Path(pattern=r"^[A-Za-z0-9_-]{10,300}$")):
    api_key = _require_api_key()
    try:
        place = await google_places.get_details(api_key, place_id)
    except google_places.PlaceNotFound:
        raise HTTPException(status_code=404, detail="Shop not found")
    except httpx.HTTPError as error:
        logger.error("Google Place Details failed: %s", error)
        raise HTTPException(status_code=502, detail="Shop details are temporarily unavailable")
    return {"place": place}

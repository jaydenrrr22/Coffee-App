import asyncio

import httpx

PLACES_API = "https://places.googleapis.com/v1"

ROAST_QUERIES = {
    "light": "light roast specialty coffee shop",
    "medium": "medium roast coffee shop",
    "medium-dark": "medium dark roast coffee shop",
    "dark": "dark roast espresso coffee shop",
}
DEFAULT_QUERY = "specialty coffee shop"

SEARCH_FIELDS = ",".join(
    [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.location",
        "places.rating",
        "places.userRatingCount",
    ]
)

DETAIL_FIELDS = [
    "id",
    "displayName",
    "formattedAddress",
    "location",
    "rating",
    "userRatingCount",
    "googleMapsUri",
    "websiteUri",
    "nationalPhoneNumber",
    "currentOpeningHours",
    "editorialSummary",
    "reviews",
]
# AI summaries aren't available for every region/account; the request is
# retried without them if Google rejects the field mask.
AI_FIELDS = ["reviewSummary", "generativeSummary"]

SEARCH_RADIUS_METERS = 8000
TIMEOUT_SECONDS = 10


class PlaceNotFound(Exception):
    pass


def _headers(api_key, field_mask):
    return {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": field_mask,
    }


def _summary(place):
    location = place.get("location") or {}
    return {
        "id": place["id"],
        "name": (place.get("displayName") or {}).get("text", "Unnamed shop"),
        "address": place.get("formattedAddress", ""),
        "latitude": location.get("latitude"),
        "longitude": location.get("longitude"),
        "rating": place.get("rating"),
        "ratingCount": place.get("userRatingCount", 0),
        "matchedRoasts": [],
    }


async def _search_text(client, api_key, text_query, latitude, longitude):
    response = await client.post(
        f"{PLACES_API}/places:searchText",
        headers=_headers(api_key, SEARCH_FIELDS),
        json={
            "textQuery": text_query,
            "maxResultCount": 20,
            "locationBias": {
                "circle": {
                    "center": {"latitude": latitude, "longitude": longitude},
                    "radius": SEARCH_RADIUS_METERS,
                }
            },
        },
    )
    response.raise_for_status()
    return response.json().get("places", [])


async def search_nearby(api_key, latitude, longitude, roasts):
    queries = [(None, DEFAULT_QUERY)] + [(r, ROAST_QUERIES[r]) for r in roasts]

    async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
        results = await asyncio.gather(
            *(_search_text(client, api_key, text, latitude, longitude) for _, text in queries)
        )

    by_id = {}
    for (roast, _), places in zip(queries, results):
        for place in places:
            if not place.get("location"):
                continue
            entry = by_id.setdefault(place["id"], _summary(place))
            if roast and roast not in entry["matchedRoasts"]:
                entry["matchedRoasts"].append(roast)
    return list(by_id.values())


async def get_details(api_key, place_id):
    url = f"{PLACES_API}/places/{place_id}"
    async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
        response = await client.get(
            url, headers=_headers(api_key, ",".join(DETAIL_FIELDS + AI_FIELDS))
        )
        if response.status_code == 400:
            response = await client.get(
                url, headers=_headers(api_key, ",".join(DETAIL_FIELDS))
            )
    if response.status_code == 404:
        raise PlaceNotFound(place_id)
    response.raise_for_status()

    place = response.json()
    review_summary = place.get("reviewSummary") or {}
    generative_summary = place.get("generativeSummary") or {}
    ai_text = (review_summary.get("text") or {}).get("text") or (
        generative_summary.get("overview") or {}
    ).get("text")
    ai_disclosure = (review_summary.get("disclosureText") or {}).get("text") or (
        generative_summary.get("disclosureText") or {}
    ).get("text")
    hours = place.get("currentOpeningHours") or {}

    return {
        **_summary(place),
        "mapsUri": place.get("googleMapsUri"),
        "website": place.get("websiteUri"),
        "phone": place.get("nationalPhoneNumber"),
        "openNow": hours.get("openNow"),
        "hours": hours.get("weekdayDescriptions", []),
        "editorialSummary": (place.get("editorialSummary") or {}).get("text"),
        "aiSummary": {"text": ai_text, "disclosure": ai_disclosure} if ai_text else None,
        "reviews": [
            {
                "author": (r.get("authorAttribution") or {}).get("displayName", "Google user"),
                "authorUri": (r.get("authorAttribution") or {}).get("uri"),
                "rating": r.get("rating"),
                "text": (r.get("text") or {}).get("text")
                or (r.get("originalText") or {}).get("text", ""),
                "relativeTime": r.get("relativePublishTimeDescription"),
            }
            for r in place.get("reviews", [])
        ],
    }

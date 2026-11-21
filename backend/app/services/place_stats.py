from sqlalchemy.orm import Session

from app.models.place_stat import PlaceStat
from app.models.review import Review

COMMUNITY_WEIGHT = 2
GOOGLE_WEIGHT = 1


def _bump(counts: dict, value: str | None):
    if value:
        counts[value] = counts.get(value, 0) + 1


def aggregate_reviews_in_memory(reviews: list[Review]) -> dict[str, dict]:
    """Group reviews into per-place dictionaries without extra DB round-trips."""
    buckets: dict[str, dict] = {}
    for review in reviews:
        bucket = buckets.get(review.place_id)
        if bucket is None:
            bucket = {
                "count": 0,
                "total_rating": 0,
                "roasts": {},
                "origins": {},
                "brew_methods": {},
            }
            buckets[review.place_id] = bucket
        bucket["count"] += 1
        bucket["total_rating"] += review.rating
        _bump(bucket["roasts"], review.roast)
        _bump(bucket["origins"], review.origin)
        _bump(bucket["brew_methods"], review.brew_method)

    summaries = {}
    for place_id, bucket in buckets.items():
        summaries[place_id] = {
            "count": bucket["count"],
            "averageRating": (
                bucket["total_rating"] / bucket["count"] if bucket["count"] else None
            ),
            "roasts": bucket["roasts"],
            "origins": bucket["origins"],
            "brewMethods": bucket["brew_methods"],
        }
    return summaries


def refresh_place_stats(db: Session, place_ids: list[str]) -> dict[str, dict]:
    """
    Replace iterative per-shop lookups with:
    1) one IN query for all place IDs
    2) in-memory dictionary aggregation
    3) one SQLAlchemy batch-write (updates + add_all + single commit)
    """
    unique_ids = list(dict.fromkeys(pid for pid in place_ids if pid))
    if not unique_ids:
        return {}

    reviews = db.query(Review).filter(Review.place_id.in_(unique_ids)).all()
    summaries = aggregate_reviews_in_memory(reviews)

    existing = {
        row.place_id: row
        for row in db.query(PlaceStat).filter(PlaceStat.place_id.in_(unique_ids)).all()
    }
    to_add = []

    for place_id, summary in summaries.items():
        row = existing.get(place_id)
        if row is None:
            to_add.append(
                PlaceStat(
                    place_id=place_id,
                    review_count=summary["count"],
                    average_rating=summary["averageRating"],
                    roasts=summary["roasts"],
                    origins=summary["origins"],
                    brew_methods=summary["brewMethods"],
                )
            )
        else:
            row.review_count = summary["count"]
            row.average_rating = summary["averageRating"]
            row.roasts = summary["roasts"]
            row.origins = summary["origins"]
            row.brew_methods = summary["brewMethods"]

    for place_id, row in existing.items():
        if place_id not in summaries:
            db.delete(row)

    if to_add:
        db.add_all(to_add)
    db.commit()
    return summaries


def load_place_summaries(db: Session, place_ids: list[str]) -> dict[str, dict]:
    unique_ids = list(dict.fromkeys(pid for pid in place_ids if pid))
    if not unique_ids:
        return {}

    rows = db.query(PlaceStat).filter(PlaceStat.place_id.in_(unique_ids)).all()
    found = {row.place_id for row in rows}
    missing = [pid for pid in unique_ids if pid not in found]

    summaries = {
        row.place_id: {
            "count": row.review_count,
            "averageRating": row.average_rating,
            "roasts": row.roasts or {},
            "origins": row.origins or {},
            "brewMethods": row.brew_methods or {},
        }
        for row in rows
    }

    # Build cache for shops that have reviews but no stats row yet.
    if missing:
        summaries.update(refresh_place_stats(db, missing))
    return summaries


def rank_places(places: list[dict], summaries: dict[str, dict], preferred_roasts: list[str]):
    ranked = []
    for place in places:
        roast_counts = (summaries.get(place["id"]) or {}).get("roasts") or {}
        community_matches = [r for r in preferred_roasts if roast_counts.get(r)]
        matched = place.get("matchedRoasts") or []
        google_matches = [r for r in preferred_roasts if r in matched]
        score = (
            sum(roast_counts[r] * COMMUNITY_WEIGHT for r in community_matches)
            + len(google_matches) * GOOGLE_WEIGHT
        )
        ranked.append(
            {
                **place,
                "score": score,
                "communityMatches": community_matches,
                "googleMatches": google_matches,
            }
        )
    ranked.sort(
        key=lambda p: (p["score"], p.get("rating") or 0),
        reverse=True,
    )
    return ranked

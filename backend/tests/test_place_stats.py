from app.models.place_stat import PlaceStat
from app.models.review import Review
from app.services.place_stats import (
    aggregate_reviews_in_memory,
    rank_places,
    refresh_place_stats,
)


def test_in_memory_aggregation_and_batch_write(client, auth_headers):
    batch = client.post(
        "/reviews/batch",
        headers=auth_headers,
        json={
            "reviews": [
                {
                    "placeId": "shop-b",
                    "placeName": "Beta",
                    "rating": 5,
                    "comment": "Light and bright",
                    "roast": "light",
                    "origin": "Ethiopia",
                    "brewMethod": "Pour-over",
                },
                {
                    "placeId": "shop-b",
                    "placeName": "Beta",
                    "rating": 3,
                    "comment": "Another light cup",
                    "roast": "light",
                    "origin": "Colombia",
                    "brewMethod": "Espresso",
                },
                {
                    "placeId": "shop-a",
                    "placeName": "Alpha",
                    "rating": 4,
                    "comment": "Dark roast",
                    "roast": "dark",
                },
            ]
        },
    )
    assert batch.status_code == 201, batch.text
    assert len(batch.json()) == 3

    stats = client.post("/places/stats", json={"placeIds": ["shop-a", "shop-b"]})
    assert stats.status_code == 200
    summaries = stats.json()["summaries"]
    assert summaries["shop-b"]["roasts"] == {"light": 2}
    assert summaries["shop-b"]["origins"] == {"Ethiopia": 1, "Colombia": 1}
    assert summaries["shop-b"]["count"] == 2
    assert summaries["shop-a"]["roasts"] == {"dark": 1}


def test_aggregate_and_rank_helpers():
    reviews = [
        Review(
            place_id="B",
            place_name="Beta",
            user_id=1,
            author_name="T",
            rating=5,
            comment="x",
            roast="light",
            origin="Ethiopia",
            brew_method="Pour-over",
        ),
        Review(
            place_id="B",
            place_name="Beta",
            user_id=1,
            author_name="T",
            rating=3,
            comment="y",
            roast="light",
        ),
        Review(
            place_id="A",
            place_name="Alpha",
            user_id=1,
            author_name="T",
            rating=5,
            comment="z",
            roast="dark",
        ),
    ]
    summaries = aggregate_reviews_in_memory(reviews)
    assert summaries["B"]["roasts"] == {"light": 2}
    assert summaries["B"]["averageRating"] == 4

    places = [
        {"id": "A", "name": "Alpha", "rating": 4.2, "matchedRoasts": ["light"]},
        {"id": "B", "name": "Beta", "rating": 4.8, "matchedRoasts": []},
    ]
    ranked = rank_places(places, summaries, ["light"])
    assert [p["name"] for p in ranked] == ["Beta", "Alpha"]
    assert ranked[0]["score"] == 4
    assert ranked[1]["score"] == 1


def test_refresh_place_stats_uses_single_batch_write(client, auth_headers):
    client.post(
        "/reviews",
        headers=auth_headers,
        json={
            "placeId": "shop-c",
            "placeName": "Cafe C",
            "rating": 5,
            "comment": "Nice",
            "roast": "medium",
        },
    )
    # Creating a review should batch-refresh place_stats.
    from app.dependencies.database import SessionLocal

    db = SessionLocal()
    try:
        rows = db.query(PlaceStat).filter(PlaceStat.place_id == "shop-c").all()
        assert len(rows) == 1
        assert rows[0].roasts == {"medium": 1}

        # Calling refresh again replaces rows in one batch write, not row-by-row inserts.
        refresh_place_stats(db, ["shop-c"])
        rows = db.query(PlaceStat).filter(PlaceStat.place_id == "shop-c").all()
        assert len(rows) == 1
    finally:
        db.close()

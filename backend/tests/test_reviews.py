def test_create_and_list_reviews(client, auth_headers):
    create = client.post(
        "/reviews",
        json={
            "placeId": "ChIJBBBBBBBBBB2",
            "placeName": "Beta",
            "rating": 5,
            "comment": "Bright light roast",
            "roast": "light",
            "origin": "Ethiopia",
            "brewMethod": "Pour-over",
        },
        headers=auth_headers,
    )
    assert create.status_code == 201
    review = create.json()
    assert review["roast"] == "light"
    assert review["origin"] == "Ethiopia"
    assert review["brewMethod"] == "Pour-over"
    assert review["authorName"] == "Tester"

    unauth = client.post(
        "/reviews",
        json={
            "placeId": "x",
            "placeName": "x",
            "rating": 5,
            "comment": "nope",
        },
    )
    assert unauth.status_code == 401

    bad_rating = client.post(
        "/reviews",
        json={
            "placeId": "x",
            "placeName": "x",
            "rating": 9,
            "comment": "too high",
        },
        headers=auth_headers,
    )
    assert bad_rating.status_code == 422

    by_place = client.get("/reviews", params={"placeId": "ChIJBBBBBBBBBB2"})
    assert by_place.status_code == 200
    assert len(by_place.json()) == 1

    by_places = client.get(
        "/reviews", params={"placeIds": "ChIJBBBBBBBBBB2,ChIJAAAAAAAAAA1"}
    )
    assert by_places.status_code == 200
    assert len(by_places.json()) == 1

    by_roast = client.get("/reviews", params={"roast": "light"})
    assert by_roast.status_code == 200
    assert by_roast.json()[0]["placeName"] == "Beta"

    missing_filter = client.get("/reviews")
    assert missing_filter.status_code == 400

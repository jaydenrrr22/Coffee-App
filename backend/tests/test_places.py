def test_search_and_details(client, mock_google):
    search = client.post(
        "/places/search",
        json={"latitude": 40.7, "longitude": -74.0, "roasts": ["light"]},
    )
    assert search.status_code == 200
    places = search.json()["places"]
    names = {place["name"]: place["matchedRoasts"] for place in places}
    assert names["Alpha"] == ["light"]
    assert names["Beta"] == []

    details = client.get("/places/ChIJAAAAAAAAAA1")
    assert details.status_code == 200
    place = details.json()["place"]
    assert place["name"] == "Alpha"
    assert place["openNow"] is True
    assert place["reviews"][0]["author"] == "Kim"


def test_invalid_place_id(client, mock_google):
    short = client.get("/places/abc")
    assert short.status_code == 422

import json
import os
import uuid
from pathlib import Path

import httpx
import pytest
from fastapi.testclient import TestClient

# Configure a throwaway SQLite DB before the app imports its engine.
TEST_DB = Path(__file__).resolve().parent / "test.db"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB}"
os.environ["SECRET_KEY"] = "unit-test-secret-key-32chars-min!!"
os.environ["GOOGLE_PLACES_API_KEY"] = "test-google-key"

if TEST_DB.exists():
    TEST_DB.unlink()

from app.main import app  # noqa: E402
from app.services import google_places  # noqa: E402


@pytest.fixture()
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def auth_headers(client):
    email = f"tester-{uuid.uuid4().hex[:8]}@example.com"
    response = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "secret123",
            "name": "Tester",
        },
    )
    assert response.status_code == 201, response.text
    token = response.json()["token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def mock_google(monkeypatch):
    def handler(request: httpx.Request) -> httpx.Response:
        if str(request.url).endswith(":searchText"):
            body = json.loads(request.content)
            query = body["textQuery"]
            places = [
                {
                    "id": "ChIJAAAAAAAAAA1",
                    "displayName": {"text": "Alpha"},
                    "formattedAddress": "1 Main St",
                    "location": {"latitude": 40.7, "longitude": -74.0},
                    "rating": 4.5,
                    "userRatingCount": 10,
                }
            ]
            if "light" not in query:
                places.append(
                    {
                        "id": "ChIJBBBBBBBBBB2",
                        "displayName": {"text": "Beta"},
                        "formattedAddress": "2 Main St",
                        "location": {"latitude": 40.71, "longitude": -74.01},
                        "rating": 4.8,
                        "userRatingCount": 20,
                    }
                )
            return httpx.Response(200, json={"places": places})

        if "reviewSummary" in request.headers.get("X-Goog-FieldMask", ""):
            return httpx.Response(400, text="unsupported field")

        return httpx.Response(
            200,
            json={
                "id": "ChIJAAAAAAAAAA1",
                "displayName": {"text": "Alpha"},
                "formattedAddress": "1 Main St",
                "location": {"latitude": 40.7, "longitude": -74.0},
                "rating": 4.5,
                "userRatingCount": 10,
                "googleMapsUri": "https://maps.example/alpha",
                "currentOpeningHours": {"openNow": True},
                "reviews": [
                    {
                        "authorAttribution": {"displayName": "Kim"},
                        "rating": 5,
                        "text": {"text": "Great"},
                    }
                ],
            },
        )

    real_client = httpx.AsyncClient

    def factory(**kwargs):
        return real_client(transport=httpx.MockTransport(handler), **kwargs)

    monkeypatch.setattr(google_places.httpx, "AsyncClient", factory)

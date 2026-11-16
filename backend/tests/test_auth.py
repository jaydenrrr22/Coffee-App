def test_register_login_and_me(client):
    register = client.post(
        "/auth/register",
        json={"email": "Lee@Example.com", "password": "secret123", "name": "Lee"},
    )
    assert register.status_code == 201
    body = register.json()
    assert body["user"]["email"] == "lee@example.com"
    assert body["token"]

    duplicate = client.post(
        "/auth/register",
        json={"email": "lee@example.com", "password": "secret123"},
    )
    assert duplicate.status_code == 400

    bad = client.post(
        "/auth/login",
        json={"email": "lee@example.com", "password": "wrong-password"},
    )
    assert bad.status_code == 401

    login = client.post(
        "/auth/login",
        json={"email": "lee@example.com", "password": "secret123"},
    )
    assert login.status_code == 200
    headers = {"Authorization": f"Bearer {login.json()['token']}"}

    me = client.get("/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["name"] == "Lee"


def test_update_name_preferences_password_and_deactivate(client, auth_headers):
    name = client.patch("/auth/me", json={"name": "Jayden"}, headers=auth_headers)
    assert name.status_code == 200
    assert name.json()["name"] == "Jayden"

    prefs = client.put(
        "/auth/me/preferences",
        json={"roasts": ["light", "light", "dark"]},
        headers=auth_headers,
    )
    assert prefs.status_code == 200
    assert prefs.json()["roasts"] == ["light", "dark"]

    bad_roast = client.put(
        "/auth/me/preferences",
        json={"roasts": ["burnt"]},
        headers=auth_headers,
    )
    assert bad_roast.status_code == 422

    wrong_pw = client.put(
        "/auth/me/password",
        json={"oldPassword": "nope", "password": "newsecret1"},
        headers=auth_headers,
    )
    assert wrong_pw.status_code == 400

    password = client.put(
        "/auth/me/password",
        json={"oldPassword": "secret123", "password": "newsecret1"},
        headers=auth_headers,
    )
    assert password.status_code == 204

    deactivate = client.post("/auth/me/deactivate", headers=auth_headers)
    assert deactivate.status_code == 204

    me = client.get("/auth/me", headers=auth_headers)
    assert me.status_code == 401

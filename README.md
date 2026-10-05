# Bluenolia

Bluenolia helps coffee lovers discover nearby cafés that serve the beans and roasts they love, powered by community reviews.

- **Find coffee**: enter a ZIP code and see nearby shops ranked by your roast preferences.
- **Learn**: roast guides with flavor notes and the best ways to brew each roast.
- **Review**: logged-in users review a visit and tag the roast, origin, and brew method they had. Those tags feed back into shop rankings (green tags), alongside Google keyword matches (yellow tags).

The project has two parts: the Expo app (repo root) and a FastAPI + MySQL backend (`backend/`). The app never talks to MySQL or Google directly; it calls the backend.

## 1. Start the backend

Requires Python 3.11+ and a running MySQL server.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then edit DB_PASSWORD, SECRET_KEY, GOOGLE_PLACES_API_KEY
python -m app.main
```

On startup the server creates the `DB_NAME` database and its `users` and `reviews` tables if they don't exist. Check it's up at <http://localhost:8000/health>, and browse the API at <http://localhost:8000/docs>.

`backend/.env` settings:

| Variable                      | Purpose                                                        |
| ----------------------------- | -------------------------------------------------------------- |
| `DB_HOST`, `DB_PORT`          | MySQL server address                                           |
| `DB_NAME`                     | Database name (created automatically)                          |
| `DB_USER`, `DB_PASSWORD`      | MySQL login                                                    |
| `SECRET_KEY`                  | Signs login tokens; use a long random string                   |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | How long a login lasts (default 7 days)                        |
| `GOOGLE_PLACES_API_KEY`       | Google **Places API (New)** key; shop search is off without it |
| `APP_HOST`, `APP_PORT`        | `0.0.0.0` lets phones on your Wi-Fi reach the server           |

Generate a secret key with `python3 -c "import secrets; print(secrets.token_hex(32))"`.

## 2. Start the app

```bash
npm install
npx expo start
```

The app finds the backend automatically at `http://<computer running expo start>:8000`, which works for the iOS simulator, Android emulator, and a phone on the same Wi-Fi. To point it somewhere else, set `EXPO_PUBLIC_API_URL` in the root `.env` (see `.env.example`).

## API overview

| Method | Path                    | Auth | Purpose                                     |
| ------ | ----------------------- | ---- | ------------------------------------------- |
| POST   | `/auth/register`        |      | Create account, returns token + user        |
| POST   | `/auth/login`           |      | Log in, returns token + user                |
| GET    | `/auth/me`              | yes  | Current user                                |
| PATCH  | `/auth/me`              | yes  | Update display name                         |
| PUT    | `/auth/me/password`     | yes  | Change password                             |
| PUT    | `/auth/me/preferences`  | yes  | Save roast preferences                      |
| POST   | `/auth/me/deactivate`   | yes  | Deactivate account                          |
| GET    | `/reviews`              |      | Filter by `placeId`, `placeIds`, or `roast` |
| POST   | `/reviews`              | yes  | Create a review                             |
| POST   | `/places/search`        |      | Nearby shops (Google Text Search)           |
| GET    | `/places/{placeId}`     |      | Shop details (Google Place Details)         |

## Notes

- AI summaries on the shop page come from Google's own review summaries (Places API `reviewSummary` / `generativeSummary`). These aren't available for every place or region; when missing, the page falls back to Google's editorial summary.
- Google's terms limit storing Places content. The backend passes Google details and reviews through without saving them; only the place ID and shop name are stored with each Bluenolia review.

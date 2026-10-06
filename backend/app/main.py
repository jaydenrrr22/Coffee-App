from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from sqlalchemy.exc import OperationalError, ProgrammingError
from starlette.middleware.cors import CORSMiddleware

from app.core.config import conf
from app.models import model_loader
from app.routers import index as indexRoute

if not conf.secret_key:
    raise RuntimeError("SECRET_KEY is not set. Add it to backend/.env.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        model_loader.index()
    except OperationalError as error:
        raise RuntimeError(
            f"Could not connect to MySQL as '{conf.db_user}'@'{conf.db_host}:{conf.db_port}'. "
            "Check that MySQL is running and that DB_USER / DB_PASSWORD in backend/.env are correct. "
            f"MySQL said: {error.orig}"
        ) from None
    except ProgrammingError as error:
        raise RuntimeError(
            f"MySQL rejected the login for '{conf.db_user}'. "
            "Check DB_USER / DB_PASSWORD in backend/.env. "
            f"MySQL said: {error.orig}"
        ) from None
    yield


app = FastAPI(title="Bluenolia API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

indexRoute.load_routes(app)


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("app.main:app", host=conf.app_host, port=conf.app_port, reload=True)

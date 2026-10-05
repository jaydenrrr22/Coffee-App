from app.dependencies.database import Base, engine, ensure_database_exists
from app.models import review, user  # noqa: F401  (registers tables on Base)


def index():
    ensure_database_exists()
    Base.metadata.create_all(bind=engine)

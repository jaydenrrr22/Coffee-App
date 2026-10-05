from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import conf


def _mysql_url(database=None):
    return URL.create(
        "mysql+mysqlconnector",
        username=conf.db_user,
        password=conf.db_password,
        host=conf.db_host,
        port=conf.db_port,
        database=database,
    )


def ensure_database_exists():
    if conf.database_url:
        return
    server_engine = create_engine(_mysql_url())
    with server_engine.connect() as connection:
        connection.execute(
            text(
                f"CREATE DATABASE IF NOT EXISTS `{conf.db_name}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        )
    server_engine.dispose()


engine = create_engine(
    conf.database_url or _mysql_url(conf.db_name), pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func

from app.dependencies.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    place_id = Column(String(300), index=True, nullable=False)
    place_name = Column(String(200), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    author_name = Column(String(128), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(String(1000), nullable=False)
    roast = Column(String(20), index=True, nullable=True)
    origin = Column(String(50), nullable=True)
    brew_method = Column(String(50), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

from sqlalchemy import JSON, Column, DateTime, Float, Integer, String, UniqueConstraint, func

from app.dependencies.database import Base


class PlaceStat(Base):
    """Cached community-tag summary per shop, refreshed via batch writes."""

    __tablename__ = "place_stats"
    __table_args__ = (UniqueConstraint("place_id", name="uq_place_stats_place_id"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    place_id = Column(String(300), index=True, nullable=False)
    review_count = Column(Integer, nullable=False, default=0)
    average_rating = Column(Float, nullable=True)
    roasts = Column(JSON, nullable=False, default=dict)
    origins = Column(JSON, nullable=False, default=dict)
    brew_methods = Column(JSON, nullable=False, default=dict)
    updated_at = Column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )

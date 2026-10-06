from sqlalchemy import JSON, Boolean, Column, DateTime, Integer, String, func

from app.dependencies.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False, default="")
    hashed_password = Column(String(255), nullable=False)
    roast_preferences = Column(JSON, nullable=False, default=list)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    @property
    def roasts(self):
        return self.roast_preferences or []

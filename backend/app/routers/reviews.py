from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.dependencies.database import get_db
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewBatchCreate, ReviewCreate, ReviewResponse
from app.services.place_stats import refresh_place_stats

router = APIRouter(prefix="/reviews", tags=["reviews"])

MAX_PLACE_IDS = 60


def _review_from_payload(payload: ReviewCreate, user: User) -> Review:
    return Review(
        place_id=payload.place_id,
        place_name=payload.place_name.strip(),
        user_id=user.id,
        author_name=user.name or user.email.split("@")[0],
        rating=payload.rating,
        comment=payload.comment.strip(),
        roast=payload.roast,
        origin=payload.origin,
        brew_method=payload.brew_method,
    )


@router.get("", response_model=list[ReviewResponse])
def list_reviews(
    place_id: str | None = Query(default=None, alias="placeId"),
    place_ids: str | None = Query(default=None, alias="placeIds"),
    roast: str | None = None,
    limit: int = Query(default=50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(Review)
    if place_id:
        query = query.filter(Review.place_id == place_id)
    elif place_ids:
        ids = [pid for pid in place_ids.split(",") if pid][:MAX_PLACE_IDS]
        query = query.filter(Review.place_id.in_(ids))
    elif roast:
        query = query.filter(Review.roast == roast)
    else:
        raise HTTPException(
            status_code=400, detail="Provide placeId, placeIds, or roast"
        )
    return query.order_by(Review.created_at.desc(), Review.id.desc()).limit(limit).all()


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    review = _review_from_payload(payload, user)
    db.add(review)
    db.commit()
    db.refresh(review)
    refresh_place_stats(db, [review.place_id])
    return review


@router.post(
    "/batch",
    response_model=list[ReviewResponse],
    status_code=status.HTTP_201_CREATED,
)
def create_reviews_batch(
    payload: ReviewBatchCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reviews = [_review_from_payload(item, user) for item in payload.reviews]
    db.add_all(reviews)
    db.commit()
    for review in reviews:
        db.refresh(review)
    refresh_place_stats(db, [review.place_id for review in reviews])
    return reviews

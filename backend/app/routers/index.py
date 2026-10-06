from app.routers import auth, places, reviews


def load_routes(app):
    app.include_router(auth.router)
    app.include_router(reviews.router)
    app.include_router(places.router)

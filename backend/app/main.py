from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import get_settings
from app.database.mongo import close_mongo_connection, connect_to_mongo
from app.routers import admin, auth, notifications, reservations, reviews, tools

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(title=settings.app_name, version='1.0.0', lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
app.include_router(auth.router)
app.include_router(tools.router)
app.include_router(reservations.router)
app.include_router(reviews.router)
app.include_router(notifications.router)
app.include_router(admin.router)

@app.get('/health', tags=['System'])
async def health():
    return {'status': 'ok', 'service': settings.app_name}

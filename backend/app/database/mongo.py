from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config.settings import get_settings

class Mongo:
    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None
mongo = Mongo()

async def connect_to_mongo() -> None:
    settings = get_settings()
    mongo.client = AsyncIOMotorClient(settings.mongodb_uri)
    mongo.db = mongo.client[settings.mongodb_db]
    await create_indexes(mongo.db)
    
async def close_mongo_connection() -> None:
    if mongo.client:
        mongo.client.close()

def get_database() -> AsyncIOMotorDatabase:
    if mongo.db is None:
        raise RuntimeError('MongoDB connection has not been initialized')
    return mongo.db

async def create_indexes(db: AsyncIOMotorDatabase) -> None:
    await db.users.create_index('email', unique=True)
    await db.tools.create_index([('name', 'text'), ('description', 'text'), ('category', 'text')])
    await db.tools.create_index('owner_id')
    await db.reservations.create_index('tool_id')
    await db.reservations.create_index('borrower_id')
    await db.reservations.create_index('owner_id')
    await db.reviews.create_index([('tool_id', 1), ('borrower_id', 1), ('reservation_id', 1)], unique=True)
    await db.notifications.create_index('user_id')

from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.common import now_utc

async def create_notification(
    db: AsyncIOMotorDatabase, 
    user_id, 
    title: str, 
    message: str
) -> None:
    await db.notifications.insert_one({
        'user_id': user_id,
        'title': title,
        'message': message,
        'read': False,
        'created_at': now_utc()
    })
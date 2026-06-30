from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.auth.security import get_current_user
from app.database.mongo import get_database
from app.database.object_id import oid, serialize_doc
from app.schemas.notifications import NotificationPublic

router = APIRouter(prefix='/notifications', tags=['Notifications'])

@router.get('', response_model=list[NotificationPublic])
async def list_notifications(current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    docs = await db.notifications.find({'user_id': oid(current_user['id'])}).sort('created_at', -1).to_list(None)
    return [serialize_doc(d) for d in docs]

@router.put('/{notification_id}/read', response_model=NotificationPublic)
async def mark_read(notification_id: str, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    item = await db.notifications.find_one({'_id': oid(notification_id), 'user_id': oid(current_user['id'])})
    if not item: raise HTTPException(status_code=404, detail='Notification not found')
    await db.notifications.update_one({'_id': item['_id']}, {'$set': {'read': True}})
    return serialize_doc(await db.notifications.find_one({'_id': item['_id']}))

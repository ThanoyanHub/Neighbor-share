from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.auth.security import require_admin
from app.database.mongo import get_database
from app.database.object_id import serialize_doc

router = APIRouter(prefix='/admin', tags=['Admin'], dependencies=[Depends(require_admin)])

@router.get('/users')
async def users(db: AsyncIOMotorDatabase = Depends(get_database)):
    docs = await db.users.find({}, {'hashed_password': 0}).sort('created_at', -1).to_list(None)
    return [serialize_doc(d) for d in docs]

@router.get('/tools')
async def tools(db: AsyncIOMotorDatabase = Depends(get_database)):
    return [serialize_doc(d) for d in await db.tools.find({}).sort('created_at', -1).to_list(None)]

@router.get('/reservations')
async def reservations(db: AsyncIOMotorDatabase = Depends(get_database)):
    return [serialize_doc(d) for d in await db.reservations.find({}).sort('created_at', -1).to_list(None)]

@router.get('/reviews')
async def reviews(db: AsyncIOMotorDatabase = Depends(get_database)):
    return [serialize_doc(d) for d in await db.reviews.find({}).sort('created_at', -1).to_list(None)]

@router.get('/stats')
async def stats(db: AsyncIOMotorDatabase = Depends(get_database)):
    reservations = await db.reservations.count_documents({})
    confirmed = await db.reservations.count_documents({'status': 'Confirmed'})
    return {'users': await db.users.count_documents({}), 'tools': await db.tools.count_documents({}), 'reservations': reservations, 'confirmed_reservations': confirmed, 'reviews': await db.reviews.count_documents({}), 'notifications': await db.notifications.count_documents({})}

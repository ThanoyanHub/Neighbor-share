from datetime import date
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.enums import ReservationStatus

async def ensure_no_confirmed_conflict(db: AsyncIOMotorDatabase, tool_id, start_date: date, end_date: date) -> None:
    conflict = await db.reservations.find_one({
        'tool_id': tool_id,
        'status': ReservationStatus.CONFIRMED,
        'start_date': {'$lte': end_date.isoformat()},
        'end_date': {'$gte': start_date.isoformat()},
    })
    if conflict:
        raise HTTPException(status_code=409, detail='Selected dates conflict with an existing confirmed reservation')

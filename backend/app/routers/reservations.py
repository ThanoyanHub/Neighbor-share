from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.auth.security import get_current_user
from app.database.mongo import get_database
from app.database.object_id import oid, serialize_doc
from app.models.common import now_utc
from app.models.enums import ReservationStatus
from app.schemas.reservations import ReservationCreate, ReservationPublic
from app.services.notifications import create_notification
from app.services.reservations import ensure_no_confirmed_conflict

router = APIRouter(prefix='/reservations', tags=['Reservations'])

def days_between(start: date, end: date) -> int:
    return (end - start).days + 1

@router.post('', response_model=ReservationPublic, status_code=201)
async def create_reservation(payload: ReservationCreate, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    tool = await db.tools.find_one({'_id': oid(payload.tool_id)})
    if not tool: raise HTTPException(status_code=404, detail='Tool not found')
    if str(tool['owner_id']) == current_user['id']: raise HTTPException(status_code=400, detail='Owners cannot borrow their own tools')
    blackout = set(tool.get('blackout_dates', []))
    selected = {(payload.start_date).toordinal() + i for i in range(days_between(payload.start_date, payload.end_date))}
    if any(date.fromordinal(d).isoformat() in blackout for d in selected): raise HTTPException(status_code=409, detail='Selected dates include owner blackout dates')
    now = now_utc(); total = days_between(payload.start_date, payload.end_date) * float(tool['daily_rate'])
    doc = {'tool_id': tool['_id'], 'tool_name': tool['name'], 'borrower_id': oid(current_user['id']), 'borrower_name': current_user['full_name'], 'owner_id': tool['owner_id'], 'owner_name': tool['owner_name'], 'start_date': payload.start_date.isoformat(), 'end_date': payload.end_date.isoformat(), 'status': ReservationStatus.PENDING, 'total_price': total, 'created_at': now, 'updated_at': now}
    result = await db.reservations.insert_one(doc)
    await create_notification(db, tool['owner_id'], 'Reservation submitted', f"{current_user['full_name']} requested {tool['name']}.")
    return serialize_doc(await db.reservations.find_one({'_id': result.inserted_id}))

@router.get('', response_model=list[ReservationPublic])
async def list_reservations(current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    query = {} if current_user['role'] == 'admin' else {'$or': [{'borrower_id': oid(current_user['id'])}, {'owner_id': oid(current_user['id'])}]}
    docs = await db.reservations.find(query).sort('created_at', -1).to_list(None)
    return [serialize_doc(d) for d in docs]

async def owned_pending(reservation_id, current_user, db):
    res = await db.reservations.find_one({'_id': oid(reservation_id)})
    if not res: raise HTTPException(status_code=404, detail='Reservation not found')
    if str(res['owner_id']) != current_user['id'] and current_user['role'] != 'admin': raise HTTPException(status_code=403, detail='Only the owner can manage this request')
    if res['status'] != ReservationStatus.PENDING: raise HTTPException(status_code=400, detail='Only pending reservations can be changed here')
    return res

@router.put('/{reservation_id}/approve', response_model=ReservationPublic)
async def approve(reservation_id: str, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    res = await owned_pending(reservation_id, current_user, db)
    await ensure_no_confirmed_conflict(db, res['tool_id'], date.fromisoformat(res['start_date']), date.fromisoformat(res['end_date']))
    await db.reservations.update_one({'_id': res['_id']}, {'$set': {'status': ReservationStatus.CONFIRMED, 'updated_at': now_utc()}})
    await create_notification(db, res['borrower_id'], 'Reservation approved', f"Your request for {res['tool_name']} was approved.")
    return serialize_doc(await db.reservations.find_one({'_id': res['_id']}))

@router.put('/{reservation_id}/decline', response_model=ReservationPublic)
async def decline(reservation_id: str, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    res = await owned_pending(reservation_id, current_user, db)
    await db.reservations.update_one({'_id': res['_id']}, {'$set': {'status': ReservationStatus.DECLINED, 'updated_at': now_utc()}})
    await create_notification(db, res['borrower_id'], 'Reservation declined', f"Your request for {res['tool_name']} was declined.")
    return serialize_doc(await db.reservations.find_one({'_id': res['_id']}))

@router.put('/{reservation_id}/cancel', response_model=ReservationPublic)
async def cancel(reservation_id: str, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    res = await db.reservations.find_one({'_id': oid(reservation_id)})
    if not res: raise HTTPException(status_code=404, detail='Reservation not found')
    if str(res['borrower_id']) != current_user['id'] and current_user['role'] != 'admin': raise HTTPException(status_code=403, detail='Only the borrower can cancel')
    await db.reservations.update_one({'_id': res['_id']}, {'$set': {'status': ReservationStatus.CANCELLED, 'updated_at': now_utc()}})
    return serialize_doc(await db.reservations.find_one({'_id': res['_id']}))

@router.put('/{reservation_id}/complete', response_model=ReservationPublic)
async def complete(reservation_id: str, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    res = await db.reservations.find_one({'_id': oid(reservation_id)})
    if not res: raise HTTPException(status_code=404, detail='Reservation not found')
    if str(res['owner_id']) != current_user['id'] and current_user['role'] != 'admin': raise HTTPException(status_code=403, detail='Only the owner can complete')
    await db.reservations.update_one({'_id': res['_id']}, {'$set': {'status': ReservationStatus.COMPLETED, 'updated_at': now_utc()}})
    return serialize_doc(await db.reservations.find_one({'_id': res['_id']}))

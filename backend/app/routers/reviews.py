from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError
from app.auth.security import get_current_user
from app.database.mongo import get_database
from app.database.object_id import oid, serialize_doc
from app.models.common import now_utc
from app.models.enums import ReservationStatus
from app.schemas.reviews import ReviewCreate, ReviewPublic

router = APIRouter(prefix='/reviews', tags=['Reviews'])

@router.post('', response_model=ReviewPublic, status_code=201)
async def create_review(payload: ReviewCreate, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    res = await db.reservations.find_one({'_id': oid(payload.reservation_id)})
    if not res: raise HTTPException(status_code=404, detail='Reservation not found')
    if str(res['borrower_id']) != current_user['id']: raise HTTPException(status_code=403, detail='Only the borrower can review this reservation')
    if res['status'] != ReservationStatus.COMPLETED: raise HTTPException(status_code=400, detail='Only completed reservations can be reviewed')
    doc = {'tool_id': res['tool_id'], 'reservation_id': res['_id'], 'borrower_id': res['borrower_id'], 'borrower_name': res['borrower_name'], 'rating': payload.rating, 'comment': payload.comment, 'created_at': now_utc()}
    try: result = await db.reviews.insert_one(doc)
    except DuplicateKeyError as exc: raise HTTPException(status_code=409, detail='Review already submitted for this reservation') from exc
    return serialize_doc(await db.reviews.find_one({'_id': result.inserted_id}))

@router.get('/tool/{tool_id}', response_model=list[ReviewPublic])
async def reviews_for_tool(tool_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    docs = await db.reviews.find({'tool_id': oid(tool_id)}).sort('created_at', -1).to_list(None)
    return [serialize_doc(d) for d in docs]

@router.delete('/{review_id}', status_code=204)
async def delete_review(review_id: str, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    review = await db.reviews.find_one({'_id': oid(review_id)})
    if not review: raise HTTPException(status_code=404, detail='Review not found')
    if current_user['role'] != 'admin' and str(review['borrower_id']) != current_user['id']: raise HTTPException(status_code=403, detail='Not allowed')
    await db.reviews.delete_one({'_id': oid(review_id)})

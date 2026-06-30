from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.auth.security import get_current_user
from app.database.mongo import get_database
from app.database.object_id import oid, serialize_doc
from app.models.common import now_utc
from app.models.enums import ReservationStatus
from app.schemas.tools import ToolCreate, ToolListResponse, ToolPublic, ToolUpdate

router = APIRouter(prefix='/tools', tags=['Tools'])

async def with_rating(db, tool):
    reviews = await db.reviews.find({'tool_id': tool['_id']}).to_list(None)
    avg = round(sum(r['rating'] for r in reviews) / len(reviews), 2) if reviews else 0
    active_reservation = await db.reservations.find_one({
        'tool_id': tool['_id'],
        'status': {'$in': [ReservationStatus.CONFIRMED, ReservationStatus.OVERDUE]},
        'end_date': {'$gte': date.today().isoformat()},
    })
    item = serialize_doc(tool)
    item['average_rating'] = avg
    item['review_count'] = len(reviews)
    item['is_available'] = active_reservation is None
    item['availability_label'] = None if active_reservation is None else 'Not available for now'
    return item

@router.get('', response_model=ToolListResponse)
async def list_tools(q: str | None = None, category: str | None = None, min_price: float | None = Query(default=None, ge=0), max_price: float | None = Query(default=None, ge=0), page: int = Query(1, ge=1), page_size: int = Query(12, ge=1, le=50), db: AsyncIOMotorDatabase = Depends(get_database)):
    query = {}
    if q: query['$text'] = {'$search': q}
    if category: query['category'] = category
    if min_price is not None or max_price is not None:
        query['daily_rate'] = {}
        if min_price is not None: query['daily_rate']['$gte'] = min_price
        if max_price is not None: query['daily_rate']['$lte'] = max_price
    total = await db.tools.count_documents(query)
    docs = await db.tools.find(query).sort('created_at', -1).skip((page-1)*page_size).limit(page_size).to_list(page_size)
    return {'items': [await with_rating(db, d) for d in docs], 'total': total, 'page': page, 'page_size': page_size}

@router.get('/{tool_id}', response_model=ToolPublic)
async def get_tool(tool_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    tool = await db.tools.find_one({'_id': oid(tool_id)})
    if not tool: raise HTTPException(status_code=404, detail='Tool not found')
    return await with_rating(db, tool)

@router.post('', response_model=ToolPublic, status_code=201)
async def create_tool(payload: ToolCreate, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    now = now_utc(); data = payload.model_dump(); data['image_url'] = str(data['image_url']); data['blackout_dates'] = [d.isoformat() for d in data['blackout_dates']]
    data.update({'owner_id': oid(current_user['id']), 'owner_name': current_user['full_name'], 'created_at': now, 'updated_at': now})
    result = await db.tools.insert_one(data)
    return await with_rating(db, await db.tools.find_one({'_id': result.inserted_id}))

@router.put('/{tool_id}', response_model=ToolPublic)
async def update_tool(tool_id: str, payload: ToolUpdate, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    tool = await db.tools.find_one({'_id': oid(tool_id)})
    if not tool: raise HTTPException(status_code=404, detail='Tool not found')
    if str(tool['owner_id']) != current_user['id'] and current_user['role'] != 'admin': raise HTTPException(status_code=403, detail='Only the owner can edit this tool')
    updates = {k:v for k,v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if 'image_url' in updates: updates['image_url'] = str(updates['image_url'])
    if 'blackout_dates' in updates: updates['blackout_dates'] = [d.isoformat() for d in updates['blackout_dates']]
    updates['updated_at'] = now_utc()
    await db.tools.update_one({'_id': oid(tool_id)}, {'$set': updates})
    return await with_rating(db, await db.tools.find_one({'_id': oid(tool_id)}))

@router.delete('/{tool_id}', status_code=204)
async def delete_tool(tool_id: str, current_user: dict = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    tool = await db.tools.find_one({'_id': oid(tool_id)})
    if not tool: raise HTTPException(status_code=404, detail='Tool not found')
    if str(tool['owner_id']) != current_user['id'] and current_user['role'] != 'admin': raise HTTPException(status_code=403, detail='Only the owner or admin can delete this tool')
    await db.tools.delete_one({'_id': oid(tool_id)})

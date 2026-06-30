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
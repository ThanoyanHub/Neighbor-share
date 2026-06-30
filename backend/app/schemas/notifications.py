from datetime import datetime
from pydantic import BaseModel

class NotificationPublic(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    read: bool
    created_at: datetime

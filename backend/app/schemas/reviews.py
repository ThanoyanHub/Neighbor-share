from datetime import datetime
from pydantic import BaseModel, Field

class ReviewCreate(BaseModel):
    reservation_id: str
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=3, max_length=1000)

class ReviewPublic(BaseModel):
    id: str
    tool_id: str
    reservation_id: str
    borrower_id: str
    borrower_name: str
    rating: int
    comment: str
    created_at: datetime

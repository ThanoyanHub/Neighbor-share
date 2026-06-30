from datetime import date, datetime
from pydantic import BaseModel, Field, HttpUrl, field_validator
from app.models.enums import ToolCategory, ToolCondition

class ToolBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    category: ToolCategory
    description: str = Field(min_length=10, max_length=2000)
    condition: ToolCondition
    daily_rate: float = Field(gt=0, le=10000)
    image_url: HttpUrl
    blackout_dates: list[date] = Field(default_factory=list)
    @field_validator('blackout_dates')
    @classmethod
    def unique_dates(cls, value: list[date]) -> list[date]:
        return sorted(set(value))

class ToolCreate(ToolBase): pass
class ToolUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    category: ToolCategory | None = None
    description: str | None = Field(default=None, min_length=10, max_length=2000)
    condition: ToolCondition | None = None
    daily_rate: float | None = Field(default=None, gt=0, le=10000)
    image_url: HttpUrl | None = None
    blackout_dates: list[date] | None = None

class ToolPublic(ToolBase):
    id: str
    owner_id: str
    owner_name: str
    average_rating: float = 0
    review_count: int = 0
    is_available: bool = True
    availability_label: str | None = None
    created_at: datetime
    updated_at: datetime

class ToolListResponse(BaseModel):
    items: list[ToolPublic]
    total: int
    page: int
    page_size: int

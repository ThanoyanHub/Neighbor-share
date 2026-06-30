from datetime import date, datetime
from pydantic import BaseModel, model_validator
from app.models.enums import ReservationStatus

class ReservationCreate(BaseModel):
    tool_id: str
    start_date: date
    end_date: date
    @model_validator(mode='after')
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError('End date must be on or after start date')
        return self

class ReservationPublic(BaseModel):
    id: str
    tool_id: str
    tool_name: str
    borrower_id: str
    borrower_name: str
    owner_id: str
    owner_name: str
    start_date: date
    end_date: date
    status: ReservationStatus
    total_price: float
    created_at: datetime
    updated_at: datetime

from enum import StrEnum

class Role(StrEnum):
    USER = 'user'
    ADMIN = 'admin'

class ToolCategory(StrEnum):
    POWER_TOOLS = 'Power Tools'
    GARDENING = 'Gardening'
    CARPENTRY = 'Carpentry'
    PLUMBING = 'Plumbing'
    ELECTRICAL = 'Electrical'
    CLEANING = 'Cleaning'
    AUTOMOTIVE = 'Automotive'
    PAINTING = 'Painting'
    OTHER = 'Other'
    
class ToolCondition(StrEnum):
    NEW = 'New'
    EXCELLENT = 'Excellent'
    GOOD = 'Good'
    FAIR = 'Fair'
    NEEDS_CARE = 'Needs Care'

class ReservationStatus(StrEnum):
    PENDING = 'Pending'
    CONFIRMED = 'Confirmed'
    DECLINED = 'Declined'
    CANCELLED = 'Cancelled'
    COMPLETED = 'Completed'
    OVERDUE = 'Overdue'

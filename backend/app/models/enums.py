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
from typing import Any
from bson import ObjectId
from pydantic_core import core_schema

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type: Any, _handler: Any) -> core_schema.CoreSchema:
        return core_schema.no_info_after_validator_function(cls.validate, core_schema.str_schema())
    @classmethod
    def validate(cls, value: str | ObjectId) -> ObjectId:
        if isinstance(value, ObjectId):
            return value
        if not ObjectId.is_valid(value):
            raise ValueError('Invalid ObjectId')
        return ObjectId(value)

def oid(value: str | ObjectId) -> ObjectId:
    if isinstance(value, ObjectId):
        return value
    if not ObjectId.is_valid(value):
        raise ValueError('Invalid ObjectId')
    return ObjectId(value)

def serialize_doc(document: dict[str, Any] | None) -> dict[str, Any] | None:
    if not document:
        return None
    document = dict(document)
    document['id'] = str(document.pop('_id'))
    for key, value in list(document.items()):
        if isinstance(value, ObjectId):
            document[key] = str(value)
    return document

def serialize_docs(documents: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [serialize_doc(d) for d in documents if d]

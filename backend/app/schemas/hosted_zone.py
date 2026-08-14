import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class HostedZoneCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=253, description="Domain name for the hosted zone")
    comment: Optional[str] = Field(None, max_length=500, description="Optional comment or description")


class HostedZoneUpdate(BaseModel):
    comment: Optional[str] = Field(None, max_length=500, description="Updated comment")


class HostedZoneResponse(BaseModel):
    id: int
    name: str
    comment: Optional[str] = None
    record_count: Optional[int] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

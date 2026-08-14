import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class RecordType(str, Enum):
    A = "A"
    AAAA = "AAAA"
    CNAME = "CNAME"
    TXT = "TXT"
    MX = "MX"
    NS = "NS"
    PTR = "PTR"
    SRV = "SRV"
    CAA = "CAA"
    SOA = "SOA"


class RoutingPolicy(str, Enum):
    SIMPLE = "SIMPLE"


class DNSRecordCreate(BaseModel):
    name: str = Field("", description="Record name (subdomain or empty/@ for zone apex)")
    type: RecordType = Field(..., description="DNS Record Type (A, AAAA, CNAME, etc.)")
    values: List[str] = Field(..., min_length=1, description="List of record values (non-empty strings)")
    ttl: int = Field(300, gt=0, le=2147483647, description="Time To Live in seconds")
    routing_policy: RoutingPolicy = Field(RoutingPolicy.SIMPLE, description="Routing policy (only SIMPLE supported currently)")


class DNSRecordUpdate(BaseModel):
    values: Optional[List[str]] = Field(None, min_length=1, description="Updated list of record values")
    ttl: Optional[int] = Field(None, gt=0, le=2147483647, description="Updated TTL in seconds")


class DNSRecordResponse(BaseModel):
    id: int
    hosted_zone_id: int
    name: str
    type: str
    values: List[str]
    ttl: int
    routing_policy: str
    is_system_record: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

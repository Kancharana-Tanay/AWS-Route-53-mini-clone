from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.auth import get_current_user
from app.schemas.dns_record import (
    DNSRecordCreate,
    DNSRecordUpdate,
    DNSRecordResponse,
)
from app.schemas.common import PaginatedResponse
from app.services.record_service import RecordService

router = APIRouter(
    tags=["DNS Records"],
    dependencies=[Depends(get_current_user)],
)


@router.get(
    "/api/hosted-zones/{zone_id}/records",
    response_model=PaginatedResponse[DNSRecordResponse],
    status_code=status.HTTP_200_OK,
    summary="List DNS Records for Zone",
    description="Retrieve DNS records for a hosted zone with search, record type filtering, and pagination.",
)
def list_zone_records(
    zone_id: int,
    search: Optional[str] = Query(None, description="Case-insensitive search on record name"),
    type: Optional[str] = Query(None, description="Filter by record type (e.g. A, CNAME, MX)"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    db: Session = Depends(get_db),
):
    items, total, total_pages = RecordService.list_records(
        db=db,
        zone_id=zone_id,
        search=search,
        record_type=type,
        page=page,
        limit=limit,
    )
    return PaginatedResponse[DNSRecordResponse](
        items=items,
        page=page,
        limit=limit,
        total=total,
        total_pages=total_pages,
    )


@router.post(
    "/api/hosted-zones/{zone_id}/records",
    response_model=DNSRecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create DNS Record",
    description="Create a new DNS record in a hosted zone with type-specific validation and conflict checks.",
)
def create_zone_record(
    zone_id: int,
    record_in: DNSRecordCreate,
    db: Session = Depends(get_db),
):
    record = RecordService.create_record(
        db=db,
        zone_id=zone_id,
        record_in=record_in,
    )
    return record


@router.get(
    "/api/records/{record_id}",
    response_model=DNSRecordResponse,
    status_code=status.HTTP_200_OK,
    summary="Get DNS Record",
    description="Fetch a single DNS record by ID.",
)
def get_record(
    record_id: int,
    db: Session = Depends(get_db),
):
    record = RecordService.get_record_by_id(db=db, record_id=record_id)
    return record


@router.put(
    "/api/records/{record_id}",
    response_model=DNSRecordResponse,
    status_code=status.HTTP_200_OK,
    summary="Update DNS Record",
    description="Update values or TTL of a DNS record. System records cannot be modified.",
)
def update_record(
    record_id: int,
    record_in: DNSRecordUpdate,
    db: Session = Depends(get_db),
):
    record = RecordService.update_record(
        db=db,
        record_id=record_id,
        record_in=record_in,
    )
    return record


@router.delete(
    "/api/records/{record_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete DNS Record",
    description="Delete a DNS record. System records cannot be deleted.",
)
def delete_record(
    record_id: int,
    db: Session = Depends(get_db),
):
    RecordService.delete_record(db=db, record_id=record_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

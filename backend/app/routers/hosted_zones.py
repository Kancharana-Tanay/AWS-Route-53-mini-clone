from typing import Optional
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.auth import get_current_user
from app.schemas.hosted_zone import (
    HostedZoneCreate,
    HostedZoneUpdate,
    HostedZoneResponse,
)
from app.schemas.common import PaginatedResponse
from app.services.hosted_zone_service import HostedZoneService

router = APIRouter(
    prefix="/api/hosted-zones",
    tags=["Hosted Zones"],
    dependencies=[Depends(get_current_user)],
)


@router.get(
    "",
    response_model=PaginatedResponse[HostedZoneResponse],
    status_code=status.HTTP_200_OK,
    summary="List Hosted Zones",
    description="Retrieve a paginated list of hosted zones with optional search filtering.",
)
def list_hosted_zones(
    search: Optional[str] = Query(None, description="Case-insensitive search on zone name or comment"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    db: Session = Depends(get_db),
):
    items, total, total_pages = HostedZoneService.list_zones(
        db=db, search=search, page=page, limit=limit
    )
    return PaginatedResponse[HostedZoneResponse](
        items=items,
        page=page,
        limit=limit,
        total=total,
        total_pages=total_pages,
    )


@router.post(
    "",
    response_model=HostedZoneResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Hosted Zone",
    description="Create a new hosted zone and automatically provision default NS and SOA system records.",
)
def create_hosted_zone(
    zone_in: HostedZoneCreate,
    db: Session = Depends(get_db),
):
    zone = HostedZoneService.create_zone(db=db, zone_in=zone_in)
    return zone


@router.get(
    "/{zone_id}",
    response_model=HostedZoneResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Hosted Zone",
    description="Fetch details of a specific hosted zone by ID.",
)
def get_hosted_zone(
    zone_id: int,
    db: Session = Depends(get_db),
):
    zone = HostedZoneService.get_zone_by_id(db=db, zone_id=zone_id)
    return zone


@router.put(
    "/{zone_id}",
    response_model=HostedZoneResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Hosted Zone",
    description="Update hosted zone metadata (comment). Domain name cannot be modified.",
)
def update_hosted_zone(
    zone_id: int,
    zone_in: HostedZoneUpdate,
    db: Session = Depends(get_db),
):
    zone = HostedZoneService.update_zone(db=db, zone_id=zone_id, zone_in=zone_in)
    return zone


@router.delete(
    "/{zone_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Hosted Zone",
    description="Delete a hosted zone and all associated DNS records.",
)
def delete_hosted_zone(
    zone_id: int,
    db: Session = Depends(get_db),
):
    HostedZoneService.delete_zone(db=db, zone_id=zone_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

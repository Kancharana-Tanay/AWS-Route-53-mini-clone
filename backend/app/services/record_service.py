import math
from typing import Optional, Tuple, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, select
from app.db.models import HostedZone, DNSRecord
from app.schemas.dns_record import DNSRecordCreate, DNSRecordUpdate
from app.services.dns_validation import (
    normalize_record_name,
    validate_dns_record,
    DNSValidationError,
)
from app.services.hosted_zone_service import HostedZoneService


class RecordService:
    @staticmethod
    def create_record(
        db: Session,
        zone_id: int,
        record_in: DNSRecordCreate,
    ) -> DNSRecord:
        """Create a new DNS record in a hosted zone with full DNS validation and uniqueness checks."""
        zone = HostedZoneService.get_zone_by_id(db, zone_id)

        # Normalize record name
        try:
            norm_name = normalize_record_name(record_in.name, zone.name)
        except DNSValidationError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            )

        # Clean values list (strip whitespace, filter empties)
        cleaned_values = [v.strip() for v in record_in.values if v is not None and v.strip()]
        if not cleaned_values:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Record must have at least one non-empty value.",
            )

        # Validate DNS record format according to type
        try:
            validate_dns_record(
                record_type=record_in.type.value,
                values=cleaned_values,
                record_name=norm_name,
                zone_name=zone.name,
            )
        except DNSValidationError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            )

        # Check simple routing uniqueness (zone_id + name + type + routing_policy)
        policy_str = record_in.routing_policy.value
        type_str = record_in.type.value

        existing_same = db.execute(
            select(DNSRecord).where(
                DNSRecord.hosted_zone_id == zone.id,
                DNSRecord.name == norm_name,
                DNSRecord.type == type_str,
                DNSRecord.routing_policy == policy_str,
            )
        ).scalar_one_or_none()

        if existing_same:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"A {type_str} record for '{norm_name}' with {policy_str} routing already exists. "
                    "In Route 53, add multiple values to the existing record instead of creating a duplicate."
                ),
            )

        # CNAME exclusivity checks
        if type_str == "CNAME":
            # If creating CNAME, no other record can exist at this name
            coexisting = db.execute(
                select(DNSRecord).where(
                    DNSRecord.hosted_zone_id == zone.id,
                    DNSRecord.name == norm_name,
                )
            ).scalars().all()
            if coexisting:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"CNAME record cannot coexist with other records at '{norm_name}'.",
                )
        else:
            # If creating non-CNAME, ensure no CNAME exists at this name
            existing_cname = db.execute(
                select(DNSRecord).where(
                    DNSRecord.hosted_zone_id == zone.id,
                    DNSRecord.name == norm_name,
                    DNSRecord.type == "CNAME",
                )
            ).scalar_one_or_none()
            if existing_cname:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Cannot create {type_str} record: a CNAME record already exists at '{norm_name}'.",
                )

        # Create record
        record = DNSRecord(
            hosted_zone_id=zone.id,
            name=norm_name,
            type=type_str,
            values=cleaned_values,
            ttl=record_in.ttl,
            routing_policy=policy_str,
            is_system_record=False,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def get_record_by_id(db: Session, record_id: int) -> DNSRecord:
        """Fetch a DNS record by ID or raise 404."""
        record = db.execute(
            select(DNSRecord).where(DNSRecord.id == record_id)
        ).scalar_one_or_none()

        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"DNS record with id {record_id} not found.",
            )
        return record

    @staticmethod
    def list_records(
        db: Session,
        zone_id: int,
        search: Optional[str] = None,
        record_type: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[DNSRecord], int, int]:
        """List records for a hosted zone with search, type filtering, and pagination."""
        # Ensure zone exists
        HostedZoneService.get_zone_by_id(db, zone_id)

        if page < 1:
            page = 1
        if limit < 1:
            limit = 20
        if limit > 100:
            limit = 100

        query = select(DNSRecord).where(DNSRecord.hosted_zone_id == zone_id)

        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            query = query.where(func.lower(DNSRecord.name).like(term))

        if record_type and record_type.strip():
            query = query.where(DNSRecord.type == record_type.strip().upper())

        # Total count
        count_query = select(func.count()).select_from(query.subquery())
        total = db.execute(count_query).scalar() or 0
        total_pages = math.ceil(total / limit) if total > 0 else 0

        # Paginated items (ordered: system records first or by name/type)
        offset = (page - 1) * limit
        records = db.execute(
            query.order_by(DNSRecord.is_system_record.desc(), DNSRecord.name.asc(), DNSRecord.type.asc())
            .offset(offset)
            .limit(limit)
        ).scalars().all()

        return records, total, total_pages

    @staticmethod
    def update_record(
        db: Session,
        record_id: int,
        record_in: DNSRecordUpdate,
    ) -> DNSRecord:
        """Update values and/or TTL of an existing user-created record."""
        record = RecordService.get_record_by_id(db, record_id)

        if record.is_system_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="System records (NS/SOA) created automatically by Route 53 cannot be modified.",
            )

        if record_in.values is not None:
            cleaned_values = [v.strip() for v in record_in.values if v is not None and v.strip()]
            if not cleaned_values:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Record must have at least one non-empty value.",
                )

            zone = HostedZoneService.get_zone_by_id(db, record.hosted_zone_id)
            try:
                validate_dns_record(
                    record_type=record.type,
                    values=cleaned_values,
                    record_name=record.name,
                    zone_name=zone.name,
                )
            except DNSValidationError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=str(e),
                )
            record.values = cleaned_values

        if record_in.ttl is not None:
            record.ttl = record_in.ttl

        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def delete_record(db: Session, record_id: int) -> None:
        """Delete a DNS record. System records cannot be deleted."""
        record = RecordService.get_record_by_id(db, record_id)

        if record.is_system_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="System records (NS/SOA) created automatically by Route 53 cannot be deleted.",
            )

        db.delete(record)
        db.commit()

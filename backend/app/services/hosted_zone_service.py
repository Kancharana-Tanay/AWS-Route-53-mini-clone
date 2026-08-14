import math
from typing import Optional, Tuple, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, select
from app.db.models import HostedZone, DNSRecord
from app.schemas.hosted_zone import HostedZoneCreate, HostedZoneUpdate, HostedZoneResponse
from app.services.dns_validation import normalize_domain_name, is_valid_hostname, DNSValidationError


def get_default_system_records(zone_name: str) -> List[dict]:
    """Generate deterministic mock NS and SOA records for a new hosted zone."""
    norm_name = normalize_domain_name(zone_name)
    
    # Deterministic mock nameservers
    ns_servers = [
        "ns-1536.awsdns-00.org",
        "ns-0.awsdns-00.com",
        "ns-1024.awsdns-00.co.uk",
        "ns-512.awsdns-00.net",
    ]
    
    # Deterministic SOA record value
    # Format: <primary-ns> <hostmaster> <serial> <refresh> <retry> <expire> <min-ttl>
    soa_value = f"ns-1536.awsdns-00.org. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"
    
    return [
        {
            "name": norm_name,
            "type": "NS",
            "values": ns_servers,
            "ttl": 172800,
            "routing_policy": "SIMPLE",
            "is_system_record": True,
        },
        {
            "name": norm_name,
            "type": "SOA",
            "values": [soa_value],
            "ttl": 900,
            "routing_policy": "SIMPLE",
            "is_system_record": True,
        },
    ]


class HostedZoneService:
    @staticmethod
    def create_zone(db: Session, zone_in: HostedZoneCreate) -> HostedZone:
        """Atomically create a hosted zone and its system NS and SOA records."""
        norm_name = normalize_domain_name(zone_in.name)
        if not norm_name or not is_valid_hostname(norm_name, allow_wildcard_prefix=False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid domain name '{zone_in.name}' for hosted zone.",
            )

        # Check for uniqueness
        existing = db.execute(
            select(HostedZone).where(HostedZone.name == norm_name)
        ).scalar_one_or_none()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Hosted zone with name '{norm_name}' already exists.",
            )

        try:
            zone = HostedZone(
                name=norm_name,
                comment=zone_in.comment.strip() if zone_in.comment else None,
            )
            db.add(zone)
            db.flush()  # Flush to generate zone.id

            # Create default system records
            system_records = get_default_system_records(norm_name)
            for rec_data in system_records:
                record = DNSRecord(
                    hosted_zone_id=zone.id,
                    name=rec_data["name"],
                    type=rec_data["type"],
                    values=rec_data["values"],
                    ttl=rec_data["ttl"],
                    routing_policy=rec_data["routing_policy"],
                    is_system_record=rec_data["is_system_record"],
                )
                db.add(record)

            db.commit()
            db.refresh(zone)
            return zone
        except Exception as e:
            db.rollback()
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create hosted zone: {str(e)}",
            )

    @staticmethod
    def get_zone_by_id(db: Session, zone_id: int) -> HostedZone:
        """Fetch a hosted zone by ID or raise 404."""
        zone = db.execute(
            select(HostedZone).where(HostedZone.id == zone_id)
        ).scalar_one_or_none()

        if not zone:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hosted zone with id {zone_id} not found.",
            )
        return zone

    @staticmethod
    def list_zones(
        db: Session,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[dict], int, int]:
        """List hosted zones with search and pagination, returning record counts."""
        if page < 1:
            page = 1
        if limit < 1:
            limit = 20
        if limit > 100:
            limit = 100

        query = select(HostedZone)

        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            query = query.where(
                or_(
                    func.lower(HostedZone.name).like(term),
                    func.lower(HostedZone.comment).like(term),
                )
            )

        # Count total matching
        count_query = select(func.count()).select_from(query.subquery())
        total = db.execute(count_query).scalar() or 0

        # Compute total pages
        total_pages = math.ceil(total / limit) if total > 0 else 0

        # Fetch paginated items
        offset = (page - 1) * limit
        zones = db.execute(
            query.order_by(HostedZone.created_at.desc()).offset(offset).limit(limit)
        ).scalars().all()

        # Build response with record counts
        items = []
        for z in zones:
            rec_count = db.execute(
                select(func.count(DNSRecord.id)).where(DNSRecord.hosted_zone_id == z.id)
            ).scalar() or 0
            
            items.append({
                "id": z.id,
                "name": z.name,
                "comment": z.comment,
                "record_count": rec_count,
                "created_at": z.created_at,
                "updated_at": z.updated_at,
            })

        return items, total, total_pages

    @staticmethod
    def update_zone(db: Session, zone_id: int, zone_in: HostedZoneUpdate) -> HostedZone:
        """Update a hosted zone's comment. Domain name cannot be modified."""
        zone = HostedZoneService.get_zone_by_id(db, zone_id)
        zone.comment = zone_in.comment.strip() if zone_in.comment is not None else None
        db.commit()
        db.refresh(zone)
        return zone

    @staticmethod
    def delete_zone(db: Session, zone_id: int) -> None:
        """Delete a hosted zone and cascade delete all its records."""
        zone = HostedZoneService.get_zone_by_id(db, zone_id)
        db.delete(zone)
        db.commit()

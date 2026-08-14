import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
    Index,
)
from sqlalchemy.orm import relationship
from app.db.database import Base


def utcnow():
    return datetime.datetime.now(datetime.timezone.utc)


class HostedZone(Base):
    __tablename__ = "hosted_zones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    comment = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=utcnow,
        onupdate=utcnow,
        nullable=False,
    )

    records = relationship(
        "DNSRecord",
        back_populates="hosted_zone",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="DNSRecord.id",
    )


class DNSRecord(Base):
    __tablename__ = "dns_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    hosted_zone_id = Column(
        Integer,
        ForeignKey("hosted_zones.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(10), nullable=False, index=True)
    values = Column(JSON, nullable=False)  # List[str]
    ttl = Column(Integer, nullable=False, default=300)
    routing_policy = Column(String(50), nullable=False, default="SIMPLE")
    is_system_record = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=utcnow,
        onupdate=utcnow,
        nullable=False,
    )

    hosted_zone = relationship("HostedZone", back_populates="records")

    __table_args__ = (
        Index(
            "ix_dns_records_zone_name_type_policy",
            "hosted_zone_id",
            "name",
            "type",
            "routing_policy",
        ),
    )

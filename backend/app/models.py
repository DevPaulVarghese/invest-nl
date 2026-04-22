import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class PortfolioCompany(Base):
    __tablename__ = "portfolio_companies"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(512))
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    theme: Mapped[str] = mapped_column(String(64), index=True)
    financing_path: Mapped[str | None] = mapped_column(String(64), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(Text(), nullable=True)
    detail_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class InvestmentEvaluation(Base):
    __tablename__ = "investment_evaluations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    portfolio_company_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("portfolio_companies.id"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(512))
    company_name: Mapped[str] = mapped_column(String(512))
    theme_selected: Mapped[str] = mapped_column(String(64))
    company_narrative: Mapped[str | None] = mapped_column(Text(), nullable=True)
    scope_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    inputs_json: Mapped[dict] = mapped_column(JSONB)
    scores_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    pros: Mapped[str | None] = mapped_column(Text(), nullable=True)
    cons: Mapped[str | None] = mapped_column(Text(), nullable=True)
    quadrant_label: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

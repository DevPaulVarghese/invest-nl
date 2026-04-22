"""initial tables

Revision ID: 001
Revises:
Create Date: 2026-04-08

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "portfolio_companies",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=512), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("theme", sa.String(length=64), nullable=False),
        sa.Column("financing_path", sa.String(length=64), nullable=True),
        sa.Column("logo_url", sa.Text(), nullable=True),
        sa.Column("detail_path", sa.String(length=512), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_portfolio_companies_slug"), "portfolio_companies", ["slug"], unique=True
    )
    op.create_index(
        op.f("ix_portfolio_companies_theme"), "portfolio_companies", ["theme"], unique=False
    )

    op.create_table(
        "investment_evaluations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=512), nullable=False),
        sa.Column("company_name", sa.String(length=512), nullable=False),
        sa.Column("theme_selected", sa.String(length=64), nullable=False),
        sa.Column("company_narrative", sa.Text(), nullable=True),
        sa.Column(
            "scope_json",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column("inputs_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "scores_json",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column("pros", sa.Text(), nullable=True),
        sa.Column("cons", sa.Text(), nullable=True),
        sa.Column("quadrant_label", sa.String(length=128), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("investment_evaluations")
    op.drop_index(op.f("ix_portfolio_companies_theme"), table_name="portfolio_companies")
    op.drop_index(op.f("ix_portfolio_companies_slug"), table_name="portfolio_companies")
    op.drop_table("portfolio_companies")

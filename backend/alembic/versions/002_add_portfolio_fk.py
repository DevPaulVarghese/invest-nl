"""add portfolio_company_id FK to investment_evaluations

Revision ID: 002
Revises: 001
Create Date: 2026-04-08

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "investment_evaluations",
        sa.Column(
            "portfolio_company_id",
            postgresql.UUID(as_uuid=True),
            nullable=True,
        ),
    )
    op.create_index(
        op.f("ix_investment_evaluations_portfolio_company_id"),
        "investment_evaluations",
        ["portfolio_company_id"],
        unique=False,
    )
    op.create_foreign_key(
        "fk_eval_portfolio_company",
        "investment_evaluations",
        "portfolio_companies",
        ["portfolio_company_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_eval_portfolio_company",
        "investment_evaluations",
        type_="foreignkey",
    )
    op.drop_index(
        op.f("ix_investment_evaluations_portfolio_company_id"),
        table_name="investment_evaluations",
    )
    op.drop_column("investment_evaluations", "portfolio_company_id")

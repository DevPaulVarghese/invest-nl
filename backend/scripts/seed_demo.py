"""Seed a demo evaluation for askFinz.

Run from `backend/`:
  set PYTHONPATH=.
  python scripts/seed_demo.py
"""

import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import InvestmentEvaluation
from app.services.scoring import compute_full_scorecard

DEMO_SLUG = "askfinz-demo"

DEMO_INPUTS = {
    "excl": 0,
    "pol": 82,
    "bdiv": 35,
    "ceo": 0,
    "whistleblower": 4,
    "audit_quality": 4,
    "transparency": 4,
    "ai_governance": 5,
    "data_ethics": 4,
    "algo_bias": 2,
    "data_privacy": 4,
    "model_robustness": 4,
    "explainability": 4,
    "egy": 4,
    "wat": 3,
    "circ": 3,
    "crm": 0,
    "ghg": 4,
    "biodiversity": 3,
    "renewable_pct": 4,
    "ghg_intensity": 3,
    "du": 8,
    "wpn": 1,
    "hr": 1,
    "rri": 12,
    "safety_testing": 4,
    "primary_sdg": 9,
    "soc": 4,
    "stakeholder": 4,
    "inclusion": 4,
    "impact_scale": 4,
    "impact_additionality": 4,
    "job_impact": 4,
    "fin_runway": 4,
    "fin_quality": 4,
    "revenue_model": 5,
    "valuation": 4,
    "mkt_tam": 5,
    "competitive": 4,
    "customer_conc": 2,
    "regulatory_env": 4,
    "tech_moat": 5,
    "scalability": 5,
    "data_quality": 4,
    "cybersecurity": 4,
    "ip_portfolio": 4,
    "hw_lifespan": 4,
    "team_exec": 5,
    "theme_fit": 5,
    "key_person": 3,
    "advisory": 4,
    "legal_structure": 4,
    "regulatory_compliance": 4,
    "litigation": 1,
    "concentration_risk": 2,
    "operational_risk": 4,
    "exit_feasibility": 4,
}

DEMO_SCOPE = {
    "ticket_m_eur": 8,
    "instrument": "equity",
    "horizon_years": 5,
    "co_investor": "",
    "staging": "single",
    "expected_irr": 22,
    "use_of_proceeds": "Product development, team expansion, and international go-to-market",
    "founding_date": "2021-03-15",
    "num_employees": 42,
    "contact_person": "Paul Varghese",
    "contact_email": "info@askfinz.com",
    "contact_phone": "+31 6 44XXXXXX",
    "company_url": "https://askfinz.ai/indexing_in_progress",
}


def seed() -> None:
    db: Session = SessionLocal()
    try:
        exists = db.scalars(
            select(InvestmentEvaluation).where(
                InvestmentEvaluation.company_name == "askFinz"
            )
        ).first()
        if exists:
            print("askFinz demo evaluation already exists — skipping.")
            return

        scores = compute_full_scorecard(DEMO_INPUTS)

        ev = InvestmentEvaluation(
            id=uuid.uuid4(),
            title="askFinz — Deep Tech AI Evaluation",
            company_name="askFinz",
            theme_selected="TECH",
            company_narrative=(
                "askFinz is an AI company in the Deep Tech domain that creates AI-powered "
                "solutions to help simplify and automate business workflows. The platform "
                "leverages large language models, intelligent document processing, and "
                "workflow orchestration to reduce manual effort in finance, compliance, and "
                "operations departments. Core use-cases include automated invoice processing, "
                "contract analysis, regulatory reporting, and intelligent task routing."
            ),
            scope_json=DEMO_SCOPE,
            inputs_json=DEMO_INPUTS,
            scores_json=scores,
            pros=(
                "Strong AI governance posture with high explainability scores. "
                "Excellent technical moat via proprietary NLP models. "
                "Large addressable market in enterprise workflow automation. "
                "Experienced founding team with prior exits."
            ),
            cons=(
                "Customer concentration risk with top 3 clients representing 60% of revenue. "
                "Moderate environmental footprint from GPU-intensive training. "
                "Key person dependency on CTO for core model architecture."
            ),
            quadrant_label=scores.get("quadrant", "Win-win"),
        )
        db.add(ev)
        db.commit()
        print("Inserted askFinz demo evaluation.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()

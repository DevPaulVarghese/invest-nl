from datetime import datetime
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class FactorAnswerStatus(str, Enum):
    answered = "answered"
    na = "na"
    no_info = "no_info"


class ScoreInputs(BaseModel):
    excl: int = Field(0, ge=0, le=1)
    pol: float = Field(72, ge=0, le=100)
    bdiv: float = Field(40, ge=0, le=100)
    ceo: int = Field(0, ge=0, le=1)
    whistleblower: float = Field(3, ge=1, le=5)
    audit_quality: float = Field(3, ge=1, le=5)
    transparency: float = Field(3, ge=1, le=5)
    ai_governance: float = Field(3, ge=1, le=5)
    data_ethics: float = Field(3, ge=1, le=5)
    algo_bias: float = Field(2, ge=1, le=5)
    data_privacy: float = Field(3, ge=1, le=5)
    model_robustness: float = Field(3, ge=1, le=5)
    explainability: float = Field(3, ge=1, le=5)
    egy: float = Field(3, ge=1, le=5)
    wat: float = Field(2, ge=1, le=5)
    circ: float = Field(3, ge=1, le=5)
    crm: int = Field(0, ge=0, le=1)
    ghg: float = Field(3, ge=1, le=5)
    biodiversity: float = Field(3, ge=1, le=5)
    renewable_pct: float = Field(3, ge=1, le=5)
    ghg_intensity: float = Field(3, ge=1, le=5)
    du: float = Field(10, ge=0, le=100)
    wpn: float = Field(1, ge=1, le=5)
    hr: float = Field(1, ge=1, le=5)
    rri: float = Field(18, ge=0, le=100)
    safety_testing: float = Field(3, ge=1, le=5)
    primary_sdg: int = Field(7, ge=1, le=17)
    soc: float = Field(4, ge=1, le=5)
    stakeholder: float = Field(3, ge=1, le=5)
    inclusion: float = Field(3, ge=1, le=5)
    impact_scale: float = Field(3, ge=1, le=5)
    impact_additionality: float = Field(3, ge=1, le=5)
    job_impact: float = Field(3, ge=1, le=5)
    fin_runway: float = Field(3, ge=1, le=5)
    fin_quality: float = Field(3, ge=1, le=5)
    revenue_model: float = Field(3, ge=1, le=5)
    valuation: float = Field(3, ge=1, le=5)
    mkt_tam: float = Field(3, ge=1, le=5)
    competitive: float = Field(3, ge=1, le=5)
    customer_conc: float = Field(2, ge=1, le=5)
    regulatory_env: float = Field(3, ge=1, le=5)
    tech_moat: float = Field(3, ge=1, le=5)
    scalability: float = Field(3, ge=1, le=5)
    data_quality: float = Field(3, ge=1, le=5)
    cybersecurity: float = Field(3, ge=1, le=5)
    ip_portfolio: float = Field(3, ge=1, le=5)
    hw_lifespan: float = Field(3, ge=1, le=5)
    team_exec: float = Field(3, ge=1, le=5)
    theme_fit: float = Field(3, ge=1, le=5)
    key_person: float = Field(2, ge=1, le=5)
    advisory: float = Field(3, ge=1, le=5)
    legal_structure: float = Field(3, ge=1, le=5)
    regulatory_compliance: float = Field(3, ge=1, le=5)
    litigation: float = Field(1, ge=1, le=5)
    concentration_risk: float = Field(2, ge=1, le=5)
    operational_risk: float = Field(3, ge=1, le=5)
    exit_feasibility: float = Field(3, ge=1, le=5)


class ScorePreviewRequest(BaseModel):
    """Score preview: factor values plus optional per-factor status (N/A / no information)."""

    inputs: ScoreInputs
    factor_status: dict[str, FactorAnswerStatus] = Field(default_factory=dict)


class ScorePreviewResponse(BaseModel):
    scores: dict[str, Any]
    forest_colors: list[str]


class PortfolioOut(BaseModel):
    id: UUID
    slug: str
    name: str
    description: str | None
    theme: str
    financing_path: str | None
    logo_url: str | None
    detail_path: str | None

    model_config = {"from_attributes": True}


class EvaluationCreate(BaseModel):
    title: str = "Untitled evaluation"
    company_name: str
    theme_selected: str
    company_narrative: str | None = None
    scope_json: dict[str, Any] | None = None
    inputs: ScoreInputs
    factor_status: dict[str, FactorAnswerStatus] = Field(default_factory=dict)
    pros: str | None = None
    cons: str | None = None
    portfolio_company_id: UUID | None = None


class EvaluationUpdate(BaseModel):
    title: str | None = None
    company_name: str | None = None
    theme_selected: str | None = None
    company_narrative: str | None = None
    scope_json: dict[str, Any] | None = None
    inputs: ScoreInputs | None = None
    factor_status: dict[str, FactorAnswerStatus] | None = None
    pros: str | None = None
    cons: str | None = None


class EvaluationOut(BaseModel):
    id: UUID
    title: str
    company_name: str
    theme_selected: str
    company_narrative: str | None
    scope_json: dict[str, Any] | None
    inputs_json: dict[str, Any]
    scores_json: dict[str, Any] | None
    pros: str | None
    cons: str | None
    quadrant_label: str | None
    portfolio_company_id: UUID | None
    created_at: datetime

    model_config = {"from_attributes": True}


class BenchmarkEntry(BaseModel):
    company_name: str
    slug: str
    logo_url: str | None
    theme_selected: str | None = None
    esg_score: float
    investment_score: float | None
    ai_responsibility: float
    quadrant_label: str | None
    governance_pillar: float | None = None
    transparency_pillar: float | None = None
    privacy_pillar: float | None = None
    environmental_pillar: float | None = None


class BenchmarkResponse(BaseModel):
    companies: list[BenchmarkEntry]
    avg_esg: float
    avg_investment: float
    avg_ai_responsibility: float
    count: int
    avg_governance_pillar: float | None = None
    avg_transparency_pillar: float | None = None
    avg_privacy_pillar: float | None = None
    avg_environmental_pillar: float | None = None

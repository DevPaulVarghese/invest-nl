from app.services.scoring import compute_esg_score, compute_full_scorecard, compute_investment_score
from app.services.scoring_input import pack_inputs_payload, unpack_inputs_payload


def _default_values() -> dict:
    """Minimal valid factor dict aligned with ScoreInputs defaults."""
    return {
        "excl": 0,
        "pol": 72.0,
        "bdiv": 40.0,
        "ceo": 0,
        "whistleblower": 3.0,
        "audit_quality": 3.0,
        "transparency": 3.0,
        "ai_governance": 3.0,
        "data_ethics": 3.0,
        "algo_bias": 2.0,
        "data_privacy": 3.0,
        "model_robustness": 3.0,
        "explainability": 3.0,
        "egy": 3.0,
        "wat": 2.0,
        "circ": 3.0,
        "crm": 0,
        "ghg": 3.0,
        "biodiversity": 3.0,
        "renewable_pct": 3.0,
        "ghg_intensity": 3.0,
        "du": 10.0,
        "wpn": 1.0,
        "hr": 1.0,
        "rri": 18.0,
        "safety_testing": 3.0,
        "primary_sdg": 7,
        "soc": 4.0,
        "stakeholder": 3.0,
        "inclusion": 3.0,
        "impact_scale": 3.0,
        "impact_additionality": 3.0,
        "job_impact": 3.0,
        "fin_runway": 3.0,
        "fin_quality": 3.0,
        "revenue_model": 3.0,
        "valuation": 3.0,
        "mkt_tam": 3.0,
        "competitive": 3.0,
        "customer_conc": 2.0,
        "regulatory_env": 3.0,
        "tech_moat": 3.0,
        "scalability": 3.0,
        "data_quality": 3.0,
        "cybersecurity": 3.0,
        "ip_portfolio": 3.0,
        "hw_lifespan": 3.0,
        "team_exec": 3.0,
        "theme_fit": 3.0,
        "key_person": 2.0,
        "advisory": 3.0,
        "legal_structure": 3.0,
        "regulatory_compliance": 3.0,
        "litigation": 1.0,
        "concentration_risk": 2.0,
        "operational_risk": 3.0,
        "exit_feasibility": 3.0,
    }


def test_esg_empty_status_matches_all_answered() -> None:
    v = _default_values()
    assert compute_esg_score(v, {}) == compute_esg_score(v, None)


def test_investment_all_skipped_returns_none() -> None:
    v = _default_values()
    st = {k: "na" for k in [
        "fin_runway", "fin_quality", "revenue_model", "valuation",
        "mkt_tam", "competitive", "regulatory_env",
        "tech_moat", "scalability", "data_quality", "cybersecurity", "ip_portfolio",
        "hw_lifespan", "ghg_intensity",
        "team_exec", "theme_fit", "advisory",
        "ai_governance", "model_robustness", "explainability",
        "legal_structure", "regulatory_compliance",
        "operational_risk", "exit_feasibility",
        "customer_conc", "key_person", "litigation", "concentration_risk",
    ]}
    assert compute_investment_score(v, st) is None


def test_full_scorecard_insufficient_quadrant_when_no_investment() -> None:
    v = _default_values()
    st = {k: "na" for k in [
        "fin_runway", "fin_quality", "revenue_model", "valuation",
        "mkt_tam", "competitive", "regulatory_env",
        "tech_moat", "scalability", "data_quality", "cybersecurity", "ip_portfolio",
        "hw_lifespan", "ghg_intensity",
        "team_exec", "theme_fit", "advisory",
        "ai_governance", "model_robustness", "explainability",
        "legal_structure", "regulatory_compliance",
        "operational_risk", "exit_feasibility",
        "customer_conc", "key_person", "litigation", "concentration_risk",
    ]}
    out = compute_full_scorecard(v, st)
    assert out["investment_score"] is None
    assert out["research_quadrant"] == "Insufficient data"


def test_pack_unpack_roundtrip() -> None:
    v = _default_values()
    st = {"fin_runway": "na", "pol": "no_info"}
    raw = pack_inputs_payload(v, st)
    v2, st2 = unpack_inputs_payload(raw)
    assert v2["fin_runway"] == v["fin_runway"]
    assert st2 == {"fin_runway": "na", "pol": "no_info"}


def test_pack_flat_when_no_skips() -> None:
    v = _default_values()
    raw = pack_inputs_payload(v, {})
    assert "values" not in raw
    assert raw["excl"] == 0

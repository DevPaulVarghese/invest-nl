from __future__ import annotations

from typing import Any

from app.services.scoring_input import is_skipped_status

# Max absolute swing of each ESG additive term over its input domain (used for renormalisation).
# Must match the keys and formulas in _esg_term_entries().
ESG_TERM_SPANS: dict[str, float] = {
    "pol": 22.0,
    "bdiv": 10.0,
    "ceo": 4.0,
    "whistleblower": 4.0,
    "audit_quality": 3.0,
    "transparency": 4.0,
    "data_ethics": 4.0,
    "algo_bias": 4.0,
    "data_privacy": 4.0,
    "explainability": 3.0,
    "egy": 14.0,
    "wat": 14.0,
    "circ": 12.0,
    "crm": 8.0,
    "ghg": 5.0,
    "biodiversity": 4.0,
    "renewable_pct": 6.0,
    "du": 28.0,
    "wpn": 14.0,
    "hr": 12.0,
    "rri": 20.0,
    "safety_testing": 4.0,
    "soc": 10.0,
    "stakeholder": 3.0,
    "inclusion": 3.0,
    "impact_scale": 5.0,
    "impact_additionality": 5.0,
    "job_impact": 4.0,
}

# Relative importance of each ESG term in the renormalisation scheme (same as ESG_TERM_SPANS).
FEATURE_WEIGHTS: dict[str, float] = {
    "excl": 0.0,
    **{k: v for k, v in ESG_TERM_SPANS.items()},
    # Factors that affect investment / AI but not the ESG core sum above (for API completeness)
    "ai_governance": 0.0,
    "model_robustness": 0.0,
    "primary_sdg": 0.0,
    "ghg_intensity": 0.0,
    "fin_runway": 0.0,
    "fin_quality": 0.0,
    "revenue_model": 0.0,
    "valuation": 0.0,
    "mkt_tam": 0.0,
    "competitive": 0.0,
    "customer_conc": 0.0,
    "regulatory_env": 0.0,
    "tech_moat": 0.0,
    "scalability": 0.0,
    "data_quality": 0.0,
    "cybersecurity": 0.0,
    "ip_portfolio": 0.0,
    "hw_lifespan": 0.0,
    "team_exec": 0.0,
    "theme_fit": 0.0,
    "key_person": 0.0,
    "advisory": 0.0,
    "legal_structure": 0.0,
    "regulatory_compliance": 0.0,
    "litigation": 0.0,
    "concentration_risk": 0.0,
    "operational_risk": 0.0,
    "exit_feasibility": 0.0,
}

ESG_RENORM_WEIGHT_TOTAL = sum(ESG_TERM_SPANS.values())


def _clamp(n: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, n))


def _get(d: dict[str, Any], key: str, default: float | int) -> float | int:
    v = d.get(key, default)
    if v is None:
        return default
    return v


def _skipped(status: dict[str, str], key: str) -> bool:
    return is_skipped_status(status.get(key))


def _esg_term_entries(v: dict[str, Any]) -> list[tuple[str, float, float]]:
    """(key, term_value, renorm_weight) — weight equals max |swing| for that term."""
    pol = float(_get(v, "pol", 50))
    bdiv = float(_get(v, "bdiv", 30))
    ceo = float(_get(v, "ceo", 0))
    whistleblower = float(_get(v, "whistleblower", 3))
    audit_quality = float(_get(v, "audit_quality", 3))
    transparency = float(_get(v, "transparency", 3))

    data_ethics = float(_get(v, "data_ethics", 3))
    algo_bias = float(_get(v, "algo_bias", 2))
    data_privacy = float(_get(v, "data_privacy", 3))

    egy = float(_get(v, "egy", 3))
    wat = float(_get(v, "wat", 3))
    circ = float(_get(v, "circ", 3))
    crm = float(_get(v, "crm", 0))
    ghg = float(_get(v, "ghg", 3))
    biodiversity = float(_get(v, "biodiversity", 3))

    du = float(_get(v, "du", 10))
    wpn = float(_get(v, "wpn", 1))
    hr = float(_get(v, "hr", 1))
    rri = float(_get(v, "rri", 20))
    safety_testing = float(_get(v, "safety_testing", 3))

    soc = float(_get(v, "soc", 3))
    stakeholder = float(_get(v, "stakeholder", 3))
    inclusion = float(_get(v, "inclusion", 3))
    explainability = float(_get(v, "explainability", 3))
    renewable_pct = float(_get(v, "renewable_pct", 3))
    impact_scale = float(_get(v, "impact_scale", 3))
    impact_additionality = float(_get(v, "impact_additionality", 3))
    job_impact = float(_get(v, "job_impact", 3))

    rows: list[tuple[str, float, float]] = [
        ("pol", (pol / 100.0) * 22, ESG_TERM_SPANS["pol"]),
        ("bdiv", (bdiv / 100.0) * 10, ESG_TERM_SPANS["bdiv"]),
        ("ceo", ceo * 4, ESG_TERM_SPANS["ceo"]),
        ("whistleblower", ((whistleblower - 1) / 4) * 4, ESG_TERM_SPANS["whistleblower"]),
        ("audit_quality", ((audit_quality - 1) / 4) * 3, ESG_TERM_SPANS["audit_quality"]),
        ("transparency", ((transparency - 1) / 4) * 4, ESG_TERM_SPANS["transparency"]),
        ("data_ethics", ((data_ethics - 1) / 4) * 4, ESG_TERM_SPANS["data_ethics"]),
        ("algo_bias", -((algo_bias - 1) / 4) * 4, ESG_TERM_SPANS["algo_bias"]),
        ("data_privacy", ((data_privacy - 1) / 4) * 4, ESG_TERM_SPANS["data_privacy"]),
        ("explainability", ((explainability - 1) / 4) * 3, ESG_TERM_SPANS["explainability"]),
        ("egy", ((egy - 1) / 4) * 14, ESG_TERM_SPANS["egy"]),
        ("wat", -((wat - 1) / 4) * 14, ESG_TERM_SPANS["wat"]),
        ("circ", ((circ - 1) / 4) * 12, ESG_TERM_SPANS["circ"]),
        ("crm", -crm * 8, ESG_TERM_SPANS["crm"]),
        ("ghg", ((ghg - 1) / 4) * 5, ESG_TERM_SPANS["ghg"]),
        ("biodiversity", ((biodiversity - 1) / 4) * 4, ESG_TERM_SPANS["biodiversity"]),
        ("renewable_pct", ((renewable_pct - 1) / 4) * 6, ESG_TERM_SPANS["renewable_pct"]),
        ("du", -(du / 100.0) * 28, ESG_TERM_SPANS["du"]),
        ("wpn", -((wpn - 1) / 4) * 14, ESG_TERM_SPANS["wpn"]),
        ("hr", -((hr - 1) / 4) * 12, ESG_TERM_SPANS["hr"]),
        ("rri", -(rri / 100.0) * 20, ESG_TERM_SPANS["rri"]),
        ("safety_testing", ((safety_testing - 1) / 4) * 4, ESG_TERM_SPANS["safety_testing"]),
        ("soc", ((soc - 1) / 4) * 10, ESG_TERM_SPANS["soc"]),
        ("stakeholder", ((stakeholder - 1) / 4) * 3, ESG_TERM_SPANS["stakeholder"]),
        ("inclusion", ((inclusion - 1) / 4) * 3, ESG_TERM_SPANS["inclusion"]),
        ("impact_scale", ((impact_scale - 1) / 4) * 5, ESG_TERM_SPANS["impact_scale"]),
        ("impact_additionality", ((impact_additionality - 1) / 4) * 5, ESG_TERM_SPANS["impact_additionality"]),
        ("job_impact", ((job_impact - 1) / 4) * 4, ESG_TERM_SPANS["job_impact"]),
    ]
    return rows


def compute_esg_score(values: dict[str, Any], status: dict[str, str] | None = None) -> int:
    status = status or {}
    excl = int(_get(values, "excl", 0))
    if excl == 1:
        return 0

    entries = _esg_term_entries(values)
    sum_t = 0.0
    w_active = 0.0
    for key, t_val, w in entries:
        if _skipped(status, key):
            continue
        sum_t += t_val
        w_active += w
    if w_active <= 0:
        return int(_clamp(round(50.0), 0, 100))
    mult = ESG_RENORM_WEIGHT_TOTAL / w_active
    s = 50.0 + mult * sum_t
    return int(_clamp(round(s), 0, 100))


def score_to_grade(s: int | None) -> str | None:
    if s is None:
        return None
    if s >= 90:
        return "A+"
    if s >= 80:
        return "A"
    if s >= 72:
        return "B+"
    if s >= 62:
        return "B"
    if s >= 52:
        return "C+"
    if s >= 42:
        return "C"
    if s >= 30:
        return "D"
    return "F"


def score_to_votes(s: int) -> dict[str, int]:
    if s == 0:
        return {"invest": 0, "watch": 5, "skip": 95}
    if s >= 70:
        inv = 40 + (s - 70) * 1.5
        wat = max(5, 45 - (s - 70))
        skp = 100 - inv - wat
    elif s >= 40:
        inv = 10 + (s - 40)
        wat = 45
        skp = 100 - inv - wat
    else:
        skp = 50 + (40 - s)
        wat = 35
        inv = 100 - skp - wat
    return {
        "invest": max(0, round(inv)),
        "watch": max(0, round(wat)),
        "skip": max(0, round(skp)),
    }


def compute_investment_score(v: dict[str, Any], status: dict[str, str] | None = None) -> int | None:
    status = status or {}
    normal_keys = [
        "fin_runway",
        "fin_quality",
        "revenue_model",
        "valuation",
        "mkt_tam",
        "competitive",
        "regulatory_env",
        "tech_moat",
        "scalability",
        "data_quality",
        "cybersecurity",
        "ip_portfolio",
        "hw_lifespan",
        "ghg_intensity",
        "team_exec",
        "theme_fit",
        "advisory",
        "ai_governance",
        "model_robustness",
        "explainability",
        "legal_structure",
        "regulatory_compliance",
        "operational_risk",
        "exit_feasibility",
    ]
    inverse_keys = [
        "customer_conc",
        "key_person",
        "litigation",
        "concentration_risk",
    ]

    parts: list[float] = []
    for k in normal_keys:
        if _skipped(status, k):
            continue
        val = float(_get(v, k, 3))
        parts.append((val - 1) / 4)
    for k in inverse_keys:
        if _skipped(status, k):
            continue
        val = float(_get(v, k, 2))
        parts.append((5 - val) / 4)

    if not parts:
        return None
    avg = sum(parts) / len(parts)
    return int(_clamp(round(50 + avg * 50), 0, 100))


def ai_responsibility_score(v: dict[str, Any], status: dict[str, str] | None = None) -> float:
    status = status or {}
    pol = float(_get(v, "pol", 50)) / 100
    du = float(_get(v, "du", 10))
    wpn = float(_get(v, "wpn", 1))
    ai_gov = float(_get(v, "ai_governance", 3))
    robust = float(_get(v, "model_robustness", 3))
    d_ethics = float(_get(v, "data_ethics", 3))
    algo_b = float(_get(v, "algo_bias", 2))
    d_priv = float(_get(v, "data_privacy", 3))
    safety = float(_get(v, "safety_testing", 3))
    explain = float(_get(v, "explainability", 3))

    components: list[tuple[str, float, float]] = [
        ("du", 0.20, (1 - du / 100)),
        ("wpn", 0.15, (1 - (wpn - 1) / 4)),
        ("pol", 0.10, pol),
        ("ai_governance", 0.12, ((ai_gov - 1) / 4)),
        ("model_robustness", 0.07, ((robust - 1) / 4)),
        ("data_ethics", 0.09, ((d_ethics - 1) / 4)),
        ("algo_bias", 0.09, (1 - (algo_b - 1) / 4)),
        ("data_privacy", 0.07, ((d_priv - 1) / 4)),
        ("safety_testing", 0.06, ((safety - 1) / 4)),
        ("explainability", 0.05, ((explain - 1) / 4)),
    ]

    w_sum = 0.0
    x = 0.0
    for key, weight, val in components:
        if _skipped(status, key):
            continue
        w_sum += weight
        x += weight * val
    if w_sum <= 0:
        return 50.0
    x /= w_sum
    return _clamp(x * 100, 0, 100)


def research_quadrant(ai: float, inv: float | None) -> str:
    if inv is None:
        return "Insufficient data"
    high_ai = ai >= 50
    high_inv = inv >= 50
    if high_ai and high_inv:
        return "Win-win"
    if high_ai and not high_inv:
        return "Impact-first"
    if not high_ai and high_inv:
        return "Caution"
    return "Decline"


def legacy_demo_quadrant(v: dict[str, Any]) -> dict[str, Any]:
    pol = float(_get(v, "pol", 50))
    du = float(_get(v, "du", 10))
    egy = float(_get(v, "egy", 3))
    soc = float(_get(v, "soc", 3))
    ai_score = (100 - du) * 0.4 + ((egy - 1) / 4 * 100) * 0.3 + pol * 0.3
    ent_score = pol * 0.5 + ((soc - 1) / 4 * 100) * 0.5
    is_high_tech = ai_score > 50
    is_entrepreneur = ent_score > 50
    if is_high_tech:
        label = "Architects" if is_entrepreneur else "Accelerators"
    else:
        label = "Activators" if is_entrepreneur else "Adopters"
    return {"label": label, "ai_score": ai_score, "entrepreneur_score": ent_score}


def build_pros_cons(v: dict[str, Any], esg: int, inv: int | None) -> tuple[str, str]:
    pros: list[str] = []
    cons: list[str] = []
    inv_eff = inv if inv is not None else 0

    if esg >= 70:
        pros.append("Strong ESG / responsibility signals versus framework baseline.")
    if inv is not None and inv >= 70:
        pros.append("Investment thesis dimensions score above median.")
    if float(_get(v, "theme_fit", 3)) >= 4:
        pros.append("Clear alignment with selected strategic theme.")
    if float(_get(v, "ai_governance", 3)) >= 4:
        pros.append("Mature AI governance framework in place.")
    if float(_get(v, "data_ethics", 3)) >= 4:
        pros.append("Strong data ethics practices — builds trust with regulators and users.")
    if float(_get(v, "soc", 3)) >= 4:
        pros.append("High societal benefit score — strong impact narrative.")
    if float(_get(v, "scalability", 3)) >= 4:
        pros.append("Technical architecture is highly scalable.")
    if float(_get(v, "team_exec", 3)) >= 4:
        pros.append("Strong team execution track record.")
    if float(_get(v, "exit_feasibility", 3)) >= 4:
        pros.append("Credible exit paths identified within horizon.")

    if int(_get(v, "excl", 0)) == 1:
        cons.append("CRITICAL: Gatekeeper / exclusion flag triggered — deal-breaker.")
    if float(_get(v, "du", 0)) >= 50:
        cons.append("Elevated dual-use risk — extra safeguards and governance required.")
    if float(_get(v, "algo_bias", 2)) >= 4:
        cons.append("High algorithmic bias risk — requires independent audit before proceeding.")
    if float(_get(v, "customer_conc", 2)) >= 4:
        cons.append("High customer concentration risk — diversification needed.")
    if float(_get(v, "key_person", 2)) >= 4:
        cons.append("Significant key-person dependency — succession planning critical.")
    if float(_get(v, "litigation", 1)) >= 3:
        cons.append("Material litigation exposure — legal DD must be prioritised.")
    if float(_get(v, "concentration_risk", 2)) >= 4:
        cons.append("High concentration risk across suppliers / geographies / technology.")
    if inv is not None and inv < 50:
        cons.append("Weaker financial / market / execution signals — diligence focus needed.")
    if inv is None:
        cons.append("Investment score not computed — no assessed investment-DD factors (all skipped).")
    if esg < 50:
        cons.append("ESG score below midpoint — strengthen policies, env footprint, or safety.")
    if float(_get(v, "cybersecurity", 3)) <= 2:
        cons.append("Cybersecurity posture is weak — material operational risk.")

    if not pros:
        pros.append("Document assumptions; refine after management QA.")
    if not cons:
        cons.append("No major red flags from sliders — validate with primary data.")
    return "\n".join(f"• {p}" for p in pros), "\n".join(f"• {c}" for c in cons)


def build_recommendations(v: dict[str, Any], esg: int, inv: int | None, ai: float) -> str:
    recs: list[str] = []

    if int(_get(v, "excl", 0)) == 1:
        recs.append("Immediately resolve gatekeeper / exclusion flag before any further engagement.")
    if float(_get(v, "du", 0)) >= 30:
        recs.append("Commission an independent dual-use risk assessment and establish end-user monitoring.")
    if float(_get(v, "algo_bias", 2)) >= 3:
        recs.append("Conduct a third-party algorithmic bias audit and implement debiasing measures.")
    if float(_get(v, "cybersecurity", 3)) <= 2:
        recs.append("Mandate a cybersecurity maturity assessment (e.g. SOC 2 / ISO 27001) pre-close.")
    if float(_get(v, "customer_conc", 2)) >= 3:
        recs.append("Negotiate revenue diversification milestones as a condition of disbursement.")
    if float(_get(v, "key_person", 2)) >= 3:
        recs.append("Require a key-person insurance policy and documented succession plan.")
    if float(_get(v, "transparency", 3)) <= 2:
        recs.append("Establish quarterly reporting requirements and board observer rights.")
    if float(_get(v, "regulatory_compliance", 3)) <= 2:
        recs.append("Engage external counsel to perform a regulatory compliance gap analysis.")
    if esg < 60:
        recs.append("Develop an ESG improvement roadmap with concrete milestones within 12 months.")
    if inv is not None and inv < 65:
        recs.append("Request updated financial model with sensitivity analysis before term sheet.")
    if inv is None:
        recs.append("Assess at least one financial, market, technology, team, legal, or risk factor to produce an investment score.")
    if ai < 50:
        recs.append("Require an AI governance framework and responsible AI policy before deployment.")
    if float(_get(v, "data_privacy", 3)) <= 2:
        recs.append("Implement GDPR / data protection compliance programme and appoint a DPO.")
    if float(_get(v, "exit_feasibility", 3)) <= 2:
        recs.append("Map credible exit routes and include drag-along / tag-along provisions.")
    if float(_get(v, "safety_testing", 3)) <= 2:
        recs.append("Implement comprehensive AI safety testing and red-teaming before production deployment.")
    if float(_get(v, "ip_portfolio", 3)) <= 2:
        recs.append("Conduct IP due diligence and strengthen patent / trade-secret protections.")

    if not recs:
        recs.append("No critical recommendations — proceed with standard due-diligence track.")
    return "\n".join(f"• {r}" for r in recs)


def build_investment_thesis(v: dict[str, Any], esg: int, inv: int | None, ai: float, quad: str) -> str:
    company_strengths: list[str] = []
    if float(_get(v, "tech_moat", 3)) >= 4:
        company_strengths.append("a defensible technology moat")
    if float(_get(v, "scalability", 3)) >= 4:
        company_strengths.append("a highly scalable architecture")
    if float(_get(v, "mkt_tam", 3)) >= 4:
        company_strengths.append("a large addressable market")
    if float(_get(v, "team_exec", 3)) >= 4:
        company_strengths.append("a strong management team")
    if float(_get(v, "revenue_model", 3)) >= 4:
        company_strengths.append("a proven revenue model")
    if float(_get(v, "ai_governance", 3)) >= 4:
        company_strengths.append("mature AI governance")

    thesis_parts: list[str] = []

    if quad == "Insufficient data":
        thesis_parts.append(
            f"AI responsibility is {ai:.0f}/100, but the investment score could not be computed "
            f"because every investment-DD factor was marked not applicable or no information."
        )
    elif quad == "Win-win":
        thesis_parts.append(
            f"This opportunity falls in the Win-win quadrant (AI Responsibility {ai:.0f}, "
            f"Investment Score {inv}), indicating strong alignment between responsible AI "
            f"practices and investment attractiveness."
        )
    elif quad == "Impact-first":
        thesis_parts.append(
            f"This opportunity sits in the Impact-first quadrant (AI Responsibility {ai:.0f}, "
            f"Investment Score {inv}), with strong responsible AI credentials that may compensate "
            f"for moderate financial returns through impact-driven value creation."
        )
    elif quad == "Caution":
        thesis_parts.append(
            f"This opportunity is in the Caution quadrant (AI Responsibility {ai:.0f}, "
            f"Investment Score {inv}). While financially attractive, AI responsibility "
            f"improvements are needed to mitigate reputational and regulatory risk."
        )
    else:
        thesis_parts.append(
            f"This opportunity is in the Decline quadrant (AI Responsibility {ai:.0f}, "
            f"Investment Score {inv}). Both dimensions require significant improvement "
            f"for the investment to be justifiable."
        )

    if company_strengths:
        thesis_parts.append(
            f"Key differentiators include {', '.join(company_strengths[:-1])}"
            + (f", and {company_strengths[-1]}" if len(company_strengths) > 1 else company_strengths[0])
            + "."
        )

    if esg >= 80:
        thesis_parts.append(
            f"With an ESG score of {esg}/100, the company demonstrates industry-leading "
            f"environmental, social, and governance practices."
        )
    elif esg >= 60:
        thesis_parts.append(
            f"The ESG score of {esg}/100 indicates solid fundamentals with room for improvement "
            f"in specific areas identified in the risk analysis."
        )

    if inv is not None and inv >= 80:
        thesis_parts.append(
            "The investment fundamentals are compelling across financial, market, and "
            "operational dimensions, supporting a positive investment decision."
        )

    inv_ok = inv is not None and inv >= 70
    thesis_parts.append(
        "The recommendation is to "
        + (
            "proceed to term sheet negotiations"
            if quad == "Win-win" and esg >= 70 and inv_ok
            else "proceed with enhanced monitoring conditions"
            if quad in ("Win-win", "Impact-first") and inv is not None
            else "conduct further due diligence before proceeding"
            if quad == "Caution" and inv is not None
            else "pass on this opportunity or require fundamental restructuring"
            if inv is not None
            else "complete investment-DD factors before drawing firm conclusions on financial attractiveness"
        )
        + ", subject to the specific recommendations outlined above."
    )

    return " ".join(thesis_parts)


def compute_full_scorecard(
    values: dict[str, Any],
    factor_status: dict[str, str] | None = None,
) -> dict[str, Any]:
    st = dict(factor_status or {})
    # Gatekeeper must always apply
    st.pop("excl", None)

    esg = compute_esg_score(values, st)
    inv = compute_investment_score(values, st)
    esg_grade = score_to_grade(esg)
    inv_grade = score_to_grade(inv)
    votes = score_to_votes(esg)
    ai = ai_responsibility_score(values, st)
    quad = research_quadrant(ai, float(inv) if inv is not None else None)
    legacy = legacy_demo_quadrant(values)
    pros, cons = build_pros_cons(values, esg, inv)
    recommendations = build_recommendations(values, esg, inv, ai)
    investment_thesis = build_investment_thesis(values, esg, inv, ai, quad)

    return {
        "esg_score": esg,
        "esg_grade": esg_grade,
        "investment_score": inv,
        "investment_grade": inv_grade,
        "votes": votes,
        "forest": votes,
        "ai_responsibility": round(ai, 2),
        "research_quadrant": quad,
        "legacy_quadrant": legacy,
        "pros": pros,
        "cons": cons,
        "recommendations": recommendations,
        "investment_thesis": investment_thesis,
        "feature_weights": FEATURE_WEIGHTS,
        "esg_renorm_weight_total": ESG_RENORM_WEIGHT_TOTAL,
    }


def forest_dots(votes: dict[str, int], n: int = 500) -> list[str]:
    inv_pct = votes.get("invest", 0) / 100.0
    wat_pct = votes.get("watch", 0) / 100.0
    ni = int(round(inv_pct * n))
    nw = int(round(wat_pct * n))
    greens = ["#1D9E75"] * ni
    ambers = ["#BA7517"] * nw
    reds = ["#A32D2D"] * (n - ni - nw)
    return greens + ambers + reds

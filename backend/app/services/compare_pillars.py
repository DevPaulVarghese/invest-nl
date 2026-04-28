from __future__ import annotations

from typing import Any

from app.licensing import verify_license_sync
from app.services.scoring_input import is_skipped_status, unpack_inputs_payload

_DEFAULTS: dict[str, float | int] = {
    "pol": 72.0,
    "bdiv": 40.0,
    "ceo": 0,
    "whistleblower": 3.0,
    "audit_quality": 3.0,
    "ai_governance": 3.0,
    "transparency": 3.0,
    "explainability": 3.0,
    "data_ethics": 3.0,
    "model_robustness": 3.0,
    "algo_bias": 2.0,
    "safety_testing": 3.0,
    "data_privacy": 3.0,
    "cybersecurity": 3.0,
    "data_quality": 3.0,
    "regulatory_compliance": 3.0,
    "egy": 3.0,
    "circ": 3.0,
    "ghg": 3.0,
    "biodiversity": 3.0,
    "renewable_pct": 3.0,
    "ghg_intensity": 3.0,
    "wat": 2.0,
    "crm": 0,
}


def _skipped(status: dict[str, str], key: str) -> bool:
    return is_skipped_status(status.get(key))


def _f(v: dict[str, Any], key: str) -> float:
    d = _DEFAULTS.get(key, 3.0)
    x = v.get(key, d)
    if x is None:
        return float(d)
    return float(x)


def _i(v: dict[str, Any], key: str) -> int:
    d = int(_DEFAULTS.get(key, 0))
    x = v.get(key, d)
    if x is None:
        return d
    return int(x)


def _slider_0_100(v: dict[str, Any], status: dict[str, str], key: str) -> float | None:
    if _skipped(status, key):
        return None
    val = _f(v, key)
    return (val - 1.0) / 4.0 * 100.0


def _slider_inv_0_100(v: dict[str, Any], status: dict[str, str], key: str) -> float | None:
    if _skipped(status, key):
        return None
    val = _f(v, key)
    return (5.0 - val) / 4.0 * 100.0


def _mean(parts: list[float]) -> float | None:
    if not parts:
        return None
    return sum(parts) / len(parts)


def compute_pillar_scores(raw_inputs: dict[str, Any]) -> dict[str, float | None]:
    if not verify_license_sync():
        return {"governance": None, "transparency": None, "privacy": None, "environmental": None}
    values, status = unpack_inputs_payload(raw_inputs)
    v = values

    gov_parts: list[float] = []
    if not _skipped(status, "pol"):
        gov_parts.append(_f(v, "pol"))
    if not _skipped(status, "bdiv"):
        gov_parts.append(_f(v, "bdiv"))
    if not _skipped(status, "ceo"):
        gov_parts.append((1.0 - float(_i(v, "ceo"))) * 100.0)
    for k in ("whistleblower", "audit_quality", "ai_governance"):
        p = _slider_0_100(v, status, k)
        if p is not None:
            gov_parts.append(p)

    trans_parts: list[float] = []
    for k in ("transparency", "explainability", "data_ethics", "model_robustness", "safety_testing"):
        p = _slider_0_100(v, status, k)
        if p is not None:
            trans_parts.append(p)
    p = _slider_inv_0_100(v, status, "algo_bias")
    if p is not None:
        trans_parts.append(p)

    priv_parts: list[float] = []
    for k in ("data_privacy", "cybersecurity", "data_quality", "regulatory_compliance"):
        p = _slider_0_100(v, status, k)
        if p is not None:
            priv_parts.append(p)

    env_parts: list[float] = []
    for k in ("egy", "circ", "ghg", "biodiversity", "renewable_pct", "ghg_intensity"):
        p = _slider_0_100(v, status, k)
        if p is not None:
            env_parts.append(p)
    p = _slider_inv_0_100(v, status, "wat")
    if p is not None:
        env_parts.append(p)
    if not _skipped(status, "crm"):
        env_parts.append((1.0 - float(_i(v, "crm"))) * 100.0)

    return {
        "governance": _mean(gov_parts),
        "transparency": _mean(trans_parts),
        "privacy": _mean(priv_parts),
        "environmental": _mean(env_parts),
    }

"""Unpack/pack evaluation payloads: legacy flat ScoreInputs vs wrapped {values, factor_status}."""

from __future__ import annotations

from typing import Any

STATUS_ANSWERED = "answered"
STATUS_NA = "na"
STATUS_NO_INFO = "no_info"


def is_skipped_status(st: str | None) -> bool:
    return st in (STATUS_NA, STATUS_NO_INFO)


def unpack_inputs_payload(raw: dict[str, Any]) -> tuple[dict[str, Any], dict[str, str]]:
    """Return (values, factor_status). Legacy rows are flat factor dicts."""
    if "values" in raw and isinstance(raw["values"], dict):
        status = raw.get("factor_status") or {}
        out_status = {k: str(v) for k, v in status.items() if isinstance(k, str)}
        return dict(raw["values"]), out_status
    return dict(raw), {}


def pack_inputs_payload(values: dict[str, Any], factor_status: dict[str, str] | None) -> dict[str, Any]:
    """Persist wrapped form when any skipped status exists; else flat for backward compatibility."""
    full = {str(k): str(v) for k, v in (factor_status or {}).items()}
    skipped_only = {k: v for k, v in full.items() if is_skipped_status(v)}
    if not skipped_only:
        return dict(values)
    return {"values": dict(values), "factor_status": skipped_only}

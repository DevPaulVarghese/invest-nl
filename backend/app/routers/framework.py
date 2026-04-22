from pathlib import Path

import yaml
from fastapi import APIRouter

router = APIRouter(prefix="/framework", tags=["framework"])

_FRAMEWORK_PATH = Path(__file__).resolve().parents[1] / "scoring" / "framework_v1.yaml"


@router.get("")
def get_framework() -> dict:
    with _FRAMEWORK_PATH.open(encoding="utf-8") as f:
        return yaml.safe_load(f)

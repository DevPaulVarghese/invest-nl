from typing import Any

from fastapi import APIRouter, Body

from app.schemas import ScoreInputs, ScorePreviewRequest, ScorePreviewResponse
from app.services.scoring import compute_full_scorecard, forest_dots

router = APIRouter(prefix="/score", tags=["score"])


@router.post("/preview", response_model=ScorePreviewResponse)
def preview_score(data: dict[str, Any] = Body(...)) -> ScorePreviewResponse:
    """Accepts `{ inputs, factor_status }` or a legacy flat ScoreInputs object."""
    if isinstance(data.get("inputs"), dict):
        req = ScorePreviewRequest.model_validate(data)
    else:
        req = ScorePreviewRequest(inputs=ScoreInputs.model_validate(data), factor_status={})
    values = req.inputs.model_dump()
    status = {k: v.value for k, v in req.factor_status.items()}
    scores = compute_full_scorecard(values, status)
    votes = scores["votes"]
    colors = forest_dots(votes)
    return ScorePreviewResponse(scores=scores, forest_colors=colors)

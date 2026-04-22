from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InvestmentEvaluation
from app.schemas import EvaluationCreate, EvaluationOut, EvaluationUpdate
from app.services.scoring import compute_full_scorecard
from app.services.scoring_input import pack_inputs_payload, unpack_inputs_payload

router = APIRouter(prefix="/evaluations", tags=["evaluations"])


@router.post("", response_model=EvaluationOut)
def create_evaluation(
    body: EvaluationCreate, db: Session = Depends(get_db)
) -> InvestmentEvaluation:
    values = body.inputs.model_dump()
    status = {k: v.value for k, v in body.factor_status.items()}
    scores = compute_full_scorecard(values, status)
    inputs_payload = pack_inputs_payload(values, status)
    ev = InvestmentEvaluation(
        title=body.title,
        company_name=body.company_name,
        theme_selected=body.theme_selected,
        company_narrative=body.company_narrative,
        scope_json=body.scope_json,
        inputs_json=inputs_payload,
        scores_json=scores,
        pros=body.pros or scores.get("pros"),
        cons=body.cons or scores.get("cons"),
        quadrant_label=scores.get("research_quadrant"),
        portfolio_company_id=body.portfolio_company_id,
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev


@router.get("", response_model=list[EvaluationOut])
def list_evaluations(db: Session = Depends(get_db)) -> list[InvestmentEvaluation]:
    rows = db.scalars(
        select(InvestmentEvaluation).order_by(InvestmentEvaluation.created_at.desc())
    ).all()
    return list(rows)


@router.get("/{eval_id}", response_model=EvaluationOut)
def get_evaluation(
    eval_id: UUID, db: Session = Depends(get_db)
) -> InvestmentEvaluation:
    row = db.get(InvestmentEvaluation, eval_id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    return row


@router.patch("/{eval_id}", response_model=EvaluationOut)
def patch_evaluation(
    eval_id: UUID, body: EvaluationUpdate, db: Session = Depends(get_db)
) -> InvestmentEvaluation:
    row = db.get(InvestmentEvaluation, eval_id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    data = body.model_dump(exclude_unset=True)
    inputs_update = data.pop("inputs", None)
    factor_status_update = data.pop("factor_status", None)
    for k, v in data.items():
        setattr(row, k, v)
    if inputs_update is not None or factor_status_update is not None:
        vals, st = unpack_inputs_payload(row.inputs_json)
        if inputs_update is not None:
            vals = {**vals, **inputs_update}
        if factor_status_update is not None:
            st = {**st, **{k: v.value for k, v in factor_status_update.items()}}
        row.inputs_json = pack_inputs_payload(vals, st)
        scores = compute_full_scorecard(vals, st)
        row.scores_json = scores
        row.pros = scores.get("pros")
        row.cons = scores.get("cons")
        row.quadrant_label = scores.get("research_quadrant")
    db.commit()
    db.refresh(row)
    return row

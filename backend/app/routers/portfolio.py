from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InvestmentEvaluation, PortfolioCompany
from app.schemas import BenchmarkEntry, BenchmarkResponse, PortfolioOut
from app.services.compare_pillars import compute_pillar_scores

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("", response_model=list[PortfolioOut])
def list_portfolio(
    theme: str | None = Query(None),
    financing: str | None = Query(None, description="direct, indirect, or all"),
    db: Session = Depends(get_db),
) -> list[PortfolioCompany]:
    q = select(PortfolioCompany)
    if theme and theme != "all":
        q = q.where(PortfolioCompany.theme == theme)
    if financing and financing not in ("all", ""):
        q = q.where(PortfolioCompany.financing_path == financing)
    q = q.order_by(PortfolioCompany.name)
    return list(db.scalars(q).all())


@router.get("/benchmarks", response_model=BenchmarkResponse)
def get_benchmarks(db: Session = Depends(get_db)) -> BenchmarkResponse:
    q = (
        select(InvestmentEvaluation, PortfolioCompany)
        .join(
            PortfolioCompany,
            InvestmentEvaluation.portfolio_company_id == PortfolioCompany.id,
        )
        .where(InvestmentEvaluation.portfolio_company_id.isnot(None))
        .where(InvestmentEvaluation.scores_json.isnot(None))
        .order_by(InvestmentEvaluation.created_at.desc())
    )
    rows = db.execute(q).all()

    seen: set[str] = set()
    entries: list[BenchmarkEntry] = []
    for ev, pc in rows:
        if pc.slug in seen:
            continue
        seen.add(pc.slug)
        scores = ev.scores_json or {}
        inv = scores.get("investment_score")
        inv_f = float(inv) if inv is not None else None
        pillars = compute_pillar_scores(ev.inputs_json or {})
        entries.append(
            BenchmarkEntry(
                company_name=pc.name,
                slug=pc.slug,
                logo_url=pc.logo_url,
                theme_selected=ev.theme_selected,
                esg_score=float(scores.get("esg_score", 0)),
                investment_score=inv_f,
                ai_responsibility=float(scores.get("ai_responsibility", 0)),
                quadrant_label=ev.quadrant_label,
                governance_pillar=pillars["governance"],
                transparency_pillar=pillars["transparency"],
                privacy_pillar=pillars["privacy"],
                environmental_pillar=pillars["environmental"],
            )
        )

    if entries:
        avg_esg = sum(e.esg_score for e in entries) / len(entries)
        inv_vals = [e.investment_score for e in entries if e.investment_score is not None]
        avg_inv = sum(inv_vals) / len(inv_vals) if inv_vals else 0.0
        avg_ai = sum(e.ai_responsibility for e in entries) / len(entries)
    else:
        avg_esg = avg_inv = avg_ai = 0.0

    def _avg_pillar(attr: str) -> float | None:
        vals = [getattr(e, attr) for e in entries]
        xs = [x for x in vals if x is not None]
        return round(sum(xs) / len(xs), 2) if xs else None

    return BenchmarkResponse(
        companies=entries,
        avg_esg=round(avg_esg, 2),
        avg_investment=round(avg_inv, 2),
        avg_ai_responsibility=round(avg_ai, 2),
        count=len(entries),
        avg_governance_pillar=_avg_pillar("governance_pillar"),
        avg_transparency_pillar=_avg_pillar("transparency_pillar"),
        avg_privacy_pillar=_avg_pillar("privacy_pillar"),
        avg_environmental_pillar=_avg_pillar("environmental_pillar"),
    )


@router.get("/{slug}", response_model=PortfolioOut)
def get_portfolio(slug: str, db: Session = Depends(get_db)) -> PortfolioCompany:
    row = db.scalars(
        select(PortfolioCompany).where(PortfolioCompany.slug == slug)
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    return row

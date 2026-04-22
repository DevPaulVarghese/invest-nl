from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import InvestmentEvaluation, PortfolioCompany
from app.schemas import BenchmarkEntry, BenchmarkResponse, PortfolioOut

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
        entries.append(
            BenchmarkEntry(
                company_name=pc.name,
                slug=pc.slug,
                logo_url=pc.logo_url,
                esg_score=scores.get("esg_score", 0),
                investment_score=scores.get("investment_score", 0),
                ai_responsibility=scores.get("ai_responsibility", 0),
                quadrant_label=ev.quadrant_label,
            )
        )

    if entries:
        avg_esg = sum(e.esg_score for e in entries) / len(entries)
        avg_inv = sum(e.investment_score for e in entries) / len(entries)
        avg_ai = sum(e.ai_responsibility for e in entries) / len(entries)
    else:
        avg_esg = avg_inv = avg_ai = 0.0

    return BenchmarkResponse(
        companies=entries,
        avg_esg=round(avg_esg, 2),
        avg_investment=round(avg_inv, 2),
        avg_ai_responsibility=round(avg_ai, 2),
        count=len(entries),
    )


@router.get("/{slug}", response_model=PortfolioOut)
def get_portfolio(slug: str, db: Session = Depends(get_db)) -> PortfolioCompany:
    row = db.scalars(
        select(PortfolioCompany).where(PortfolioCompany.slug == slug)
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    return row

"""Idempotent seed for portfolio_companies.

Run from `backend/`:
  set PYTHONPATH=.
  python scripts/seed_portfolio.py
"""

import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import PortfolioCompany

ROWS: list[dict] = [
    {
        "slug": "gelijkgezond",
        "name": "GelijkGezond",
        "description": "Provides preventive care to low-income individuals.",
        "theme": "HEALTH",
        "financing_path": None,
        "logo_url": "https://invest-nl.stream.prepr.io/5g22f4k6a35q/w_1872,h_1400,ex_0,ey_0,ew_468,eh_350/logo-gelijkgezond.webp",
        "detail_path": "/en/impact/our-portfolio/gelijkgezond",
    },
    {
        "slug": "eqt-health-economics-3",
        "name": "EQT Health Economics 3",
        "description": "EQT Health Economics 3 actively invests in Dutch and European healthtech scale-ups.",
        "theme": "HEALTH",
        "financing_path": None,
        "logo_url": "https://invest-nl.stream.prepr.io/r45hla4olv5/w_1872,h_1400,ex_0,ey_0,ew_468,eh_350/logo.webp",
        "detail_path": "/en/impact/our-portfolio/eqt-health-economics-3",
    },
    {
        "slug": "zhero-systems",
        "name": "Zhero Systems",
        "description": "Creates circular battery systems for businesses and consumers.",
        "theme": "BIOBASED",
        "financing_path": None,
        "logo_url": "https://invest-nl.stream.prepr.io/3rsdstu5klee/w_1872,h_1400,ex_0,ey_0,ew_468,eh_350/logo-zhero.webp",
        "detail_path": "/en/impact/our-portfolio/zhero-systems",
    },
    {
        "slug": "iq-capital-fund-v",
        "name": "IQ Capital Fund V",
        "description": "Invests in deep tech companies in the early growth phase.",
        "theme": "TECH",
        "financing_path": None,
        "logo_url": "https://invest-nl.stream.prepr.io/6pt9f67l20pq/w_1872,h_1400,ex_0,ey_0,ew_468,eh_350/logo-iq-capital.webp",
        "detail_path": "/en/impact/our-portfolio/iq-capital-fund-v",
    },
    {
        "slug": "positron-ventures",
        "name": "Positron Ventures",
        "description": "Invests in scientific solutions for major societal challenges.",
        "theme": "TECH",
        "financing_path": None,
        "logo_url": "https://invest-nl.stream.prepr.io/3x5gm02rlb1d/w_1872,h_1400,ex_0,ey_0,ew_468,eh_350/logo-positron-2.webp",
        "detail_path": "/en/impact/our-portfolio/positron-ventures",
    },
    {
        "slug": "fastned",
        "name": "Fastned",
        "description": "Makes electric driving easy with fast charging stations.",
        "theme": "ENERGY",
        "financing_path": None,
        "logo_url": "https://invest-nl.stream.prepr.io/3j4wheuya11y/w_1872,h_1400,ex_0,ey_0,ew_468,eh_350/logo-fastned.webp",
        "detail_path": "/en/impact/our-portfolio/fastned",
    },
    {
        "slug": "pureterra-ventures-fund-ii",
        "name": "PureTerra Ventures Fund II",
        "description": "Invests in innovative solutions for the water sector.",
        "theme": "BIOBASED",
        "financing_path": None,
        "logo_url": "https://invest-nl.stream.prepr.io/7cemg7buhwot/w_1872,h_1400,ex_0,ey_0,ew_468,eh_350/logo-pureterra-2.webp",
        "detail_path": "/en/impact/our-portfolio/pureterra-ventures-fund-ii",
    },
    {
        "slug": "nextgen-ventures-fund-iii",
        "name": "Nextgen Ventures Fund III",
        "description": "Invests in promising medtech and healthtech startups in the early stages.",
        "theme": "HEALTH",
        "financing_path": None,
        "logo_url": "https://invest-nl.stream.prepr.io/746jvnfcynxm/w_1872,h_1400,ex_0,ey_0,ew_468,eh_350/logo-nextgen.webp",
        "detail_path": "/en/impact/our-portfolio/nextgen-ventures-fund-iii",
    },
    {
        "slug": "qualinx",
        "name": "Qualinx",
        "description": "Developing a new generation of GNSS chips that are energy efficient.",
        "theme": "TECH",
        "financing_path": None,
        "logo_url": "https://invest-nl.stream.prepr.io/29fd17c9sywv/w_1872,h_1400,ex_0,ey_0,ew_468,eh_350/logo-qualinx.webp",
        "detail_path": "/en/impact/our-portfolio/qualinx",
    },
    {
        "slug": "sandgrain",
        "name": "Sandgrain",
        "description": "Develops unique chip technology for securing critical infrastructure worldwide.",
        "theme": "TECH",
        "financing_path": None,
        "logo_url": "https://invest-nl.stream.prepr.io/2kfh0ut2ibg5/w_1872,h_1400,ex_0,ey_0,ew_468,eh_350/logo-sandgrain.webp",
        "detail_path": "/en/impact/our-portfolio/sandgrain",
    },
    {
        "slug": "qorium",
        "name": "Qorium",
        "description": "Produces sustainable and animal-friendly cultivated leather through biotechnology.",
        "theme": "BIOBASED",
        "financing_path": None,
        "logo_url": "https://invest-nl.stream.prepr.io/32u1oxg2scem/w_1872,h_1400,ex_0,ey_0,ew_468,eh_350/logo-qorium.webp",
        "detail_path": "/en/impact/our-portfolio/qorium",
    },
    {
        "slug": "rubio-impact-ventures-fund-iii",
        "name": "Rubio Impact Ventures Fund III",
        "description": "Invests in companies that build solutions for climate and social inequality.",
        "theme": "GENERAL",
        "financing_path": None,
        "logo_url": "https://invest-nl.stream.prepr.io/6dv9p55uoh9b/w_1872,h_1400,ex_0,ey_0,ew_468,eh_350/logo-rubio.webp",
        "detail_path": "/en/impact/our-portfolio/rubio-impact-ventures-fund-iii",
    },
]


def seed() -> None:
    db: Session = SessionLocal()
    try:
        n = 0
        for r in ROWS:
            exists = db.scalars(
                select(PortfolioCompany).where(PortfolioCompany.slug == r["slug"])
            ).first()
            if exists:
                continue
            db.add(PortfolioCompany(id=uuid.uuid4(), **r))
            n += 1
        db.commit()
        print(f"Inserted {n} new portfolio rows ({len(ROWS)} total in seed list).")
    finally:
        db.close()


if __name__ == "__main__":
    seed()

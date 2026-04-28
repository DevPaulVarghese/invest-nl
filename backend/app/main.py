from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.licensing import LicenseMiddleware, _run_check
from app.routers import evaluations, framework, portfolio, score


@asynccontextmanager
async def lifespan(application: FastAPI):
    from app.database import Base, engine

    Base.metadata.create_all(bind=engine)
    try:
        from scripts.seed_portfolio import seed as seed_portfolio
        seed_portfolio()
    except Exception:
        pass
    try:
        from scripts.seed_demo import seed as seed_demo
        seed_demo()
    except Exception:
        pass
    await _run_check()
    yield


app = FastAPI(title="Decision Lab API", version="0.1.0", lifespan=lifespan)

app.add_middleware(LicenseMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolio.router, prefix="/api")
app.include_router(evaluations.router, prefix="/api")
app.include_router(score.router, prefix="/api")
app.include_router(framework.router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

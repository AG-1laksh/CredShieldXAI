from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router as api_router

app = FastAPI(
    title="CrediShield XAI API",
    version="1.0.0",
    description="Explainable Credit Risk Assessment API with SHAP reason codes and analytics logging.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "CrediShield XAI API"}

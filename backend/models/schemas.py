from __future__ import annotations

from datetime import datetime
from typing import List

from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    checking_status: str
    duration: int = Field(..., ge=1)
    credit_history: str
    purpose: str
    credit_amount: int = Field(..., ge=1)
    savings_status: str
    employment: str
    installment_commitment: int = Field(..., ge=1, le=4)
    personal_status: str
    other_parties: str
    residence_since: int = Field(..., ge=1, le=4)
    property_magnitude: str
    age: int = Field(..., ge=18)
    other_payment_plans: str
    housing: str
    existing_credits: int = Field(..., ge=1)
    job: str
    num_dependents: int = Field(..., ge=1)
    own_telephone: str
    foreign_worker: str


class ReasonCode(BaseModel):
    feature: str
    impact: float


class PredictionResponse(BaseModel):
    probability_of_default: float
    top_risk_increasing: List[ReasonCode]
    top_risk_decreasing: List[ReasonCode]


class AnalyticsTrendPoint(BaseModel):
    date: str
    prediction_count: int
    avg_pd: float
    high_risk_rate: float


class AnalyticsResponse(BaseModel):
    total_predictions: int
    last_prediction_at: datetime | None
    trends: List[AnalyticsTrendPoint]

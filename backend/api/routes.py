from __future__ import annotations

from fastapi import APIRouter

from backend.models.schemas import AnalyticsResponse, PredictionRequest, PredictionResponse
from backend.services.database_service import DatabaseService
from backend.services.prediction_service import PredictionService

router = APIRouter()
prediction_service = PredictionService()
database_service = DatabaseService()


@router.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest) -> PredictionResponse:
    payload_dict = payload.model_dump()
    prediction = prediction_service.predict_with_reason_codes(payload_dict)
    database_service.log_prediction(payload_dict, prediction)
    return PredictionResponse(**prediction)


@router.get("/analytics", response_model=AnalyticsResponse)
def analytics() -> AnalyticsResponse:
    analytics_payload = database_service.fetch_trends()
    return AnalyticsResponse(**analytics_payload)

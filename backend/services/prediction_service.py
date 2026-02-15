from __future__ import annotations

from typing import Any, Dict

from model_trainer import get_explanation, load_bundle


class PredictionService:
    def __init__(self) -> None:
        # Warm model + preprocessing artifacts on startup
        load_bundle()

    def predict_with_reason_codes(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return get_explanation(payload)

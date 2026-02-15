from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

from model_trainer import ARTIFACT_PATH, get_explanation, get_training_schema, load_bundle


class PredictionService:
    def __init__(self) -> None:
        # Warm model + preprocessing artifacts on startup
        load_bundle()
        self.model_version = "1.0.0"

    def predict_with_reason_codes(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return get_explanation(payload)

    def get_model_registry_info(self) -> Dict[str, Any]:
        artifact = Path(ARTIFACT_PATH)
        trained_at = None
        if artifact.exists():
            trained_at = datetime.fromtimestamp(artifact.stat().st_mtime, tz=timezone.utc).isoformat()

        schema = get_training_schema()
        return {
            "model_version": self.model_version,
            "artifact_path": str(artifact.resolve()),
            "last_trained_at": trained_at,
            "categorical_features": schema.get("categorical_features", []),
            "numerical_features": schema.get("numerical_features", []),
        }

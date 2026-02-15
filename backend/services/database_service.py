from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

DB_PATH = Path("history.db")


class DatabaseService:
    def __init__(self, db_path: Path = DB_PATH) -> None:
        self.db_path = db_path
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def _initialize(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS predictions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    input_json TEXT NOT NULL,
                    pd_score REAL NOT NULL,
                    top_risk_increasing_json TEXT NOT NULL,
                    top_risk_decreasing_json TEXT NOT NULL
                )
                """
            )
            conn.commit()

    def log_prediction(self, model_input: Dict[str, Any], model_output: Dict[str, Any]) -> None:
        now_iso = datetime.now(timezone.utc).isoformat()

        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO predictions (
                    timestamp,
                    input_json,
                    pd_score,
                    top_risk_increasing_json,
                    top_risk_decreasing_json
                ) VALUES (?, ?, ?, ?, ?)
                """,
                (
                    now_iso,
                    json.dumps(model_input),
                    float(model_output["probability_of_default"]),
                    json.dumps(model_output["top_risk_increasing"]),
                    json.dumps(model_output["top_risk_decreasing"]),
                ),
            )
            conn.commit()

    def fetch_trends(self) -> Dict[str, Any]:
        with self._connect() as conn:
            conn.row_factory = sqlite3.Row

            total = conn.execute("SELECT COUNT(*) AS c FROM predictions").fetchone()["c"]
            latest_row = conn.execute("SELECT MAX(timestamp) AS latest FROM predictions").fetchone()
            last_prediction_at = latest_row["latest"] if latest_row else None

            trend_rows = conn.execute(
                """
                SELECT
                    DATE(timestamp) AS date,
                    COUNT(*) AS prediction_count,
                    AVG(pd_score) AS avg_pd,
                    AVG(CASE WHEN pd_score >= 0.5 THEN 1.0 ELSE 0.0 END) AS high_risk_rate
                FROM predictions
                GROUP BY DATE(timestamp)
                ORDER BY DATE(timestamp) ASC
                """
            ).fetchall()

        trends: List[Dict[str, Any]] = [
            {
                "date": row["date"],
                "prediction_count": int(row["prediction_count"]),
                "avg_pd": float(row["avg_pd"]),
                "high_risk_rate": float(row["high_risk_rate"]),
            }
            for row in trend_rows
        ]

        return {
            "total_predictions": int(total),
            "last_prediction_at": last_prediction_at,
            "trends": trends,
        }

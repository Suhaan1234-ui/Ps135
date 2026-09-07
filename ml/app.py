"""Small command-line demo for checking the PS135 ML engine."""

from __future__ import annotations

import json
import os
from pathlib import Path

try:
    from ml.engine import analyze_employment, analyze_skill_gap, get_engine_status, predict_retention
except ModuleNotFoundError:
    from engine import analyze_employment, analyze_skill_gap, get_engine_status, predict_retention


def main() -> None:
    """Run safe smoke checks without inventing employee feature values."""
    status = get_engine_status()
    print("ENGINE STATUS")
    print(json.dumps(status, indent=2, default=str))

    if status.get("status") != "healthy":
        return

    print("\nSKILL GAP DEMO")
    skill_result = analyze_skill_gap(["Python", "SQL", "Excel"], "Data Analyst")
    print(json.dumps(skill_result, indent=2, default=str))

    print("\nEMPLOYMENT ANALYTICS DEMO")
    employment_result = analyze_employment()
    print(json.dumps(employment_result, indent=2, default=str))

    if os.getenv("PS135_DEMO_RETENTION", "0").lower() in {"1", "true", "yes"}:
        import pandas as pd

        project_root = Path(__file__).resolve().parents[1]
        data_path = project_root / "ml" / "data" / "Emp_attrition_csv.csv"
        row = pd.read_csv(data_path).drop(columns=["Employee ID", "Attrition"]).iloc[0].to_dict()
        print("\nRETENTION DEMO (REAL DATASET ROW)")
        print(json.dumps(predict_retention(row), indent=2, default=str))
    else:
        print("\nRetention artifact loaded successfully; prediction demo is disabled by default.")


if __name__ == "__main__":
    main()

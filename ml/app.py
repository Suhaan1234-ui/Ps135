"""Small command-line demo for checking the PS135 ML engine."""

from __future__ import annotations

import json

try:
    from ml.engine import analyze_employment, analyze_skill_gap, get_engine_status
except ModuleNotFoundError:
    from engine import analyze_employment, analyze_skill_gap, get_engine_status


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

    print("\nRetention artifact loaded successfully; no employee prediction was run without real input data.")


if __name__ == "__main__":
    main()

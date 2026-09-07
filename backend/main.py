"""Thin FastAPI adapter between the frontend and the PS135 ML engine."""

from __future__ import annotations

import logging
import os
import sys
from pathlib import Path
from typing import Any, Callable

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

try:
	from ml.engine import (
		ArtifactLoadError,
		analyze_employment,
		analyze_skill_gap,
		get_engine_status,
		predict_retention,
	)
except ModuleNotFoundError as error:
	if error.name != "ml":
		raise
	sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
	from ml.engine import (  # type: ignore[no-redef]
		ArtifactLoadError,
		analyze_employment,
		analyze_skill_gap,
		get_engine_status,
		predict_retention,
	)

try:
	from .schemas import EmploymentRequest, RetentionRequest, SkillGapRequest
except ImportError:
	from schemas import EmploymentRequest, RetentionRequest, SkillGapRequest  # type: ignore[no-redef]

logger = logging.getLogger(__name__)

app = FastAPI(
	title="PS135 ML API",
	description=(
		"Backend API connecting the PS135 frontend with employment analytics, "
		"skill gap analysis and retention prediction engines."
	),
	version="1.0.0",
)

cors_origins = [
	origin.strip()
	for origin in os.getenv(
		"PS135_CORS_ORIGINS",
		"http://localhost:3000,http://localhost:5173",
	).split(",")
	if origin.strip()
]
app.add_middleware(
	CORSMiddleware,
	allow_origins=cors_origins,
	allow_credentials=True,
	allow_methods=["*"] ,
	allow_headers=["*"],
)


def _call_engine(function: Callable[..., Any], *args: Any, **kwargs: Any) -> Any:
	"""Call an ML function and expose only client-safe error messages."""
	try:
		return function(*args, **kwargs)
	except ArtifactLoadError as error:
		raise HTTPException(status_code=500, detail="ML engine is currently unavailable") from error
	except (ValueError, TypeError) as error:
		raise HTTPException(status_code=422, detail=str(error)) from error
	except Exception as error:
		logger.exception("ML engine request failed")
		raise HTTPException(status_code=500, detail="ML engine request failed") from error


@app.get("/", summary="Check that the PS135 ML API is running")
def root() -> dict[str, str]:
	"""Return a basic liveness response."""
	return {"message": "PS135 ML API is running"}


@app.get("/health", summary="Check ML engine health")
def health() -> dict[str, Any]:
	"""Return the actual status of the configured ML artifacts."""
	return _call_engine(get_engine_status)


@app.post("/api/skill-gap", summary="Analyze candidate skills against a target job")
def skill_gap(request: SkillGapRequest) -> dict[str, Any]:
	"""Forward a skill-gap request to the ML engine."""
	return _call_engine(
		analyze_skill_gap,
		candidate_skills=request.candidate_skills,
		target_job=request.target_job,
	)


@app.post("/api/retention", summary="Predict employee attrition risk")
def retention(request: RetentionRequest) -> dict[str, Any]:
	"""Forward raw employee data to the retention engine."""
	result = _call_engine(predict_retention, request.employee_data)
	return {"success": True, "data": result}


@app.post("/api/employment", summary="Analyze employment and skilling outcomes")
def employment(request: EmploymentRequest) -> dict[str, Any]:
	"""Forward optional filters to the employment analytics engine."""
	result = _call_engine(analyze_employment, filters=request.filters)
	return {"success": True, "data": result}


if __name__ == "__main__":
	import uvicorn

	uvicorn.run(app, host="127.0.0.1", port=8000)

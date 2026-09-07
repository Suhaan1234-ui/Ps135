"""Request schemas for the PS135 backend ML endpoints."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class SkillGapRequest(BaseModel):
	"""Candidate skills and the target job for skill-gap analysis."""

	candidate_skills: List[str] = Field(
		min_length=1,
		description="Candidate skills to compare with the target job requirements.",
		examples=[["Python", "Machine Learning", "SQL"]],
	)
	target_job: str = Field(
		min_length=1,
		description="Target job title used by the ML skill-gap engine.",
		examples=["Data Scientist"],
	)


class RetentionRequest(BaseModel):
	"""Flexible employee payload forwarded to the retention engine."""

	employee_data: Dict[str, Any] = Field(
		description="Raw employee data. The ML engine validates required feature fields.",
		examples=[{"Age": 30, "Gender": "Male"}],
	)


class EmploymentRequest(BaseModel):
	"""Optional filters forwarded to the employment analytics engine."""

	filters: Optional[Dict[str, Any]] = Field(
		default=None,
		description="Optional analytics filters controlled by the ML engine.",
		examples=[{"Scheme": "PMKVY"}],
	)

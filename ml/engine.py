"""Cached inference and analytics services for the ML artifacts."""

from __future__ import annotations

import logging
import re
import unicodedata
from datetime import date, datetime
from functools import lru_cache
from pathlib import Path
from typing import Any, Mapping

import joblib
import numpy as np
import pandas as pd
from rapidfuzz import fuzz, process

logger = logging.getLogger(__name__)

_MODEL_DIR = Path(__file__).resolve().parent / "models"
_ARTIFACT_FILES = {
	"employment": "employment_model.joblib",
	"skill_gap": "skill_gap_model.joblib",
	"retention": "retention_model.joblib",
}
_REQUIRED_KEYS = {
	"employment": {
		"artifact_type", "version", "measure_columns", "quality_summary",
		"anomaly_report", "descriptive_totals", "rate_policy", "grouped_summaries",
	},
	"skill_gap": {
		"artifact_type", "version", "requirements_by_title", "title_to_display",
		"title_skill_profiles", "skill_frequency_data", "core_skills_by_title",
		"optional_skills_by_title", "rare_skills_by_title", "aliases",
		"fuzzy_threshold", "semantic_threshold", "semantic_model_name",
		"matching_order", "one_to_one_matching", "output_schema",
	},
	"retention": {
		"artifact_type", "version", "pipeline", "feature_columns", "class_mapping",
		"model_classes", "risk_thresholds",
	},
}


class ArtifactLoadError(RuntimeError):
	"""Raised when a required artifact cannot be loaded or validated."""


def _json_safe(value: Any) -> Any:
	"""Convert numpy, pandas, and non-finite values into JSON-safe values."""
	if isinstance(value, Mapping):
		return {str(key): _json_safe(item) for key, item in value.items()}
	if isinstance(value, (list, tuple, set)):
		return [_json_safe(item) for item in value]
	if isinstance(value, np.ndarray):
		return [_json_safe(item) for item in value.tolist()]
	if value is pd.NaT:
		return None
	if isinstance(value, (pd.Timestamp, datetime, date)):
		if isinstance(value, pd.Timestamp) and value is pd.NaT:
			return None
		return value.isoformat()
	if isinstance(value, (np.integer,)):
		return int(value)
	if isinstance(value, (np.floating, float)):
		return float(value) if np.isfinite(value) else None
	if isinstance(value, np.bool_):
		return bool(value)
	if value is None:
		return None
	try:
		missing = pd.isna(value)
	except (TypeError, ValueError):
		missing = False
	if isinstance(missing, (bool, np.bool_)) and missing:
		return None
	return value


def _load_artifact(name: str) -> dict[str, Any]:
	filename = _ARTIFACT_FILES[name]
	path = _MODEL_DIR / filename
	if not path.exists():
		raise ArtifactLoadError(f"Missing {name} artifact: {path}")
	try:
		artifact = joblib.load(path)
	except Exception as error:
		logger.exception("Unable to load %s artifact", name)
		raise ArtifactLoadError(f"Unable to load {name} artifact: {path}") from error
	if not isinstance(artifact, dict):
		raise ArtifactLoadError(f"Invalid {name} artifact: expected a dictionary")
	missing = _REQUIRED_KEYS[name] - set(artifact)
	if missing:
		raise ArtifactLoadError(
			f"Invalid {name} artifact: missing keys {sorted(missing)}"
		)
	if name == "retention":
		pipeline = artifact["pipeline"]
		if not callable(getattr(pipeline, "predict", None)) or not callable(getattr(pipeline, "predict_proba", None)):
			raise ArtifactLoadError("Invalid retention artifact: pipeline must support predict and predict_proba")
		if not isinstance(artifact["feature_columns"], list) or not isinstance(artifact["class_mapping"], dict) or not isinstance(artifact["risk_thresholds"], dict):
			raise ArtifactLoadError("Invalid retention artifact: malformed feature, class, or threshold configuration")
	elif name == "skill_gap":
		if not isinstance(artifact["requirements_by_title"], dict) or not isinstance(artifact["aliases"], dict):
			raise ArtifactLoadError("Invalid skill-gap artifact: malformed requirements or aliases")
		if not isinstance(artifact["fuzzy_threshold"], (int, float)) or not isinstance(artifact["semantic_threshold"], (int, float)):
			raise ArtifactLoadError("Invalid skill-gap artifact: malformed matching thresholds")
	elif name == "employment":
		for key in ("metric_definitions", "grouped_summaries", "quality_summary"):
			if not isinstance(artifact[key], dict):
				raise ArtifactLoadError(f"Invalid employment artifact: malformed {key}")
	if name == "retention":
		_patch_saved_imputers_for_runtime(artifact["pipeline"])
	return artifact


def _patch_saved_imputers_for_runtime(pipeline: Any) -> None:
	"""Bridge the saved sklearn 1.7 imputer state to sklearn 1.9 in memory.

	The artifact remains unchanged. Newer sklearn versions renamed the internal
	imputer attribute used during transform, while the fitted value is already
	present in the serialized estimator.
	"""
	preprocessor = getattr(pipeline, "named_steps", {}).get("preprocessor")
	for _, transformer, _ in getattr(preprocessor, "transformers_", []):
		for step in getattr(transformer, "named_steps", {}).values():
			if type(step).__name__ == "SimpleImputer" and hasattr(step, "_fit_dtype") and not hasattr(step, "_fill_dtype"):
				step._fill_dtype = step._fit_dtype


@lru_cache(maxsize=1)
def _artifacts() -> dict[str, dict[str, Any]]:
	"""Load and validate all artifacts once per process."""
	return {name: _load_artifact(name) for name in _ARTIFACT_FILES}


@lru_cache(maxsize=1)
def _semantic_model() -> Any:
	"""Load the optional skill transformer at most once, returning None on failure."""
	artifact = _artifacts()["skill_gap"]
	try:
		from sentence_transformers import SentenceTransformer

		return SentenceTransformer(artifact["semantic_model_name"])
	except Exception as error:
		logger.warning("Semantic skill matching unavailable: %s", type(error).__name__)
		return None


def _normalize_text(value: Any) -> str:
	text = "" if value is None else str(value)
	text = text.replace("â€™", "'").replace("â€“", "-")
	return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", text).lower()).strip()


def _normalize_skill(value: Any) -> str:
	return re.sub(r"[^a-z0-9+#.]+", " ", _normalize_text(value)).strip()


def _skill_list(values: Any, aliases: Mapping[str, str]) -> list[str]:
	if isinstance(values, str):
		values = re.split(r"[,;|/]+", values)
	normalized = []
	for value in values or []:
		skill = aliases.get(_normalize_skill(value), _normalize_skill(value))
		if skill:
			normalized.append(skill)
	return sorted(set(normalized))


def _match_skills(
	candidate_skills: Any,
	required_skills: list[str],
	aliases: Mapping[str, str],
	fuzzy_threshold: float,
	semantic_threshold: float,
) -> tuple[list[str], list[str], dict[str, dict[str, Any]]]:
	candidates = _skill_list(candidate_skills, aliases)
	required = _skill_list(required_skills, aliases)
	matched: dict[str, dict[str, Any]] = {}
	unused = set(candidates)

	for requirement in required:
		if requirement in unused:
			matched[requirement] = {"candidate": requirement, "method": "exact", "score": 100.0}
			unused.remove(requirement)

	for requirement in required:
		if requirement in matched or not unused:
			continue
		best = process.extractOne(requirement, sorted(unused), scorer=fuzz.token_set_ratio)
		if best and best[1] >= fuzzy_threshold:
			matched[requirement] = {"candidate": best[0], "method": "fuzzy", "score": float(best[1])}
			unused.remove(best[0])

	model = _semantic_model() if unused else None
	if model is not None:
		remaining = [skill for skill in required if skill not in matched]
		candidates_left = sorted(unused)
		if remaining and candidates_left:
			required_vectors = model.encode(remaining, normalize_embeddings=True)
			candidate_vectors = model.encode(candidates_left, normalize_embeddings=True)
			scores = required_vectors @ candidate_vectors.T
			pairs = sorted(
				(
					float(scores[required_index, candidate_index]),
					requirement,
					candidates_left[candidate_index],
				)
				for required_index, requirement in enumerate(remaining)
				for candidate_index in range(len(candidates_left))
			)
			used_requirements: set[str] = set(matched)
			used_candidates: set[str] = set()
			for score, requirement, candidate in sorted(
				pairs, key=lambda item: (-item[0], item[1], item[2])
			):
				if score < semantic_threshold or requirement in used_requirements or candidate in used_candidates:
					continue
				matched[requirement] = {"candidate": candidate, "method": "semantic", "score": score}
				used_requirements.add(requirement)
				used_candidates.add(candidate)

	matched_list = [skill for skill in required if skill in matched]
	missing_list = [skill for skill in required if skill not in matched]
	return matched_list, missing_list, matched


def predict_retention(employee_data: Mapping[str, Any] | pd.DataFrame) -> dict[str, Any]:
	"""Predict attrition using the fitted retention pipeline from the artifact."""
	artifact = _artifacts()["retention"]
	features = list(artifact["feature_columns"])
	frame = pd.DataFrame([dict(employee_data)]) if isinstance(employee_data, Mapping) else employee_data.copy()
	if not isinstance(frame, pd.DataFrame):
		raise TypeError("employee_data must be a dictionary or pandas DataFrame")
	missing = [column for column in features if column not in frame.columns]
	if missing:
		raise ValueError(f"Missing required retention features: {missing}")
	frame = frame[features]
	pipeline = artifact["pipeline"]
	prediction = pipeline.predict(frame)
	probabilities = pipeline.predict_proba(frame)[0]
	classes = list(pipeline.named_steps["model"].classes_)
	left_label = artifact["class_mapping"].get("Left", 1)
	if left_label not in classes:
		raise RuntimeError("Retention model does not contain the configured Left class")
	attrition_probability = float(probabilities[classes.index(left_label)])
	thresholds = artifact["risk_thresholds"]
	low_max = float(thresholds.get("low_max", 0.30))
	medium_max = float(thresholds.get("medium_max", 0.60))
	risk_level = "Low" if attrition_probability < low_max else "Medium" if attrition_probability < medium_max else "High"
	return _json_safe({
		"attrition_prediction": int(prediction[0]),
		"attrition_probability": attrition_probability,
		"retention_probability": 1.0 - attrition_probability,
		"risk_level": risk_level,
	})


def analyze_skill_gap(candidate_skills: Any, target_job: str) -> dict[str, Any]:
	"""Compare candidate skills with the saved core, optional, and rare requirements."""
	artifact = _artifacts()["skill_gap"]
	aliases = artifact["aliases"]
	normalized_candidates = _skill_list(candidate_skills, aliases)
	title = _normalize_text(target_job)
	profiles = artifact["title_skill_profiles"]
	if title not in profiles:
		return _json_safe({
			"target_job": target_job, "candidate_skills": normalized_candidates, "job_found": False, "core_skills": [], "optional_skills": [],
			"matched_skills": [], "matched_core_skills": [], "missing_skills": [],
			"missing_core_skills": [], "skill_match_percentage": 0.0,
			"core_skill_match_percentage": 0.0, "recommended_skills": [],
			"matching_summary": {"matched_count": 0, "missing_count": 0, "core_matched_count": 0},
		})
	core = list(artifact["core_skills_by_title"].get(title, []))
	optional = list(artifact["optional_skills_by_title"].get(title, []))
	rare = list(artifact["rare_skills_by_title"].get(title, []))
	required = core + optional + rare
	matched, missing, details = _match_skills(
		candidate_skills, required, aliases, artifact["fuzzy_threshold"], artifact["semantic_threshold"]
	)
	matched_set = set(matched)
	missing_core = [skill for skill in core if skill not in matched_set]
	missing_optional = [skill for skill in optional if skill not in matched_set]
	semantic_available = _semantic_model() is not None
	method_counts = {}
	for detail in details.values():
		method = detail["method"]
		method_counts[method] = method_counts.get(method, 0) + 1
	return _json_safe({
		"target_job": artifact["title_to_display"].get(title, target_job),
		"candidate_skills": normalized_candidates,
		"job_found": True,
		"core_skills": core,
		"optional_skills": optional,
		"matched_skills": matched,
		"matched_core_skills": [skill for skill in core if skill in matched_set],
		"missing_skills": missing,
		"missing_core_skills": missing_core,
		"skill_match_percentage": round(100 * len(matched) / len(required), 2) if required else 0.0,
		"core_skill_match_percentage": round(100 * len(matched_set & set(core)) / len(core), 2) if core else 100.0,
		"recommended_skills": missing_core + missing_optional,
		"match_details": details,
		"matching_summary": {
			"matched_count": len(matched),
			"missing_count": len(missing),
			"core_matched_count": len(matched_set & set(core)),
			"methods": method_counts,
		},
		"semantic_matching_available": semantic_available,
		"semantic_matching_status": "available" if semantic_available else "unavailable",
	})


def analyze_employment(filters: Mapping[str, Any] | None = None) -> dict[str, Any]:
	"""Return filtered PMKVY analytics and a separate data-quality anomaly report."""
	artifact = _artifacts()["employment"]
	filters = filters or {}
	field_map = {"state": "TCState", "district": "TCDistrict", "scheme": "Scheme", "component": "Component", "training_type": "TrainingType"}
	unknown_filters = sorted(set(filters) - set(field_map))
	if unknown_filters:
		raise ValueError(f"Unsupported employment filters: {unknown_filters}")
	if len(filters) > 1:
		raise ValueError("The saved employment summaries support one grouping filter at a time")
	grouping_name = "state"
	if filters:
		grouping_name = {"state": "state", "scheme": "scheme", "component": "component", "training_type": "training_type"}.get(next(iter(filters)))
		if grouping_name is None:
			raise ValueError("The saved employment artifact has no district-level summary")
	records = [
		record for record in artifact["grouped_summaries"].get(grouping_name, [])
		if all(record.get(field_map[key]) == value for key, value in filters.items())
	]
	measure_columns = artifact["measure_columns"]
	totals = {column: sum((record.get(column) or 0) for record in records) for column in measure_columns}
	numerator_names = {"training": "training_numerator", "assessment": "assessment_numerator", "certification": "certification_numerator", "placement": "placement_numerator"}
	denominator_names = {"training": "training_denominator", "assessment": "assessment_denominator", "certification": "certification_denominator", "placement": "placement_denominator"}
	rates = {}
	for stage in numerator_names:
		numerator = sum((record.get(numerator_names[stage]) or 0) for record in records)
		denominator = sum((record.get(denominator_names[stage]) or 0) for record in records)
		rates[f"{stage}_rate"] = round(numerator / denominator, 6) if denominator else None
	for metric_name in ("pipeline_dropoff_rate", "program_effectiveness_score"):
		available_values = [record.get(metric_name) for record in records if record.get(metric_name) is not None]
		if available_values:
			rates[metric_name] = sum(available_values) / len(available_values)
	anomaly_report = [
		row for row in artifact["anomaly_report"]
		if all(row.get(field_map[key]) == filter_value for key, filter_value in filters.items())
	]
	return _json_safe({"filters": dict(filters), "summary_group": grouping_name, "counts": totals, "rates": rates, "records": records, "anomalies": anomaly_report, "quality_summary": artifact["quality_summary"], "modeling_decision": artifact["modeling_decision"]})


def get_engine_status() -> dict[str, Any]:
	"""Load all artifacts and return a concise health report."""
	try:
		artifacts = _artifacts()
		return {"status": "healthy", "employment_engine_loaded": True, "skill_gap_engine_loaded": True, "retention_engine_loaded": True, "artifacts": {name: {"artifact_type": value["artifact_type"], "version": value["version"]} for name, value in artifacts.items()}}
	except ArtifactLoadError as error:
		_artifacts.cache_clear()
		return {"status": "unhealthy", "employment_engine_loaded": False, "skill_gap_engine_loaded": False, "retention_engine_loaded": False, "error": str(error)}


if __name__ == "__main__":
	print(_json_safe(get_engine_status()))

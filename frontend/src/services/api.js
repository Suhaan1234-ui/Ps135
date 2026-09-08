/**
 * Thin client for the PS135 FastAPI backend (see /backend/main.py).
 * Every endpoint here maps 1:1 to a route exposed by that service —
 * nothing here invents fields the ML engine doesn't return.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch (networkError) {
    throw new ApiError(
      `Can't reach the API at ${BASE_URL}. Is the backend running (uvicorn backend.main:app)?`,
      0,
    )
  }

  let body = null
  const text = await response.text()
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  if (!response.ok) {
    const detail = (body && body.detail) || `Request failed with status ${response.status}`
    throw new ApiError(detail, response.status)
  }

  return body
}

export function getHealth() {
  return request('/health')
}

export function getEngineRoot() {
  return request('/')
}

/**
 * filters: at most one of { state, district, scheme, component, training_type }
 * mirrors backend/main.py's employment() -> ml.engine.analyze_employment
 */
export function getEmploymentAnalytics(filters = {}) {
  return request('/api/employment', {
    method: 'POST',
    body: JSON.stringify({ filters: Object.keys(filters).length ? filters : null }),
  })
}

export function getSkillGap(candidateSkills, targetJob) {
  return request('/api/skill-gap', {
    method: 'POST',
    body: JSON.stringify({ candidate_skills: candidateSkills, target_job: targetJob }),
  })
}

export function getRetentionPrediction(employeeData) {
  return request('/api/retention', {
    method: 'POST',
    body: JSON.stringify({ employee_data: employeeData }),
  })
}

export { ApiError }

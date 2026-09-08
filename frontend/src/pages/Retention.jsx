import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import PredictionCard from '../components/PredictionCard'
import { ErrorBanner, LoadingBlock } from '../components/Loading'
import { NUMERIC_FIELDS, CATEGORICAL_FIELDS, defaultEmployeeData } from '../lib/retentionSchema'
import { getRetentionPrediction } from '../services/api'

export default function Retention() {
  const [form, setForm] = useState(defaultEmployeeData)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    const payload = { ...form }
    NUMERIC_FIELDS.forEach((field) => {
      payload[field.key] = Number(payload[field.key])
    })
    getRetentionPrediction(payload)
      .then((res) => setResult(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  return (
    <div className="section-stack">
      <PageHeader
        eyebrow="Retention risk"
        title="Predict attrition for an employee profile"
        description="Every field below is required by the trained pipeline (feature_columns in the retention artifact) — there's no partial-profile mode."
      />

      <form className="panel" onSubmit={handleSubmit}>
        <div className="panel-header">
          <span className="panel-title">Employee profile</span>
        </div>
        <div className="panel-body">
          <p className="stat-label" style={{ marginBottom: 12 }}>Numeric</p>
          <div className="grid grid-3" style={{ marginBottom: 24 }}>
            {NUMERIC_FIELDS.map((field) => (
              <div className="field" key={field.key}>
                <label className="field-label" htmlFor={field.key}>{field.label}</label>
                <input
                  id={field.key}
                  type="number"
                  className="input"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={form[field.key]}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  required
                />
              </div>
            ))}
          </div>

          <p className="stat-label" style={{ marginBottom: 12 }}>Categorical</p>
          <div className="grid grid-3">
            {CATEGORICAL_FIELDS.map((field) => (
              <div className="field" key={field.key}>
                <label className="field-label" htmlFor={field.key}>{field.label}</label>
                <select
                  id={field.key}
                  className="select"
                  value={form[field.key]}
                  onChange={(e) => updateField(field.key, e.target.value)}
                >
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: 22 }} disabled={loading}>
            {loading ? 'Predicting…' : 'Predict retention risk'}
          </button>
        </div>
      </form>

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingBlock height={180} />}
      {result && <PredictionCard result={result} />}
    </div>
  )
}

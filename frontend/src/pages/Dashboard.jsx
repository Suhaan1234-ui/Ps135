import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { LoadingBlock, ErrorBanner } from '../components/Loading'
import { PipelineFunnel, RatesBarChart } from '../components/Charts'
import { getEmploymentAnalytics } from '../services/api'

const fmt = new Intl.NumberFormat('en-IN')
const pct = (value) => (value == null ? '—' : `${(value * 100).toFixed(1)}%`)

export default function Dashboard({ health, engineStatus }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    setError(null)
    getEmploymentAnalytics()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const counts = data?.data?.counts
  const rates = data?.data?.rates

  return (
    <div className="section-stack">
      <PageHeader
        eyebrow="Programme overview"
        title="Skilling outcomes, nationwide"
        description="Aggregate PMKVY enrolment-to-placement figures, drawn from the analytics engine's state-level summaries."
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading && !data && (
        <div className="grid grid-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingBlock key={i} height={92} />
          ))}
        </div>
      )}

      {counts && (
        <div className="grid grid-4">
          <StatCard label="Enrolled" value={fmt.format(counts.Enrolled || 0)} accent="var(--ink-700)" />
          <StatCard label="Trained" value={fmt.format(counts.Trained || 0)} sub={`${pct(rates?.training_rate)} of enrolled`} accent="var(--ink-600)" />
          <StatCard label="Certified" value={fmt.format(counts.Certified || 0)} sub={`${pct(rates?.certification_rate)} of assessed`} accent="var(--marigold)" />
          <StatCard label="Reported placed" value={fmt.format(counts['Reported Placed'] || 0)} sub={`${pct(rates?.placement_rate)} of certified`} accent="var(--teal)" />
        </div>
      )}

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Training pipeline</span>
            <span className="panel-note">Enrolled → placed</span>
          </div>
          <div className="panel-body">
            {counts ? <PipelineFunnel counts={counts} /> : <LoadingBlock height={180} />}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Stage conversion rates</span>
            <span className="panel-note">National average</span>
          </div>
          <div className="panel-body">
            {rates ? <RatesBarChart rates={rates} /> : <LoadingBlock height={220} />}
          </div>
        </div>
      </div>

      <div className="grid grid-3">
        <Link to="/employment" className="panel" style={{ textDecoration: 'none', padding: 20, display: 'block' }}>
          <p className="tag tag-marigold" style={{ marginBottom: 10 }}>Employment</p>
          <h3 style={{ fontSize: 16, marginBottom: 6 }}>Analytics by state, scheme &amp; component</h3>
          <p className="muted" style={{ fontSize: 13 }}>Filter the pipeline down to one state, scheme, component or training type and review data-quality anomalies.</p>
        </Link>
        <Link to="/skill-gap" className="panel" style={{ textDecoration: 'none', padding: 20, display: 'block' }}>
          <p className="tag tag-teal" style={{ marginBottom: 10 }}>Skill gap</p>
          <h3 style={{ fontSize: 16, marginBottom: 6 }}>Compare a candidate against a target role</h3>
          <p className="muted" style={{ fontSize: 13 }}>Enter known skills and a job title to see matched, missing and recommended skills.</p>
        </Link>
        <Link to="/retention" className="panel" style={{ textDecoration: 'none', padding: 20, display: 'block' }}>
          <p className="tag tag-rust" style={{ marginBottom: 10 }}>Retention</p>
          <h3 style={{ fontSize: 16, marginBottom: 6 }}>Predict attrition risk</h3>
          <p className="muted" style={{ fontSize: 13 }}>Fill in an employee profile to get a risk tier and attrition probability.</p>
        </Link>
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">ML engine status</span>
          <span className={`status-dot ${engineStatus}`} aria-hidden="true" />
        </div>
        <div className="panel-body">
          {health ? (
            <div className="grid grid-3">
              {Object.entries(health.artifacts || {}).map(([name, meta]) => (
                <div key={name}>
                  <div className="stat-label" style={{ textTransform: 'capitalize' }}>{name.replace('_', ' ')}</div>
                  <div className="mono" style={{ fontSize: 13, marginTop: 4 }}>
                    {meta.artifact_type} · v{meta.version}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted" style={{ fontSize: 13 }}>
              {engineStatus === 'unhealthy'
                ? 'Backend not reachable — start it with uvicorn from /backend, or check VITE_API_BASE_URL.'
                : 'Checking artifact status…'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

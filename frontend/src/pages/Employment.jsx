import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { LoadingBlock, ErrorBanner } from '../components/Loading'
import { PipelineFunnel, RatesBarChart } from '../components/Charts'
import { FILTER_GROUPS } from '../lib/employmentFilters'
import { getEmploymentAnalytics } from '../services/api'

const fmt = new Intl.NumberFormat('en-IN')
const pct = (value) => (value == null ? '—' : `${(value * 100).toFixed(1)}%`)

const GROUP_FIELD_LABEL = {
  scheme: 'Scheme',
  component: 'Component',
  training_type: 'TrainingType',
  state: 'TCState',
}

export default function Employment() {
  const [groupKey, setGroupKey] = useState(null) // null = no filter (defaults to state grouping)
  const [value, setValue] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const activeGroup = FILTER_GROUPS.find((g) => g.key === groupKey)

  const load = (filters) => {
    setLoading(true)
    setError(null)
    getEmploymentAnalytics(filters)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load({})
  }, [])

  function selectGroup(key) {
    if (key === groupKey) {
      setGroupKey(null)
      setValue('')
      load({})
      return
    }
    const group = FILTER_GROUPS.find((g) => g.key === key)
    const firstValue = group.options[0]
    setGroupKey(key)
    setValue(firstValue)
    load({ [key]: firstValue })
  }

  function selectValue(v) {
    setValue(v)
    load({ [groupKey]: v })
  }

  const counts = data?.data?.counts
  const rates = data?.data?.rates
  const records = data?.data?.records || []
  const anomalies = data?.data?.anomalies || []
  const quality = data?.data?.quality_summary
  const summaryGroup = data?.data?.summary_group
  const recordLabel = summaryGroup ? GROUP_FIELD_LABEL[summaryGroup] || summaryGroup : null

  return (
    <div className="section-stack">
      <PageHeader
        eyebrow="Employment analytics"
        title="Enrolment-to-placement pipeline"
        description="Filter to a single scheme, component, training type or state — the engine only supports one grouping dimension at a time."
      />

      <div className="panel">
        <div className="panel-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className={`btn btn-ghost${groupKey === null ? ' active' : ''}`}
            onClick={() => selectGroup(null)}
          >
            All records
          </button>
          {FILTER_GROUPS.map((group) => (
            <button
              key={group.key}
              type="button"
              className={`btn btn-ghost${groupKey === group.key ? ' active' : ''}`}
              onClick={() => selectGroup(group.key)}
            >
              {group.label}
            </button>
          ))}

          {activeGroup && (
            <select
              className="select"
              style={{ width: 'auto', minWidth: 200, marginLeft: 4 }}
              value={value}
              onChange={(e) => selectValue(e.target.value)}
            >
              {activeGroup.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={() => load(groupKey ? { [groupKey]: value } : {})} />}

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
          <StatCard label="Trained" value={fmt.format(counts.Trained || 0)} sub={`${pct(rates?.training_rate)} completion`} accent="var(--ink-600)" />
          <StatCard label="Certified" value={fmt.format(counts.Certified || 0)} sub={`${pct(rates?.certification_rate)} of assessed`} accent="var(--marigold)" />
          <StatCard label="Reported placed" value={fmt.format(counts['Reported Placed'] || 0)} sub={`${pct(rates?.placement_rate)} of certified`} accent="var(--teal)" />
        </div>
      )}

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Training pipeline</span>
          </div>
          <div className="panel-body">
            {counts ? <PipelineFunnel counts={counts} /> : <LoadingBlock height={180} />}
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Stage conversion rates</span>
          </div>
          <div className="panel-body">
            {rates ? <RatesBarChart rates={rates} /> : <LoadingBlock height={220} />}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">
            Records{recordLabel ? ` by ${recordLabel}` : ''}
          </span>
          <span className="panel-note">{records.length} rows</span>
        </div>
        <div className="panel-body panel-body--tight" style={{ overflowX: 'auto' }}>
          {records.length ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>{recordLabel || 'Group'}</th>
                  <th className="num">Enrolled</th>
                  <th className="num">Trained</th>
                  <th className="num">Assessed</th>
                  <th className="num">Certified</th>
                  <th className="num">Placed</th>
                  <th className="num">Placement rate</th>
                </tr>
              </thead>
              <tbody>
                {records.map((row, i) => (
                  <tr key={i}>
                    <td>{row[recordLabel] ?? '—'}</td>
                    <td className="num">{fmt.format(row.Enrolled || 0)}</td>
                    <td className="num">{fmt.format(row.Trained || 0)}</td>
                    <td className="num">{fmt.format(row.Assessed || 0)}</td>
                    <td className="num">{fmt.format(row.Certified || 0)}</td>
                    <td className="num">{fmt.format(row['Reported Placed'] || 0)}</td>
                    <td className="num">{pct(row.placement_rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">No records for this filter.</div>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Data quality summary</span>
          </div>
          <div className="panel-body">
            {quality ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(quality).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span className="muted" style={{ textTransform: 'capitalize' }}>{key.replaceAll('_', ' ')}</span>
                    <span className="mono">{fmt.format(val)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <LoadingBlock height={120} />
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Anomalies</span>
            <span className="panel-note">{anomalies.length} flagged rows</span>
          </div>
          <div className="panel-body">
            {anomalies.length ? (
              <p className="muted" style={{ fontSize: 13 }}>
                {anomalies.length} rows in this slice fail a pipeline-ordering check (e.g. placed exceeding
                certified) and were excluded from the rate calculations above, per the engine's rate policy.
              </p>
            ) : (
              <p className="muted" style={{ fontSize: 13 }}>No anomalies flagged for this filter.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { RiskGauge } from './Charts'

const RISK_COPY = {
  Low: 'This profile looks stable. No immediate retention action indicated.',
  Medium: 'Some attrition signals present. Worth a check-in with the employee’s manager.',
  High: 'Strong attrition signals. Consider a retention conversation soon.',
}

const RISK_TAG_CLASS = {
  Low: 'tag-teal',
  Medium: 'tag-marigold',
  High: 'tag-rust',
}

export default function PredictionCard({ result }) {
  if (!result) return null
  const { risk_level: riskLevel, attrition_probability: probability, retention_probability: retentionProbability } = result

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Prediction</span>
        <span className={`tag ${RISK_TAG_CLASS[riskLevel] || ''}`}>{riskLevel} risk</span>
      </div>
      <div className="panel-body" style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center' }}>
        <RiskGauge probability={probability} riskLevel={riskLevel} />
        <div style={{ flex: 1, minWidth: 220 }}>
          <p style={{ fontSize: 14, marginBottom: 14 }}>{RISK_COPY[riskLevel] || 'Prediction complete.'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Row label="Attrition probability" value={`${(probability * 100).toFixed(1)}%`} />
            <Row label="Retention probability" value={`${(retentionProbability * 100).toFixed(1)}%`} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--paper-line)', paddingBottom: 8 }}>
      <span className="muted">{label}</span>
      <span className="mono">{value}</span>
    </div>
  )
}

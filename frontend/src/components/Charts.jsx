import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PIPELINE_STAGES } from '../lib/employmentFilters'

const fmt = new Intl.NumberFormat('en-IN')
const pct = (value) => (value == null ? '—' : `${(value * 100).toFixed(1)}%`)

/** Horizontal step-down bars showing the enrol → place pipeline with drop-off between stages. */
export function PipelineFunnel({ counts }) {
  const stages = PIPELINE_STAGES.map((stage) => ({ ...stage, value: counts?.[stage.key] || 0 }))
  const max = Math.max(1, ...stages.map((s) => s.value))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {stages.map((stage, i) => {
        const prev = i > 0 ? stages[i - 1].value : null
        const dropoff = prev ? 1 - stage.value / (prev || 1) : null
        const widthPct = Math.max(2, (stage.value / max) * 100)
        return (
          <div key={stage.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
              <span style={{ fontWeight: 500 }}>{stage.label}</span>
              <span className="mono muted">
                {fmt.format(stage.value)}
                {dropoff !== null && dropoff > 0 && (
                  <span style={{ color: 'var(--rust-dark)', marginLeft: 8 }}>−{pct(dropoff)}</span>
                )}
              </span>
            </div>
            <div style={{ background: 'var(--paper-line)', height: 10, borderRadius: 2 }}>
              <div
                style={{
                  width: `${widthPct}%`,
                  height: '100%',
                  borderRadius: 2,
                  background: i === stages.length - 1 ? 'var(--teal)' : 'var(--ink-700)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

const RATE_COLORS = {
  'Training': 'var(--ink-700)',
  'Assessment': 'var(--ink-600)',
  'Certification': 'var(--marigold)',
  'Placement': 'var(--teal)',
}

/** Vertical comparison bars for the four conversion rates the engine returns. */
export function RatesBarChart({ rates }) {
  const data = [
    { name: 'Training', value: rates?.training_rate },
    { name: 'Assessment', value: rates?.assessment_rate },
    { name: 'Certification', value: rates?.certification_rate },
    { name: 'Placement', value: rates?.placement_rate },
  ].map((d) => ({ ...d, pctValue: d.value == null ? 0 : Math.round(d.value * 1000) / 10 }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--paper-line)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans', fill: 'var(--text-muted)' }}
          axisLine={{ stroke: 'var(--paper-line)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono', fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
          unit="%"
          width={38}
        />
        <Tooltip
          cursor={{ fill: 'rgba(18,27,48,0.04)' }}
          formatter={(value) => [`${value}%`, 'Rate']}
          contentStyle={{
            fontFamily: 'IBM Plex Sans',
            fontSize: 12.5,
            border: '1px solid var(--paper-line)',
            borderRadius: 4,
          }}
        />
        <Bar dataKey="pctValue" radius={[3, 3, 0, 0]} maxBarSize={56}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={RATE_COLORS[entry.name]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/** Compact arc gauge used for the retention attrition probability. */
export function RiskGauge({ probability, riskLevel }) {
  const clamped = Math.max(0, Math.min(1, probability ?? 0))
  const size = 168
  const stroke = 14
  const r = (size - stroke) / 2
  const circumference = Math.PI * r // half circle
  const offset = circumference * (1 - clamped)

  const color =
    riskLevel === 'High' ? 'var(--rust)' : riskLevel === 'Medium' ? 'var(--marigold)' : 'var(--teal)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size / 2 + stroke} viewBox={`0 0 ${size} ${size / 2 + stroke}`}>
        <path
          d={`M ${stroke / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${size / 2}`}
          fill="none"
          stroke="var(--paper-line)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M ${stroke / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div style={{ marginTop: -8, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600 }}>
          {(clamped * 100).toFixed(1)}%
        </div>
        <div className="mono muted" style={{ fontSize: 11.5 }}>
          attrition probability
        </div>
      </div>
    </div>
  )
}

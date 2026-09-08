import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { ErrorBanner, LoadingBlock } from '../components/Loading'
import { JOB_TITLES, COMMON_SKILLS } from '../lib/jobTitles'
import { getSkillGap } from '../services/api'

function SkillChipInput({ skills, onChange }) {
  const [draft, setDraft] = useState('')

  function commit(raw) {
    const value = raw.trim()
    if (!value) return
    if (!skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      onChange([...skills, value])
    }
    setDraft('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit(draft)
    } else if (e.key === 'Backspace' && !draft && skills.length) {
      onChange(skills.slice(0, -1))
    }
  }

  return (
    <div>
      <div className="chip-field">
        {skills.map((skill) => (
          <span className="chip" key={skill}>
            {skill}
            <button
              type="button"
              className="chip-remove"
              aria-label={`Remove ${skill}`}
              onClick={() => onChange(skills.filter((s) => s !== skill))}
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="chip-input"
          value={draft}
          placeholder={skills.length ? '' : 'Type a skill and press Enter…'}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => commit(draft)}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
        {COMMON_SKILLS.filter((s) => !skills.includes(s)).slice(0, 8).map((s) => (
          <button
            key={s}
            type="button"
            className="tag"
            style={{ cursor: 'pointer' }}
            onClick={() => onChange([...skills, s])}
          >
            + {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function SkillPillList({ skills, tone }) {
  if (!skills?.length) return <p className="muted" style={{ fontSize: 13 }}>None</p>
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {skills.map((skill) => (
        <span key={skill} className={`tag ${tone}`}>
          {skill}
        </span>
      ))}
    </div>
  )
}

export default function SkillGap() {
  const [skills, setSkills] = useState(['Communication Skills', 'Excel'])
  const [targetJob, setTargetJob] = useState('Data Analyst')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!skills.length || !targetJob.trim()) return
    setLoading(true)
    setError(null)
    getSkillGap(skills, targetJob.trim())
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  return (
    <div className="section-stack">
      <PageHeader
        eyebrow="Skill gap analysis"
        title="Compare a candidate against a role"
        description="Skills are matched exactly, then by fuzzy text similarity, then semantically — see the method breakdown in the result."
      />

      <form className="panel" onSubmit={handleSubmit}>
        <div className="panel-body">
          <div className="grid grid-2">
            <div className="field">
              <label className="field-label" htmlFor="skills">Candidate skills</label>
              <SkillChipInput skills={skills} onChange={setSkills} />
              <span className="field-hint">Add each skill, then press Enter or comma.</span>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="target-job">Target job title</label>
              <input
                id="target-job"
                className="input"
                list="job-titles"
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                placeholder="e.g. Data Analyst"
              />
              <datalist id="job-titles">
                {JOB_TITLES.map((title) => (
                  <option key={title} value={title} />
                ))}
              </datalist>
              <span className="field-hint">{JOB_TITLES.length} roles known to the model.</span>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 18 }} disabled={loading || !skills.length || !targetJob.trim()}>
            {loading ? 'Analyzing…' : 'Analyze skill gap'}
          </button>
        </div>
      </form>

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingBlock height={200} />}

      {result && !result.job_found && (
        <div className="error-banner">
          <span aria-hidden="true">⚠</span>
          <div>“{targetJob}” isn’t a role the skill-gap model recognises. Pick one from the suggestions list.</div>
        </div>
      )}

      {result && result.job_found && (
        <>
          <div className="grid grid-2">
            <StatBlock label="Overall skill match" value={result.skill_match_percentage} sub={`${result.matching_summary?.matched_count ?? 0} of ${(result.matched_skills?.length || 0) + (result.missing_skills?.length || 0)} required skills`} accent="var(--marigold)" />
            <StatBlock label="Core skill match" value={result.core_skill_match_percentage} sub={`${result.matching_summary?.core_matched_count ?? 0} of ${result.core_skills?.length ?? 0} core skills`} accent="var(--teal)" />
          </div>

          <div className="grid grid-2">
            <div className="panel">
              <div className="panel-header"><span className="panel-title">Matched skills</span></div>
              <div className="panel-body"><SkillPillList skills={result.matched_skills} tone="tag-teal" /></div>
            </div>
            <div className="panel">
              <div className="panel-header"><span className="panel-title">Missing skills</span></div>
              <div className="panel-body"><SkillPillList skills={result.missing_skills} tone="tag-rust" /></div>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="panel">
              <div className="panel-header"><span className="panel-title">Core requirements — {result.target_job}</span></div>
              <div className="panel-body"><SkillPillList skills={result.core_skills} /></div>
            </div>
            <div className="panel">
              <div className="panel-header"><span className="panel-title">Recommended next skills</span></div>
              <div className="panel-body"><SkillPillList skills={result.recommended_skills} tone="tag-marigold" /></div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Matching method breakdown</span>
              <span className="panel-note">
                Semantic matching {result.semantic_matching_available ? 'available' : 'unavailable in this deployment'}
              </span>
            </div>
            <div className="panel-body panel-body--tight" style={{ overflowX: 'auto' }}>
              {result.match_details && Object.keys(result.match_details).length ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Required skill</th>
                      <th>Matched to</th>
                      <th>Method</th>
                      <th className="num">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(result.match_details).map(([requirement, detail]) => (
                      <tr key={requirement}>
                        <td>{requirement}</td>
                        <td>{detail.candidate}</td>
                        <td className="mono">{detail.method}</td>
                        <td className="num">{Number(detail.score).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">No skills matched.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatBlock({ label, value, sub, accent }) {
  return (
    <div className="stat-card" style={{ '--accent': accent }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value == null ? '—' : `${value}%`}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

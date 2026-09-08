import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Overview', desc: 'Programme snapshot', end: true },
  { to: '/employment', label: 'Employment Analytics', desc: 'Pipeline & placement rates' },
  { to: '/skill-gap', label: 'Skill Gap', desc: 'Candidate vs. role requirements' },
  { to: '/retention', label: 'Retention Risk', desc: 'Attrition prediction' },
]

const STATUS_LABEL = {
  checking: 'Checking engine…',
  healthy: 'Engine healthy',
  unhealthy: 'Engine unavailable',
}

export default function Sidebar({ engineStatus }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <span className="brand-name">SkillTrack AI</span>
      </div>
      <p className="brand-sub">Skilling outcomes console</p>

      <p className="nav-group-label">Analytics</p>
      <nav className="nav">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-link-title">{link.label}</span>
            <span className="nav-link-desc">{link.desc}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="engine-status">
          <span className={`status-dot ${engineStatus}`} aria-hidden="true" />
          {STATUS_LABEL[engineStatus] || STATUS_LABEL.checking}
        </div>
      </div>
    </aside>
  )
}

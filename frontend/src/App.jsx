import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Employment from './pages/Employment'
import SkillGap from './pages/SkillGap'
import Retention from './pages/Retention'
import { getHealth } from './services/api'

export default function App() {
  const [engineStatus, setEngineStatus] = useState('checking')
  const [health, setHealth] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const result = await getHealth()
        if (cancelled) return
        setHealth(result)
        setEngineStatus(result?.status === 'healthy' ? 'healthy' : 'unhealthy')
      } catch {
        if (!cancelled) {
          setEngineStatus('unhealthy')
          setHealth(null)
        }
      }
    }

    check()
    const interval = setInterval(check, 45000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="app-shell">
      <Sidebar engineStatus={engineStatus} />
      <div className="main">
        <div className="main-inner">
          <Routes>
            <Route path="/" element={<Dashboard health={health} engineStatus={engineStatus} />} />
            <Route path="/employment" element={<Employment />} />
            <Route path="/skill-gap" element={<SkillGap />} />
            <Route path="/retention" element={<Retention />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

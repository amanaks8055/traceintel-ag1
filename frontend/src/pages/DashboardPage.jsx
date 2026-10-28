import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'

export function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([apiClient.get('/dashboard/stats'), apiClient.get('/dashboard/scan-activity')])
      .then(([statsResponse, activityResponse]) => {
        setStats(statsResponse.data)
        setActivity(activityResponse.data)
      })
      .catch(() => setError('Dashboard data could not be loaded.'))
  }, [])

  const cards = [
    ['Production batches', stats?.totalBatches ?? '—'],
    ['Scans today', stats?.scansToday ?? '—'],
    ['Blocked scans', stats?.blockedScans ?? '—'],
    ['Active holds', stats?.activeHolds ?? '—'],
  ]

  return (
    <div className="page-content">
      <p className="eyebrow">Operations overview</p>
      <h2 className="page-heading">Plant dashboard</h2>
      <p className="muted">Monitor production movement, scan validation, and quality risk.</p>
      {error && <p className="error-message">{error}</p>}
      <div className="stats-grid">
        {cards.map(([label, value]) => <section className="glass-card" key={label}><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong></section>)}
      </div>
      <section className="glass-card table-card">
        <h3>Scan activity, last 7 days</h3>
        <div className="data-table">
          <div className="table-row table-header"><span>Date</span><span>Accepted</span><span>Blocked</span></div>
          {activity.map((day) => <div className="table-row" key={day.date}><span>{day.date}</span><span>{day.accepted}</span><span>{day.blocked}</span></div>)}
        </div>
      </section>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { adminApi } from '../../lib/api'
import { StatCard, Card, PageHeader, Alert } from '../../components/ui'
import { Users, GraduationCap, QrCode, ClipboardList, AlertCircle, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import '../../components/ui/components.css'
import '../classrep/dashboard.css'

export default function AdminDashboardPage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    adminApi.getDashboard()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="dash-loading"><div className="spinner" /></div>

  const s = data?.stats || {}

  return (
    <div className="animate-fade-up">
      <PageHeader title="Admin Dashboard" subtitle="System-wide overview of ClassIQ" />
      {error && <Alert variant="error">{error}</Alert>}

      <div className="stats-grid">
        <StatCard label="Total Classreps" value={s.total_classreps} icon={<Users size={20}/>}         color="blue"   />
        <StatCard label="Total Students"  value={s.total_students}  icon={<GraduationCap size={20}/>} color="green"  />
        <StatCard label="Total Sessions"  value={s.total_sessions}  icon={<QrCode size={20}/>}        color="purple" />
        <StatCard label="Total Records"   value={s.total_attendance}icon={<ClipboardList size={20}/>} color="orange" />
        <StatCard label="Pending Issues"  value={s.pending_issues}  icon={<AlertCircle size={20}/>}   color="red"    />
        <StatCard label="Today's Attendance" value={s.today_attendance} icon={<TrendingUp size={20}/>} color="green" />
      </div>

      <div className="dash-grid">
        <Card>
          <div className="card-head"><h2 className="card-title">Attendance — Last 14 Days</h2></div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.chart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
              <Bar dataKey="count" fill="var(--blue)" radius={[4,4,0,0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="card-head"><h2 className="card-title">System Summary</h2></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Flagged Records',  value: s.flagged_total || 0,  color: 'var(--red)' },
              { label: 'Outside Records',  value: s.outside_total || 0,  color: 'var(--orange)' },
              { label: 'Active Sessions',  value: s.active_sessions || 0, color: 'var(--green)' },
              { label: 'Issues Resolved',  value: s.resolved_issues || 0, color: 'var(--blue)' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--txt2)' }}>{item.label}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

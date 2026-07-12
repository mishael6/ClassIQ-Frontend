import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { lecturerApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { StatCard, Card, PageHeader, Alert, Button, Badge } from '../../components/ui'
import { Users, CheckCircle, Clock, Calendar, QrCode, ChevronRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import '../../components/ui/components.css'
import '../classrep/dashboard.css'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

export default function LecturerDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    lecturerApi.getDashboard()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="dash-loading"><div className="spinner" /></div>

  const stats = data?.stats || {}
  const chart = data?.chart || []
  const classStats = data?.class_stats || data?.week_stats || []
  const students = data?.students || []

  return (
    <div className="animate-fade-up dash-page">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]} 👋`}
        subtitle={`${user?.course || 'Your course'} — weekly attendance overview`}
        actions={
          <Link to="/lecturer/generate-qr">
            <Button icon={<QrCode size={16}/>} size="sm">Take Attendance</Button>
          </Link>
        }
      />

      {error && <Alert variant="error" onClose={() => setError('')} style={{ marginBottom: 20 }}>{error}</Alert>}

      <div className="stats-grid">
        <StatCard label="Total Students" value={stats.total_students} icon={<Users size={20}/>} color="blue" change="Registered" />
        <StatCard label="Attendance Today" value={stats.attendance_today} icon={<CheckCircle size={20}/>} color="green" change="Marked today" />
        <StatCard label="Semesters" value={stats.total_semesters} icon={<Calendar size={20}/>} color="purple" change="Configured" />
        <StatCard label="Classes" value={stats.total_classes} icon={<CheckCircle size={20}/>} color="green" change="With topics" />
      </div>

      <div className="dash-top-grid">
        <Card className="dash-chart-card">
          <div className="card-head">
            <h2 className="card-title">Attendance — Last 7 Days</h2>
            <Link to="/lecturer/attendance" className="card-link">View all →</Link>
          </div>
          {chart.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke="var(--blue)" strokeWidth={2.5}
                  dot={{ fill: 'var(--blue)', r: 4 }} activeDot={{ r: 6 }} name="Students" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-chart">No attendance data yet</p>
          )}
        </Card>

        <div className="dash-right-col">
          <Card>
            <div className="card-head" style={{ marginBottom: 14 }}>
              <h2 className="card-title">Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <Link to="/lecturer/weeks" className="quick-btn">
                <div className="quick-icon purple"><Calendar size={22}/></div>
                <span>Manage Schedule</span>
              </Link>
              <Link to="/lecturer/generate-qr" className="quick-btn">
                <div className="quick-icon blue"><QrCode size={22}/></div>
                <span>Take Attendance</span>
              </Link>
              <Link to="/lecturer/attendance" className="quick-btn">
                <div className="quick-icon green"><CheckCircle size={22}/></div>
                <span>View Records</span>
              </Link>
            </div>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <div className="card-head" style={{ marginBottom: 10 }}>
              <h2 className="card-title">Student Registration Link</h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 10 }}>
              Share with students to register under your course
            </p>
            <div className="reg-link-box">
              <input readOnly value={`${window.location.origin}/student/register?lecturer_id=${user?.id}`} className="reg-link-input" />
              <Button size="sm" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/student/register?lecturer_id=${user?.id}`)}>Copy</Button>
            </div>
          </Card>
        </div>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div className="card-head">
          <h2 className="card-title">Per-Class Stats</h2>
          <Link to="/lecturer/weeks" className="card-link">Manage schedule →</Link>
        </div>
        {classStats.length === 0 ? (
          <p style={{ color: 'var(--muted)', padding: '12px 0' }}>
            No classes yet. <Link to="/lecturer/weeks">Set up semester, weeks & classes</Link> before taking attendance.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Week</th>
                  <th>Class</th>
                  <th>Topic</th>
                  <th>Total Marks</th>
                  <th>Present</th>
                  <th>Flagged</th>
                  <th>Last Session</th>
                </tr>
              </thead>
              <tbody>
                {classStats.map(w => (
                  <tr key={w.class_id || w.id}>
                    <td>{w.semester_name}</td>
                    <td><Badge variant="blue">Week {w.week_number}</Badge></td>
                    <td>Class {w.class_number}</td>
                    <td>{w.topic}</td>
                    <td>{w.total_marks || 0}</td>
                    <td>{w.present_count || 0}</td>
                    <td>{w.flagged_count || 0}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{fmtDate(w.last_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="dash-students-card">
        <div className="card-head">
          <h2 className="card-title">My Students</h2>
          <span className="stu-count-badge">{students.length}</span>
        </div>
        {students.length === 0 ? (
          <div className="dash-stu-empty">
            <Users size={36}/>
            <p>No students registered yet</p>
            <span>Share your registration link above</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Index No.</th>
                  <th>Present</th>
                  <th>Flagged</th>
                  <th>Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 15).map(s => (
                  <tr key={s.id}>
                    <td>
                      <p className="dash-stu-name">{s.name}</p>
                      <p className="dash-stu-email">{s.email}</p>
                    </td>
                    <td><code className="stu-index">{s.index_number}</code></td>
                    <td><span className="dash-present-badge">{s.present_count || 0}</span></td>
                    <td>{s.flagged_count > 0 ? <span className="dash-flagged-badge">{s.flagged_count}⚑</span> : '—'}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{fmtDate(s.last_seen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length > 15 && (
              <p style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--muted)' }}>
                Showing 15 of {students.length} students <ChevronRight size={12} style={{ display: 'inline' }}/>
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { lecturerApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { StatCard, Card, PageHeader, Alert, Button, Badge } from '../../components/ui'
import { Users, CheckCircle, Calendar, QrCode, Download, GraduationCap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import '../../components/ui/components.css'
import '../classrep/dashboard.css'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

function exportClassCSV(cohort) {
  const students = cohort.students || []
  if (!students.length) return
  const headers = ['Name', 'Index Number', 'Email', 'Phone', 'Present Count', 'Last Seen']
  const rows = students.map(s => [
    `"${(s.name || '').replace(/"/g, '""')}"`,
    `"${(s.index_number || '').replace(/"/g, '""')}"`,
    `"${(s.email || '').replace(/"/g, '""')}"`,
    `"${(s.phone || '').replace(/"/g, '""')}"`,
    s.present_count || 0,
    s.last_seen || '',
  ])
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `classiq-${(cohort.name || 'class').replace(/[^\w-]+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

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
  const classStats = data?.session_stats || data?.class_stats || []
  const studentsByClass = data?.students_by_class || []

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
        <StatCard label="Classes" value={stats.total_classes} icon={<GraduationCap size={20}/>} color="green" change="Student groups" />
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
              <Link to="/lecturer/classes" className="quick-btn">
                <div className="quick-icon purple"><GraduationCap size={22}/></div>
                <span>My Classes</span>
              </Link>
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
        </div>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div className="card-head">
          <h2 className="card-title">Session Stats</h2>
          <Link to="/lecturer/weeks" className="card-link">Manage schedule →</Link>
        </div>
        {classStats.length === 0 ? (
          <p style={{ color: 'var(--muted)', padding: '12px 0' }}>
            No sessions yet. <Link to="/lecturer/classes">Add classes</Link> and <Link to="/lecturer/weeks">set up your schedule</Link> before taking attendance.
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
                  <tr key={w.session_id || w.id}>
                    <td>{w.semester_name}</td>
                    <td><Badge variant="blue">Week {w.week_number}</Badge></td>
                    <td><strong>{w.class_name}</strong></td>
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
          <h2 className="card-title">Students by Class</h2>
          <Link to="/lecturer/classes" className="card-link">Manage classes →</Link>
        </div>
        {studentsByClass.length === 0 ? (
          <div className="dash-stu-empty">
            <Users size={36}/>
            <p>No classes yet</p>
            <span><Link to="/lecturer/classes">Add a class</Link> and share its registration link with students</span>
          </div>
        ) : (
          studentsByClass.map(cohort => (
            <div key={cohort.id} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '0.95rem', margin: 0 }}>{cohort.name}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '4px 0 0' }}>
                    {(cohort.students || []).length} student{(cohort.students || []).length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Download size={14}/>}
                  disabled={!(cohort.students || []).length}
                  onClick={() => exportClassCSV(cohort)}
                >
                  Export CSV
                </Button>
              </div>
              {(cohort.students || []).length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', padding: '8px 0' }}>
                  No students in this class yet. Copy the link from <Link to="/lecturer/classes">My Classes</Link>.
                </p>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Index No.</th>
                        <th>Present</th>
                        <th>Last Seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(cohort.students || []).slice(0, 10).map(s => (
                        <tr key={s.id}>
                          <td>
                            <p className="dash-stu-name">{s.name}</p>
                            <p className="dash-stu-email">{s.email}</p>
                          </td>
                          <td><code className="stu-index">{s.index_number}</code></td>
                          <td><span className="dash-present-badge">{s.present_count || 0}</span></td>
                          <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{fmtDate(s.last_seen)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(cohort.students || []).length > 10 && (
                    <p style={{ padding: '8px 16px', fontSize: '0.82rem', color: 'var(--muted)' }}>
                      Showing 10 of {(cohort.students || []).length} — <Link to="/lecturer/classes">view all</Link>
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { lecturerApi } from '../../lib/api'
import { Card, PageHeader, Badge, Alert } from '../../components/ui'
import '../../components/ui/components.css'
import '../classrep/attendance.css'

function statusBadge(st) {
  const map = { Present: 'present', Flagged: 'flagged' }
  return <Badge variant={map[st] || 'default'}>{st}</Badge>
}

export default function LecturerAttendanceHistoryPage() {
  const [records, setRecords] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    lecturerApi.getAttendance()
      .then(r => setRecords(r.data.records || {}))
      .catch(() => setError('Failed to load attendance.'))
      .finally(() => setLoading(false))
  }, [])

  const weekKeys = Object.keys(records)

  return (
    <div className="animate-fade-up">
      <PageHeader title="Attendance History" subtitle="Records grouped by week and topic" />

      {error && <Alert variant="error" onClose={() => setError('')} style={{ marginBottom: 16 }}>{error}</Alert>}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}/></div>
      ) : weekKeys.length === 0 ? (
        <Card style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
          No attendance records yet. Generate a QR code to start a session.
        </Card>
      ) : (
        weekKeys.map(weekLabel => (
          <Card key={weekLabel} style={{ marginBottom: 20 }}>
            <div className="card-head">
              <h2 className="card-title">{weekLabel}</h2>
            </div>
            {Object.entries(records[weekLabel] || {}).map(([date, rows]) => (
              <div key={date} className="att-date-block">
                <h3 className="att-date-title">{new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Index</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i}>
                          <td>{r.student_name}</td>
                          <td><code>{r.index_number}</code></td>
                          <td>{r.time_marked?.slice(0, 5)}</td>
                          <td>{statusBadge(r.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </Card>
        ))
      )}
    </div>
  )
}

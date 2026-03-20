// AdminErrorLogsPage.jsx
import { useState, useEffect } from 'react'
import { adminApi } from '../../lib/api'
import { Card, PageHeader, Alert, Button } from '../../components/ui'
import { RefreshCw } from 'lucide-react'
import '../../components/ui/components.css'

export default function AdminErrorLogsPage() {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const load = () => {
    setLoading(true)
    adminApi.getErrorLogs()
      .then(r => setLogs(r.data.logs || []))
      .catch(() => setError('Failed to load error logs.'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  return (
    <div className="animate-fade-up">
      <PageHeader title="Error Logs" subtitle="PHP and system error log viewer"
        actions={<Button size="sm" variant="secondary" icon={<RefreshCw size={14}/>} onClick={load}>Refresh</Button>}
      />
      {error && <Alert variant="error">{error}</Alert>}
      <Card>
        {logs.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 40, color: 'var(--green)', fontWeight: 600 }}>✅ No errors logged</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {logs.map((log, i) => (
              <div key={i} style={{
                background: 'var(--red-lt)', border: '1px solid #fca5a5',
                borderRadius: 'var(--radius)', padding: '12px 14px',
                fontFamily: 'Courier New, monospace', fontSize: '0.78rem',
                color: '#7f1d1d', lineHeight: 1.6
              }}>
                <span style={{ opacity: 0.6, marginRight: 8 }}>{log.time}</span>
                {log.message}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

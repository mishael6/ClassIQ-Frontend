import { useState, useEffect } from 'react'
import { adminApi } from '../../lib/api'
import { Card, PageHeader, Table, Badge, Alert, Button } from '../../components/ui'
import { RefreshCw } from 'lucide-react'
import '../../components/ui/components.css'

export default function AdminQRSessionsPage() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const load = () => {
    setLoading(true)
    adminApi.getQrSessions()
      .then(r => setData(r.data.sessions || []))
      .catch(() => setError('Failed to load.'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  return (
    <div className="animate-fade-up">
      <PageHeader title="QR Sessions" subtitle="All attendance sessions generated"
        actions={<Button size="sm" variant="secondary" icon={<RefreshCw size={14}/>} onClick={load}>Refresh</Button>}
      />
      {error && <Alert variant="error">{error}</Alert>}
      <Card>
        <Table
          columns={[
            { key: 'id',           label: 'ID' },
            { key: 'classrep_name',label: 'Class Rep' },
            { key: 'lecture_name', label: 'Lecture' },
            { key: 'code',         label: 'Code' },
            { key: 'radius_m',     label: 'Radius', render: r => `${r.radius_m || 100}m` },
            { key: 'created_at',   label: 'Created', render: r => new Date(r.created_at).toLocaleString() },
            { key: 'ended_at',     label: 'Status', render: r => r.ended_at
              ? <Badge variant="default">Ended</Badge>
              : <Badge variant="present">🟢 Active</Badge>
            },
          ]}
          data={data}
          emptyText="No QR sessions found."
        />
      </Card>
    </div>
  )
}

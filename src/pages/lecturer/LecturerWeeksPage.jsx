import { useState, useEffect } from 'react'
import { lecturerApi } from '../../lib/api'
import { Card, PageHeader, Button, Alert, Input, Modal } from '../../components/ui'
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react'
import '../../components/ui/components.css'

export default function LecturerWeeksPage() {
  const [weeks, setWeeks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ week_number: '', topic: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    lecturerApi.getWeeks()
      .then(r => setWeeks(r.data.weeks || []))
      .catch(() => setError('Failed to load weeks.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toast = (msg, isErr = false) => {
    isErr ? setError(msg) : setSuccess(msg)
    setTimeout(() => isErr ? setError('') : setSuccess(''), 4000)
  }

  const openAdd = () => {
    setForm({ week_number: String((weeks.length ? Math.max(...weeks.map(w => w.week_number)) : 0) + 1), topic: '' })
    setModal('add')
  }

  const openEdit = (w) => {
    setForm({ id: w.id, week_number: String(w.week_number), topic: w.topic })
    setModal('edit')
  }

  const save = async () => {
    const week_number = parseInt(form.week_number, 10)
    const topic = form.topic.trim()
    if (!week_number || week_number < 1 || !topic) {
      toast('Week number and topic are required.', true)
      return
    }
    setSaving(true)
    try {
      if (modal === 'edit') {
        await lecturerApi.updateWeek({ id: form.id, week_number, topic })
        toast('Week updated.')
      } else {
        await lecturerApi.addWeek({ week_number, topic })
        toast('Week added.')
      }
      setModal(null)
      load()
    } catch (e) {
      toast(e.response?.data?.message || 'Save failed.', true)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this week? Attendance records keep their week number.')) return
    try {
      await lecturerApi.deleteWeek(id)
      toast('Week removed.')
      load()
    } catch {
      toast('Failed to delete.', true)
    }
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Weeks & Topics"
        subtitle="Set up each teaching week and its topic before generating attendance QR codes"
        actions={<Button size="sm" icon={<Plus size={14}/>} onClick={openAdd}>Add Week</Button>}
      />

      {error && <Alert variant="error" onClose={() => setError('')} style={{ marginBottom: 16 }}>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} style={{ marginBottom: 16 }}>{success}</Alert>}

      <Card>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}/></div>
        ) : weeks.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
            <Calendar size={40} style={{ marginBottom: 12, opacity: 0.5 }}/>
            <p>No weeks yet. Add your first week and topic.</p>
            <Button size="sm" icon={<Plus size={14}/>} onClick={openAdd} style={{ marginTop: 12 }}>Add Week 1</Button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Topic</th>
                  <th>Added</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {weeks.map(w => (
                  <tr key={w.id}>
                    <td><strong>Week {w.week_number}</strong></td>
                    <td>{w.topic}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                      {w.created_at ? new Date(w.created_at).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Button size="sm" variant="ghost" icon={<Edit2 size={13}/>} onClick={() => openEdit(w)}>Edit</Button>
                        <Button size="sm" variant="danger" icon={<Trash2 size={13}/>} onClick={() => remove(w.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'edit' ? 'Edit Week' : 'Add Week'} width={440}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label className="field-label">Week Number</label>
            <input
              className="field-input"
              type="number"
              min={1}
              max={52}
              value={form.week_number}
              onChange={e => setForm(f => ({ ...f, week_number: e.target.value }))}
            />
          </div>
          <Input
            label="Topic"
            value={form.topic}
            onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
            placeholder="e.g. Introduction to Data Structures"
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" fullWidth onClick={() => setModal(null)}>Cancel</Button>
            <Button fullWidth loading={saving} onClick={save}>{modal === 'edit' ? 'Save' : 'Add Week'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

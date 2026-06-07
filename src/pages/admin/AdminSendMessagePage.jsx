import { useState, useEffect } from 'react'
import { adminApi } from '../../lib/api'
import { Card, PageHeader, Button, Alert } from '../../components/ui'
import { Send, MessageSquare, Users, User, CheckCircle, Phone } from 'lucide-react'
import '../../components/ui/components.css'
import './adminmessage.css'

export default function AdminSendMessagePage() {
  const [form, setForm] = useState({
    recipient_type: 'classrep',
    recipient_id:   '',
    message:        '',
  })
  const [classreps, setClassreps] = useState([])
  const [students, setStudents]   = useState([])
  const [success,   setSuccess]   = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState(null)

  const [search, setSearch] = useState('')

  useEffect(() => {
    adminApi.getClassreps({ status: 'approved' })
      .then(r => setClassreps(r.data.classreps || []))
      .catch(() => {})
    
    adminApi.getStudents({ limit: 100000 })
      .then(r => setStudents(r.data.students || []))
      .catch(() => {})
  }, [])

  const filteredStudents = students.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.index_number.toLowerCase().includes(search.toLowerCase())
  )

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError(''); setSuccess(''); setResult(null)
    setLoading(true)
    try {
      if (form.recipient_type === 'all_students') {
        const { data } = await adminApi.sendBulkSms(form.message)
        setSuccess(data.message)
      } else {
        const payload = {
          ...form,
          recipient_id: form.recipient_type === 'classrep' ? parseInt(form.recipient_id) : parseInt(form.recipient_id),
        }
        const { data } = await adminApi.sendMessage(payload)
        setResult(data)
        setSuccess(data.message)
      }
      setForm(f => ({ ...f, message: '' }))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send SMS.')
    } finally {
      setLoading(false)
    }
  }

  const isAllClassreps = form.recipient_type === 'all'
  const isAllStudents  = form.recipient_type === 'all_students'
  const isClassrep     = form.recipient_type === 'classrep'
  const isStudent      = form.recipient_type === 'student'
  
  const charCount  = form.message.length
  const overLimit  = charCount > 155

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Send SMS"
        subtitle="Send SMS messages to class representatives or students via Payloqa"
      />

      <div className="msg-layout">
        {/* ── Compose ── */}
        <Card className="msg-compose-card">
          <div className="msg-sms-header">
            <div className="msg-sms-icon"><MessageSquare size={20}/></div>
            <div>
              <p className="msg-card-title">Compose SMS</p>
              <p className="msg-card-sub">Messages sent via Payloqa</p>
            </div>
          </div>

          {error   && <Alert variant="error"   onClose={() => setError('')}   style={{ marginBottom: 16 }}>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess('')} style={{ marginBottom: 16 }}>{success}</Alert>}

          <form onSubmit={submit} className="msg-form">

            {/* Recipient toggle */}
            <div className="msg-recipient-toggle" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              <button
                type="button"
                className={`msg-toggle-btn ${isClassrep ? 'active' : ''}`}
                onClick={() => setForm(f => ({ ...f, recipient_type: 'classrep', recipient_id: '' }))}
              >
                <User size={15}/> Specific Classrep
              </button>
              <button
                type="button"
                className={`msg-toggle-btn ${isAllClassreps ? 'active' : ''}`}
                onClick={() => setForm(f => ({ ...f, recipient_type: 'all', recipient_id: '' }))}
              >
                <Users size={15}/> All Classreps
              </button>
              <button
                type="button"
                className={`msg-toggle-btn ${isStudent ? 'active' : ''}`}
                onClick={() => setForm(f => ({ ...f, recipient_type: 'student', recipient_id: '' }))}
              >
                <User size={15}/> Specific Student
              </button>
              <button
                type="button"
                className={`msg-toggle-btn ${isAllStudents ? 'active' : ''}`}
                onClick={() => setForm(f => ({ ...f, recipient_type: 'all_students', recipient_id: '' }))}
              >
                <Users size={15}/> All Students
              </button>
            </div>

            {/* Recipient selector */}
            {(isClassrep || isStudent) && (
              <div className="field">
                <label className="field-label">Select Recipient</label>
                {isStudent && (
                    <input 
                        type="text" 
                        placeholder="Search student by name or index..."
                        className="field-input"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ marginBottom: 8 }}
                    />
                )}
                <select
                  name="recipient_id"
                  className="field-select"
                  value={form.recipient_id}
                  onChange={handle}
                  required
                >
                  <option value="">— Choose a {isClassrep ? 'class rep' : 'student'} —</option>
                  {(isClassrep ? classreps : filteredStudents).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.index_number ? `(${c.index_number})` : ''} {c.phone ? `(${c.phone})` : '(no phone)'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(isAllClassreps || isAllStudents) && (
              <div className="msg-all-banner">
                <Users size={16}/>
                Sending to <strong>{isAllClassreps ? classreps.filter(c => c.phone).length : students.filter(s => s.phone).length}</strong> {isAllClassreps ? 'classreps' : 'students'} with phone numbers
                {(isAllClassreps ? classreps.filter(c => !c.phone).length : students.filter(s => !s.phone).length) > 0 && (
                  <span className="msg-all-warn">
                    ({(isAllClassreps ? classreps.filter(c => !c.phone).length : students.filter(s => !s.phone).length)} skipped — no phone)
                  </span>
                )}
              </div>
            )}

            {/* Message */}
            <div className="field">
              <div className="msg-label-row">
                <label className="field-label">Message</label>
                <span className={`msg-char-count ${overLimit ? 'over' : ''}`}>
                  {charCount}/155
                </span>
              </div>
              <textarea
                className="field-textarea"
                name="message"
                value={form.message}
                onChange={handle}
                placeholder="Type your SMS message…"
                rows={5}
                required
              />
              {overLimit && (
                <p className="msg-over-warn">
                  ⚠️ Message exceeds 155 characters and will be truncated when sent
                </p>
              )}
            </div>

            {/* Preview */}
            {form.message && (
              <div className="msg-preview">
                <p className="msg-preview-label">Preview</p>
                <div className="msg-preview-bubble">
                  {form.message.slice(0, 155)}
                  {overLimit && <span className="msg-preview-truncated">…</span>}
                </div>
                <p className="msg-preview-from">From: ClassIQ</p>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
              icon={<Send size={16}/>}
              disabled={!form.message.trim() || ((isClassrep || isStudent) && !form.recipient_id)}
            >
              Send SMS
            </Button>
          </form>
        </Card>

        {/* ── Right panel ── */}
        <div className="msg-result-panel">

          {/* Result */}
          {result && (
            <Card style={{ marginBottom: 16 }}>
              <h2 className="msg-card-title">Delivery Result</h2>
              <div className="msg-result-content">
                <div className="msg-result-row success">
                  <CheckCircle size={16}/>
                  <span><strong>{result.sms_sent}</strong> SMS sent successfully</span>
                </div>
                {result.errors?.length > 0 && (
                  <div className="msg-result-errors" style={{ marginTop: 10 }}>
                    <p className="msg-err-title">⚠️ {result.errors.length} failed:</p>
                    {result.errors.map((e, i) => (
                      <p key={i} className="msg-err-item">{e}</p>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Setup guide */}
          <Card>
            <h2 className="msg-card-title">SMS Setup</h2>
            <div className="msg-setup-section">
              <div className="msg-setup-icon sms-icon"><MessageSquare size={16}/></div>
              <div style={{ flex: 1 }}>
                <p className="msg-setup-title">Payloqa SMS</p>
                <p className="msg-setup-desc">Add these to your Render environment variables:</p>
                <div className="msg-env-list">
                  <code>PAYLOQA_API_KEY=your-api-key</code>
                  <code>PAYLOQA_SENDER=ClassIQ</code>
                </div>
                <p className="msg-setup-hint">
                  Get your API key from <strong>payloqa.com</strong> dashboard
                </p>
              </div>
            </div>

            <div className="msg-setup-divider" />

            <div className="msg-setup-section">
              <div className="msg-setup-icon phone-icon"><Phone size={16}/></div>
              <div style={{ flex: 1 }}>
                <p className="msg-setup-title">Phone Numbers</p>
                <p className="msg-setup-desc">
                  Classreps/Students must have a phone number in their profile.<br/>
                  Ghana numbers are automatically converted to international format (233XXXXXXXXX).
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

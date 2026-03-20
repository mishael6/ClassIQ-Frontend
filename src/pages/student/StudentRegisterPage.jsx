import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { studentApi } from '../../lib/api'
import { Button, Input, Alert } from '../../components/ui'
import { User, Mail, Phone, Hash, Loader2, CheckCircle } from 'lucide-react'
import '../../components/ui/components.css'
import './student.css'
import './studentregister.css'

export default function StudentRegisterPage() {
  const [params]     = useSearchParams()
  const classrep_id  = params.get('classrep_id')

  const [classrep,  setClassrep]  = useState(null)   // classrep info
  const [loadingCR, setLoadingCR] = useState(true)
  const [notFound,  setNotFound]  = useState(false)

  const [form, setForm] = useState({
    name: '', index_number: '', email: '', phone: ''
  })
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  // Load classrep info on mount
  useEffect(() => {
    if (!classrep_id) { setNotFound(true); setLoadingCR(false); return }
    studentApi.getClassrepInfo(classrep_id)
      .then(r => {
        if (r.data.success) setClassrep(r.data.classrep)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingCR(false))
  }, [classrep_id])

  const handle = e => {
    let val = e.target.value
    if (e.target.name === 'index_number') val = val.toUpperCase()
    setForm(f => ({ ...f, [e.target.name]: val }))
  }

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await studentApi.register({ ...form, classrep_id })
      if (data.success) setSuccess(true)
      else setError(data.message || 'Registration failed')
    } catch (err) {
      setError(err.response?.data?.message || 'Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Loading classrep info ──
  if (loadingCR) return (
    <div className="sreg-page">
      <div className="sreg-card">
        <div className="sreg-logo">
          <div className="logo-mark">CQ</div>
          <span className="s-logo-text">ClassIQ</span>
        </div>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--blue)' }} />
          <p style={{ color: 'var(--muted)', marginTop: 12, fontSize: '0.88rem' }}>Loading registration form…</p>
        </div>
      </div>
    </div>
  )

  // ── Invalid link ──
  if (notFound) return (
    <div className="sreg-page">
      <div className="sreg-card">
        <div className="sreg-logo">
          <div className="logo-mark">CQ</div>
          <span className="s-logo-text">ClassIQ</span>
        </div>
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>⛔</div>
          <h2 style={{ fontFamily: 'var(--font-head)', marginBottom: 8 }}>Invalid Link</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
            This registration link is invalid or has expired.<br />
            Please ask your class representative for a new link.
          </p>
        </div>
      </div>
    </div>
  )

  // ── Success ──
  if (success) return (
    <div className="sreg-page">
      <div className="sreg-card">
        <div className="sreg-logo">
          <div className="logo-mark">CQ</div>
          <span className="s-logo-text">ClassIQ</span>
        </div>
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <CheckCircle size={56} style={{ color: 'var(--green)', marginBottom: 16 }} />
          <h2 style={{ fontFamily: 'var(--font-head)', marginBottom: 8 }}>You're Registered!</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.7 }}>
            Welcome to <strong>{classrep?.name}'s</strong> class.<br />
            Your class representative can now mark your attendance.
          </p>
          <div className="sreg-success-info">
            <div className="sreg-info-row">
              <span>Institution</span><strong>{classrep?.institution}</strong>
            </div>
            <div className="sreg-info-row">
              <span>Program</span><strong>{classrep?.program}</strong>
            </div>
            <div className="sreg-info-row">
              <span>Department</span><strong>{classrep?.department}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Registration form ──
  return (
    <div className="sreg-page">
      <div className="sreg-card">

        {/* Header */}
        <div className="sreg-header">
          <div className="sreg-logo">
            <div className="logo-mark">CQ</div>
            <span className="s-logo-text">ClassIQ</span>
          </div>
          <h1 className="sreg-title">Student Registration</h1>
          <p className="sreg-subtitle">Fill in your personal details to join the class</p>
        </div>

        {/* Classrep info banner */}
        {classrep && (
          <div className="sreg-classrep-banner">
            <div className="sreg-cr-avatar">
              {classrep.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="sreg-cr-info">
              <p className="sreg-cr-name">Registering under {classrep.name}</p>
              <p className="sreg-cr-meta">{classrep.institution} · {classrep.program}</p>
            </div>
          </div>
        )}

        {/* Pre-filled class info */}
        {classrep && (
          <div className="sreg-class-info">
            <div className="sreg-ci-title">Class Information <span>(auto-filled)</span></div>
            <div className="sreg-ci-grid">
              <div className="sreg-ci-item">
                <span className="sreg-ci-label">Institution</span>
                <span className="sreg-ci-value">{classrep.institution || '—'}</span>
              </div>
              <div className="sreg-ci-item">
                <span className="sreg-ci-label">Department</span>
                <span className="sreg-ci-value">{classrep.department || '—'}</span>
              </div>
              <div className="sreg-ci-item">
                <span className="sreg-ci-label">Program</span>
                <span className="sreg-ci-value">{classrep.program || '—'}</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="error" onClose={() => setError('')} style={{ marginBottom: 4 }}>
            {error}
          </Alert>
        )}

        {/* Form — only personal details */}
        <form onSubmit={submit} className="sreg-form">
          <Input
            label="Full Name"
            id="name"
            name="name"
            value={form.name}
            onChange={handle}
            placeholder="e.g. Kofi Mensah"
            icon={<User size={15}/>}
            required
          />
          <Input
            label="Index Number"
            id="index_number"
            name="index_number"
            value={form.index_number}
            onChange={handle}
            placeholder="e.g. 20240001"
            icon={<Hash size={15}/>}
            required
            style={{ textTransform: 'uppercase' }}
          />
          <Input
            label="Phone Number"
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handle}
            placeholder="e.g. 0240000000"
            icon={<Phone size={15}/>}
            required
          />
          <Input
            label="Email Address"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handle}
            placeholder="e.g. kofi@example.com"
            icon={<Mail size={15}/>}
            required
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            size="lg"
            style={{ marginTop: 8 }}
          >
            Register
          </Button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)', marginTop: 16 }}>
          By registering, your information will be used solely for attendance tracking purposes.
        </p>
      </div>
    </div>
  )
}

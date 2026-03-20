import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { studentApi } from '../../lib/api'
import { Button, Alert } from '../../components/ui'
import { MapPin, CheckCircle, Loader2 } from 'lucide-react'
import '../../components/ui/components.css'
import './student.css'

export default function MarkAttendancePage() {
  const [params]       = useSearchParams()
  const classrep_id    = params.get('classrep_id')
  const code           = params.get('code')
  const lecture        = params.get('lecture')

  const [sessionValid, setSessionValid] = useState(null)  // null=loading, true, false
  const [gpsStatus,    setGpsStatus]    = useState('waiting')  // waiting|ok|denied
  const [coords,       setCoords]       = useState(null)
  const [indexNumber,  setIndexNumber]  = useState('')
  const [submitting,   setSubmitting]   = useState(false)
  const [result,       setResult]       = useState(null)  // { success, message, status }
  const [showInstructions, setShowInstructions] = useState(false)

  // Verify session
  useEffect(() => {
    if (!classrep_id || !code) { setSessionValid(false); return }
    studentApi.verifySession({ classrep_id, code })
      .then(r => setSessionValid(r.data.valid))
      .catch(() => setSessionValid(false))
  }, [classrep_id, code])

  // Request GPS
  useEffect(() => {
    if (!navigator.geolocation) { setGpsStatus('unsupported'); return }
    navigator.geolocation.getCurrentPosition(
      pos => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsStatus('ok') },
      ()  => setGpsStatus('denied'),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    )
  }, [])

  const getDeviceId = () => {
    try { return btoa(navigator.userAgent + '|' + screen.width + 'x' + screen.height) }
    catch { return navigator.userAgent }
  }

  const submit = async e => {
    e.preventDefault()
    if (!coords) return
    setSubmitting(true)
    try {
      const { data } = await studentApi.markAttendance({
        classrep_id, code, lecture_name: lecture,
        index_number: indexNumber,
        student_lat: coords.lat, student_lng: coords.lng,
        device_id: getDeviceId()
      })
      setResult(data)
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Connection error.' })
    } finally {
      setSubmitting(false)
    }
  }

  // Loading
  if (sessionValid === null) return (
    <div className="student-page">
      <div className="student-card">
        <div className="student-logo"><div className="logo-mark">CQ</div><span className="s-logo-text">ClassIQ</span></div>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Loader2 size={36} className="animate-spin" style={{ color: 'var(--blue)' }} />
          <p style={{ color: 'var(--muted)', marginTop: 12 }}>Verifying session...</p>
        </div>
      </div>
    </div>
  )

  // Invalid session
  if (!sessionValid) return (
    <div className="student-page">
      <div className="student-card">
        <div className="student-logo"><div className="logo-mark">CQ</div><span className="s-logo-text">ClassIQ</span></div>
        <div className="student-error-state">
          <div className="error-icon">⛔</div>
          <h2>Session Closed</h2>
          <p>This attendance session is no longer active or the link is invalid.</p>
        </div>
      </div>
    </div>
  )

  // Success state
  if (result?.success) return (
    <div className="student-page">
      <div className="student-card">
        <div className="student-logo"><div className="logo-mark">CQ</div><span className="s-logo-text">ClassIQ</span></div>
        <div className="student-success-state">
          <div className="success-icon"><CheckCircle size={48} /></div>
          <h2>Attendance Marked!</h2>
          <p>{result.message}</p>
          <p className="close-hint">You can close this tab now.</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="student-page">
      <div className="student-card">
        <div className="student-logo">
          <div className="logo-mark">CQ</div>
          <span className="s-logo-text">ClassIQ</span>
        </div>

        <h1 className="student-title">📚 Mark Attendance</h1>
        {lecture && <p className="student-sub">{lecture}</p>}

        {/* Instructions toggle */}
        <button className="instructions-toggle" onClick={() => setShowInstructions(v => !v)}>
          📖 {showInstructions ? 'Hide' : 'How to Use This System'}
        </button>

        {showInstructions && (
          <div className="instructions-box animate-fade-in">
            <p><strong>Steps:</strong></p>
            <ol className="instructions-list">
              <li>Allow location access when prompted</li>
              <li>Enter your index number below</li>
              <li>Tap "Mark Attendance"</li>
              <li>Close the tab once confirmed</li>
            </ol>
            <div className="instructions-warn">
              <strong>⚠️ Anti-Fraud:</strong> Your GPS is verified. You must be physically present in class. Sharing this link with someone at home will not work.
            </div>
          </div>
        )}

        {/* GPS status */}
        <div className={`gps-banner gps-${gpsStatus}`}>
          {gpsStatus === 'waiting'     && '📡 Detecting your location, please wait...'}
          {gpsStatus === 'ok'          && '✅ Location verified. You may mark attendance.'}
          {gpsStatus === 'denied'      && '❌ Location access denied. You must allow GPS to mark attendance.'}
          {gpsStatus === 'unsupported' && '❌ GPS not supported on this browser.'}
        </div>

        {/* Error from submission */}
        {result && !result.success && (
          <Alert variant="error" onClose={() => setResult(null)} style={{ marginBottom: 12 }}>
            {result.message}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={submit} className="student-form">
          <div className="field">
            <label className="field-label">Index Number</label>
            <input
              className="field-input"
              placeholder="Enter your index number"
              value={indexNumber}
              onChange={e => setIndexNumber(e.target.value.toUpperCase())}
              required
              style={{ textTransform: 'uppercase', fontSize: '1.1rem', padding: '12px 16px' }}
            />
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={submitting}
            disabled={gpsStatus !== 'ok'}
            style={{ marginTop: 8 }}
          >
            ✓ Mark Attendance
          </Button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--muted)', marginTop: 12 }}>
          Please close this tab after marking attendance.
        </p>

        <div style={{ borderTop: '1px solid var(--border)', marginTop: 20, paddingTop: 16, textAlign: 'center' }}>
          <button
            onClick={() => document.getElementById('issue-form').classList.toggle('hidden')}
            style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
          >
            📝 Having problems? Report an Issue
          </button>
          <IssueForm classrepId={classrep_id} lecture={lecture} />
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <a href="https://luckytriplegame.com">
            <Button variant="secondary" size="sm">🎮 Play Lucky Triple</Button>
          </a>
        </div>
      </div>
    </div>
  )
}

function IssueForm({ classrepId, lecture }) {
  const [form, setForm]     = useState({ index_number: '', message: '' })
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await studentApi.markAttendance({ ...form, report_issue: true, classrep_id: classrepId, lecture_name: lecture })
      setSent(true)
    } catch {} finally { setLoading(false) }
  }

  return (
    <div id="issue-form" className="hidden" style={{ marginTop: 16, textAlign: 'left' }}>
      {sent ? <Alert variant="success">Issue reported — admin will review.</Alert> : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input className="field-input" placeholder="Your index number" value={form.index_number} onChange={e => setForm(f => ({ ...f, index_number: e.target.value.toUpperCase() }))} required style={{ textTransform: 'uppercase' }} />
          <textarea className="field-textarea" placeholder="Describe your issue..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} required />
          <Button type="submit" loading={loading} size="sm">Submit Issue</Button>
        </form>
      )}
    </div>
  )
}

import { Link } from 'react-router-dom'
import { Users, GraduationCap } from 'lucide-react'
import '../classrep/auth.css'

export default function RoleSelectPage() {
  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-up">
        <div className="auth-logo">
          <div className="logo-mark" style={{ width: 48, height: 48, fontSize: '1.1rem' }}>CQ</div>
          <h1 className="auth-title">Join ClassIQ</h1>
          <p className="auth-sub">Choose how you will use ClassIQ</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          <Link to="/register" className="role-card" style={{ textDecoration: 'none' }}>
            <Users size={28} style={{ color: 'var(--blue)' }} />
            <div>
              <p style={{ fontWeight: 700, margin: 0, color: 'var(--text)' }}>Class Representative</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--muted)' }}>
                Manage your class, students, and lecture attendance
              </p>
            </div>
          </Link>

          <Link to="/register/lecturer" className="role-card" style={{ textDecoration: 'none' }}>
            <GraduationCap size={28} style={{ color: 'var(--blue)' }} />
            <div>
              <p style={{ fontWeight: 700, margin: 0, color: 'var(--text)' }}>Lecturer</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--muted)' }}>
                Teach your course and track weekly topic attendance
              </p>
            </div>
          </Link>
        </div>

        <p className="auth-foot" style={{ marginTop: 24 }}>
          Already have an account? <Link to="/login" className="auth-link">Log in</Link>
        </p>
      </div>
    </div>
  )
}

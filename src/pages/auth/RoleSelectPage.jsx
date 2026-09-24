import { Link } from 'react-router-dom'
import { Users, GraduationCap, ArrowRight } from 'lucide-react'
import './role-select.css'

export default function RoleSelectPage() {
  return (
    <div className="role-page">
      <section className="role-visual" aria-hidden="true">
        <div className="role-visual-glow" />
        <img src="/clock.jpg" alt="" className="role-visual-img" />
      </section>

      <section className="role-panel">
        <div className="role-panel-bg" aria-hidden="true" />
        <div className="role-panel-inner">
          <Link to="/" className="role-brand">ClassIQ</Link>
          <h1 className="role-title">Join ClassIQ</h1>
          <p className="role-sub">Choose how you will use ClassIQ. You can sign up as a class representative or a lecturer.</p>

          <div className="role-choices">
            <Link to="/register" className="role-choice role-choice-rep">
              <span className="role-choice-icon"><Users size={22} /></span>
              <span className="role-choice-copy">
                <span className="role-choice-title">Class Representative</span>
                <span className="role-choice-desc">Manage your class, students, and lecture attendance</span>
              </span>
              <ArrowRight size={18} className="role-choice-arrow" />
            </Link>

            <Link to="/register/lecturer" className="role-choice role-choice-lecturer">
              <span className="role-choice-icon"><GraduationCap size={22} /></span>
              <span className="role-choice-copy">
                <span className="role-choice-title">Lecturer</span>
                <span className="role-choice-desc">Teach your course and track weekly topic attendance</span>
              </span>
              <ArrowRight size={18} className="role-choice-arrow" />
            </Link>
          </div>

          <p className="role-foot">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </section>
    </div>
  )
}

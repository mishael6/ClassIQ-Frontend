import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './landing.css'

export default function LandingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const user = localStorage.getItem('classiq_user')
    if (user) {
      try {
        const p = JSON.parse(user)
        navigate(p.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
      } catch {}
    }
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll('.lp-reveal')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('lp-visible') }),
      { threshold: 0.1 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <div className="lp-root">

      {/* ── Header ── */}
      <header className="lp-header">
        <div className="lp-nav">
          <div className="lp-logo">
            <img src="/logo.png" alt="ClassIQ" className="lp-logo-img" />
            <span>ClassIQ</span>
          </div>
          <div className="lp-nav-btns">
            <Link to="/login"    className="lp-btn lp-ghost">Log in</Link>
            <Link to="/register" className="lp-btn lp-solid">Get started</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-badge">✨ Trusted by 100+ institutions in Ghana</div>
          <h1 className="lp-h1">
            Attendance made<br/>
            <span className="lp-accent">effortless</span>
          </h1>
          <p className="lp-hero-p">
            The smartest way to track student attendance — GPS-verified QR codes,
            real-time records, and instant reports. Built for Ghanaian institutions.
          </p>
          <div className="lp-hero-cta">
            <Link to="/register" className="lp-btn lp-solid lp-lg">Start free →</Link>
            <Link to="/login"    className="lp-btn lp-outline lp-lg">Sign in</Link>
          </div>
          <div className="lp-stats-row">
            {[
              { value: '100+', label: 'Institutions' },
              { value: '10K+', label: 'Students tracked' },
              { value: '99%',  label: 'Accuracy rate' },
              { value: '0',    label: 'Paper used' },
            ].map((s, i) => (
              <div key={i} className="lp-stat-pill">
                <span className="lp-stat-val">{s.value}</span>
                <span className="lp-stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lp-hero-glow" aria-hidden />
      </section>

      {/* ── Trust bar ── */}
      <section className="lp-trust">
        <p className="lp-trust-label">Trusted by leading institutions</p>
        <div className="lp-trust-scroll">
          {['Kumasi Technical University', 'AAMUSTED', 'KNUST', 'University of Mines', 'Garden City University'].map((n, i) => (
            <span key={i} className="lp-trust-item">{n}</span>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="lp-how lp-reveal">
        <div className="lp-section-label">How it works</div>
        <h2 className="lp-h2">Three steps to perfect attendance</h2>
        <div className="lp-steps">
          {[
            { n: '01', color: '#0066ff', title: 'Pin your classroom',   icon: '📍', desc: 'Open ClassIQ, drop a pin on the map where your lecture is held and choose the allowed GPS radius.' },
            { n: '02', color: '#00b57a', title: 'Generate the QR code', icon: '⚡', desc: 'Tap Generate — a unique QR code appears instantly. Display it on your screen or projector.' },
            { n: '03', color: '#7c3aed', title: 'Students scan & done', icon: '✅', desc: 'Students scan with their phone. The system verifies their GPS, records attendance, and flags anything unusual.' },
          ].map((s, i) => (
            <div key={i} className="lp-step" style={{ '--accent': s.color }}>
              <div className="lp-step-icon">{s.icon}</div>
              <div className="lp-step-num" style={{ color: s.color }}>{s.n}</div>
              <h3 className="lp-step-title">{s.title}</h3>
              <p className="lp-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="lp-features lp-reveal">
        <div className="lp-section-label">Features</div>
        <h2 className="lp-h2">Built for the real classroom</h2>
        <div className="lp-features-grid">
          {[
            { icon: '📍', title: 'GPS verification',  desc: 'Students must be physically inside the classroom radius to mark attendance. No proxy marking.' },
            { icon: '🔲', title: 'Live QR sessions',  desc: 'Generate session QR codes that expire when you end the session. Full control in your hands.' },
            { icon: '🚩', title: 'Smart fraud flags', desc: 'Automatic device-sharing detection flags suspicious activity for your review.' },
            { icon: '📊', title: 'Instant analytics', desc: 'See attendance trends, per-student records, and lecture summaries at a glance.' },
            { icon: '💬', title: 'In-app messaging',  desc: 'Report issues and get admin responses directly in the app — no email needed.' },
            { icon: '📱', title: 'SMS notifications', desc: 'Admins can send SMS alerts to class reps directly from the dashboard via Payloqa.' },
          ].map((f, i) => (
            <div key={i} className="lp-feat-card">
              <div className="lp-feat-icon">{f.icon}</div>
              <h3 className="lp-feat-title">{f.title}</h3>
              <p className="lp-feat-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="lp-who lp-reveal">
        <div className="lp-section-label">Who it's for</div>
        <h2 className="lp-h2">Everyone in the classroom</h2>
        <div className="lp-who-grid">
          <div className="lp-who-card lp-who-classrep">
            <div className="lp-who-icon">🎓</div>
            <h3>Class Representatives</h3>
            <p>Generate QR codes, manage your student list, view attendance history, and report issues — all from one clean dashboard.</p>
            <Link to="/register" className="lp-btn lp-solid lp-sm" style={{ marginTop: 'auto', paddingTop: 20, alignSelf: 'flex-start' }}>
              Register as Class Rep →
            </Link>
          </div>
          <div className="lp-who-card lp-who-student">
            <div className="lp-who-icon">📚</div>
            <h3>Students</h3>
            <p>Register once via your class rep's link. Then just scan the QR code each lecture — your phone's GPS does the rest.</p>
            <p className="lp-who-hint" style={{ marginTop: 'auto' }}>Ask your class representative for the registration link</p>
          </div>
          <div className="lp-who-card lp-who-admin">
            <div className="lp-who-icon">🛡️</div>
            <h3>Administrators</h3>
            <p>Approve class reps, monitor attendance across all classes, manage accounts, and send SMS broadcasts from one admin portal.</p>
            <Link to="/admin/login" className="lp-btn lp-outline lp-sm" style={{ marginTop: 'auto', paddingTop: 20, alignSelf: 'flex-start' }}>
              Admin Login →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta lp-reveal">
        <div className="lp-cta-inner">
          <img src="/logo.png" alt="ClassIQ" className="lp-cta-logo" />
          <h2 className="lp-cta-h2">Ready to modernise attendance?</h2>
          <p className="lp-cta-p">
            Join hundreds of class representatives already using ClassIQ across Ghana.
          </p>
          <Link to="/register" className="lp-btn lp-white lp-lg">Get started free →</Link>
        </div>
        <div className="lp-cta-glow" aria-hidden />
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-logo">
            <img src="/logo.png" alt="ClassIQ" className="lp-footer-logo-img" />
            <span>ClassIQ</span>
          </div>
          <p className="lp-footer-copy">© 2026 ClassIQ · Built for Ghanaian students</p>
          <div className="lp-footer-links">
            <Link to="/login">Class Rep Login</Link>
            <Link to="/admin/login">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
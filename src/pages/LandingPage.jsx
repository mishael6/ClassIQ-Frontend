import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './landing.css'

const API = import.meta.env.VITE_API_URL || '/api'

async function trackAndDownload() {
  try {
    await fetch(`${API}/app/download.php`, { method: 'POST' })
  } catch (_) {}
  const a = document.createElement('a')
  a.href = '/app/ClassIQ.apk'
  a.download = 'ClassIQ.apk'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

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
          <div className="lp-badge">🎓 The Academic Ecosystem for Everyone in Education</div>
          <h1 className="lp-h1">
            One platform for the<br/>
            <span className="lp-accent">entire academic journey</span>
          </h1>
          <p className="lp-hero-p">
            ClassIQ brings together smart attendance, AI-powered study tools,
            competitive learning, and a powerful mobile experience — everything
            academia needs, unified in one intelligent ecosystem.
          </p>
          <div className="lp-hero-cta">
            <Link to="/register" className="lp-btn lp-solid lp-lg">Join ClassIQ free (Class Reps) →</Link>
            <button onClick={trackAndDownload} className="lp-btn lp-outline lp-lg" style={{ cursor: 'pointer', border: 'none' }}>
              📱 Download App
            </button>
          </div>
          <div className="lp-stats-row">
            {[
              { value: '100+', label: 'Institutions' },
              { value: '10K+', label: 'Students' },
              { value: '4',    label: 'Core products' },
              { value: '99%',  label: 'Accuracy rate' },
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
        <p className="lp-trust-label">Trusted across Ghanaian institutions</p>
        <div className="lp-trust-scroll">
          {['Kumasi Technical University', 'AAMUSTED', 'KNUST', 'University of Mines', 'Garden City University'].map((n, i) => (
            <span key={i} className="lp-trust-item">{n}</span>
          ))}
        </div>
      </section>

      {/* ── Ecosystem Overview ── */}
      <section className="lp-ecosystem lp-reveal">
        <div className="lp-section-label">The Ecosystem</div>
        <h2 className="lp-h2">Four pillars of academic excellence</h2>
        <p className="lp-ecosystem-intro">
          ClassIQ is not just an attendance tool. It is a complete academic operating system
          designed to help institutions, class representatives, and students thrive together.
        </p>
        <div className="lp-ecosystem-grid">
          {[
            {
              icon: '📍',
              color: '#1A73E8',
              bg: '#1A73E815',
              title: 'Smart Attendance',
              tag: 'For Class Reps & Students',
              desc: 'GPS-verified QR code attendance that eliminates proxy marking. Generate a session, display the code, and watch attendance mark itself in real time.',
              points: ['GPS radius verification', 'Live QR sessions', 'Fraud detection & flagging', 'Instant attendance reports'],
            },
            {
              icon: '🤖',
              color: '#6B46C1',
              bg: '#6B46C115',
              title: 'AI Study Assistant',
              tag: 'Powered by Six',
              desc: 'Meet Six — your personal AI tutor. Upload lecture notes or paste text and Six breaks it down, generates quizzes, flashcards, and study guides in seconds.',
              points: ['Explain complex topics simply', 'Generate MCQ questions', 'Create flashcard sets', 'Fill-in-the-blank exercises'],
            },
            {
              icon: '🏆',
              color: '#D69E2E',
              bg: '#D69E2E15',
              title: 'Trivia & Leaderboard',
              tag: 'Gamified Learning',
              desc: 'Turn studying into competition. AI-generated trivia challenges test students on their courses, award points, and rank them on a global leaderboard.',
              points: ['AI-generated course questions', '15-second timed challenges', 'Mixed question types', 'Global student rankings'],
            },
            {
              icon: '📱',
              color: '#38A169',
              bg: '#38A16915',
              title: 'Mobile App',
              tag: 'Android · iOS coming soon',
              desc: 'The ClassIQ mobile app puts the entire ecosystem in your pocket. Scan QR codes, study with Six, play trivia, and track attendance — anywhere, anytime.',
              points: ['QR code scanner', 'Full AI study access', 'Real-time trivia', 'Attendance history'],
            },
          ].map((p, i) => (
            <div key={i} className="lp-eco-card" style={{ '--eco-color': p.color, '--eco-bg': p.bg }}>
              <div className="lp-eco-card-top">
                <div className="lp-eco-icon" style={{ background: p.bg, color: p.color }}>
                  {p.icon}
                </div>
                <div className="lp-eco-tag">{p.tag}</div>
              </div>
              <h3 className="lp-eco-title" style={{ color: p.color }}>{p.title}</h3>
              <p className="lp-eco-desc">{p.desc}</p>
              <ul className="lp-eco-points">
                {p.points.map((pt, j) => (
                  <li key={j} className="lp-eco-point">
                    <span className="lp-eco-point-dot" style={{ background: p.color }} />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="lp-how lp-reveal">
        <div className="lp-section-label">How it works</div>
        <h2 className="lp-h2">From registration to results</h2>
        <div className="lp-steps">
          {[
            { n: '01', color: '#0066ff', title: 'Register & get approved', icon: '✍️', desc: 'Class reps register on the web app. Once approved by admin, they get access to the full dashboard and a unique student registration link.' },
            { n: '02', color: '#00b57a', title: 'Onboard your students',   icon: '👥', desc: 'Share your registration link with students. They sign up and download the ClassIQ mobile app — ready to go in minutes.' },
            { n: '03', color: '#7c3aed', title: 'Run your class',          icon: '🚀', desc: 'Generate QR codes for attendance, let students study with Six, challenge them with trivia, and monitor everything from your dashboard.' },
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

      {/* ── Who it's for ── */}
      <section className="lp-who lp-reveal">
        <div className="lp-section-label">Who it's for</div>
        <h2 className="lp-h2">Built for everyone in academia</h2>
        <div className="lp-who-grid">
          <div className="lp-who-card lp-who-classrep">
            <div className="lp-who-icon">🎓</div>
            <h3>Class Representatives</h3>
            <p>Manage your class end-to-end. Generate QR attendance, track your students, view detailed reports, and communicate with your admin — all from one dashboard.</p>
            <Link to="/register" className="lp-btn lp-solid lp-sm" style={{ marginTop: 'auto', paddingTop: 20, alignSelf: 'flex-start' }}>
              Register as Class Rep →
            </Link>
          </div>
          <div className="lp-who-card lp-who-student">
            <div className="lp-who-icon">📚</div>
            <h3>Students</h3>
            <p>Mark attendance by scanning a QR code, study smarter with AI, compete in trivia, and track your academic progress — all from the ClassIQ mobile app.</p>
            <button onClick={trackAndDownload} className="lp-btn lp-solid lp-sm" style={{ marginTop: 'auto', background: '#38A169', border: 'none', cursor: 'pointer' }}>
              Download the App →
            </button>
          </div>
          <div className="lp-who-card lp-who-admin">
            <div className="lp-who-icon">🛡️</div>
            <h3>Administrators</h3>
            <p>Oversee your entire institution from one admin portal. Approve class reps, monitor attendance across all classes, send SMS broadcasts, and review analytics.</p>
            <Link to="/admin/login" className="lp-btn lp-outline lp-sm" style={{ marginTop: 'auto', paddingTop: 20, alignSelf: 'flex-start' }}>
              Admin Login →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Getting Started Guide ── */}
      <section className="lp-guide lp-reveal">
        <div className="lp-section-label">Get started</div>
        <h2 className="lp-h2">Up and running in minutes</h2>
        <p className="lp-guide-intro">
          Everything you need to know to get ClassIQ working for your class — from registration to marking attendance.
        </p>
        <div className="lp-guide-grid">
          <div className="lp-guide-card">
            <div className="lp-guide-card-header" style={{ background: 'linear-gradient(135deg, #0066ff, #0044cc)' }}>
              <span className="lp-guide-card-emoji">🎓</span>
              <div>
                <div className="lp-guide-card-tag">Step 1</div>
                <div className="lp-guide-card-title">Sign up as a Class Rep</div>
              </div>
            </div>
            <div className="lp-guide-card-body">
              {[
                { n: 1, text: 'Click "Get started" at the top of this page' },
                { n: 2, text: 'Fill in your name, institution, department, program and contact details' },
                { n: 3, text: 'Click "Create account" to submit your registration' },
                { n: 4, text: 'Wait for admin approval — usually a few hours' },
                { n: 5, text: 'Once approved, sign in and access your full dashboard' },
              ].map((s, i) => (
                <div key={i} className="lp-guide-step">
                  <div className="lp-guide-step-num" style={{ background: '#0066ff22', color: '#0066ff' }}>{s.n}</div>
                  <p className="lp-guide-step-text">{s.text}</p>
                </div>
              ))}
              <Link to="/register" className="lp-guide-cta" style={{ background: '#0066ff' }}>Register now →</Link>
            </div>
          </div>

          <div className="lp-guide-card">
            <div className="lp-guide-card-header" style={{ background: 'linear-gradient(135deg, #00b57a, #008f5e)' }}>
              <span className="lp-guide-card-emoji">👥</span>
              <div>
                <div className="lp-guide-card-tag">Step 2</div>
                <div className="lp-guide-card-title">Set up your class</div>
              </div>
            </div>
            <div className="lp-guide-card-body">
              {[
                { n: 1, text: 'Log into your ClassIQ dashboard after approval' },
                { n: 2, text: 'Copy your unique student registration link from your profile' },
                { n: 3, text: 'Share the link with your students via WhatsApp or any messaging app' },
                { n: 4, text: 'Students register using the link and appear in your student list' },
                { n: 5, text: 'Direct your students to download the ClassIQ mobile app below' },
              ].map((s, i) => (
                <div key={i} className="lp-guide-step">
                  <div className="lp-guide-step-num" style={{ background: '#00b57a22', color: '#00b57a' }}>{s.n}</div>
                  <p className="lp-guide-step-text">{s.text}</p>
                </div>
              ))}
              <a href="#app-download" className="lp-guide-cta" style={{ background: '#00b57a' }}>Download the app ↓</a>
            </div>
          </div>

          <div className="lp-guide-card">
            <div className="lp-guide-card-header" style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
              <span className="lp-guide-card-emoji">📷</span>
              <div>
                <div className="lp-guide-card-tag">Step 3</div>
                <div className="lp-guide-card-title">Mark attendance</div>
              </div>
            </div>
            <div className="lp-guide-card-body">
              {[
                { n: 1, text: 'Go to "Generate QR" in your dashboard at the start of each lecture' },
                { n: 2, text: 'Drop a pin on the map at your exact classroom location' },
                { n: 3, text: 'Set the GPS radius — how far students can be to mark attendance' },
                { n: 4, text: 'Enter the lecture name or number and click "Generate QR Code"' },
                { n: 5, text: 'Display the QR on your screen — students scan with ClassIQ or their camera' },
              ].map((s, i) => (
                <div key={i} className="lp-guide-step">
                  <div className="lp-guide-step-num" style={{ background: '#7c3aed22', color: '#7c3aed' }}>{s.n}</div>
                  <p className="lp-guide-step-text">{s.text}</p>
                </div>
              ))}
              <Link to="/login" className="lp-guide-cta" style={{ background: '#7c3aed' }}>Go to dashboard →</Link>
            </div>
          </div>
        </div>

        <div className="lp-guide-tip">
          <span className="lp-guide-tip-icon">💡</span>
          <p><strong>Pro tip:</strong> End your QR session after class to prevent late entries. Go to your dashboard and click "End Session" when the lecture is over.</p>
        </div>
      </section>

      {/* ── Mobile App Download ── */}
      <section className="lp-app lp-reveal" id="app-download">
        <div className="lp-app-inner">
          <div className="lp-app-content">
            <div className="lp-section-label" style={{ textAlign: 'left' }}>Mobile App</div>
            <h2 className="lp-h2" style={{ textAlign: 'left' }}>
              The ecosystem,<br />
              <span className="lp-accent">in your pocket</span>
            </h2>
            <p className="lp-app-desc">
              The ClassIQ mobile app is the student's gateway to the entire ecosystem.
              Mark attendance, study with Six, compete in trivia, and track your academic
              progress — all from one beautifully designed app.
            </p>
            <div className="lp-app-features">
              {[
                { icon: '📷', title: 'QR Attendance',      desc: 'Scan your class QR code to mark attendance in seconds — GPS verified.' },
                { icon: '🤖', title: 'AI Study with Six',  desc: 'Upload notes and let Six explain, generate MCQs, flashcards and fill-in-the-blank questions.' },
                { icon: '🏆', title: 'Trivia & Rankings',  desc: 'Test your knowledge with AI-generated trivia and climb the global leaderboard.' },
                { icon: '📊', title: 'Attendance History', desc: 'Track your attendance rate and see every lecture you have attended.' },
                { icon: '🌙', title: 'Dark & Light Mode',  desc: 'Switch between beautiful dark and light themes to suit your preference.' },
                { icon: '🔒', title: 'Secure & Private',   desc: 'Your data is encrypted and stored securely. No personal data is ever sold.' },
              ].map((f, i) => (
                <div key={i} className="lp-app-feature-row">
                  <div className="lp-app-feature-icon">{f.icon}</div>
                  <div>
                    <div className="lp-app-feature-title">{f.title}</div>
                    <div className="lp-app-feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lp-app-btns">
              <button onClick={trackAndDownload} className="lp-app-download-btn lp-app-android">
                <div className="lp-app-btn-icon">🤖</div>
                <div className="lp-app-btn-text">
                  <span className="lp-app-btn-sub">Download for</span>
                  <span className="lp-app-btn-main">Android</span>
                </div>
              </button>
              <div className="lp-app-download-btn lp-app-ios lp-app-ios-soon">
                <div className="lp-app-btn-icon">🍎</div>
                <div className="lp-app-btn-text">
                  <span className="lp-app-btn-sub">Coming soon</span>
                  <span className="lp-app-btn-main">iOS / iPhone</span>
                </div>
              </div>
            </div>
            <p className="lp-app-note">📦 Android APK · Free to download · No account needed to install</p>
          </div>

          <div className="lp-app-mockup">
            <div className="lp-phone">
              <div className="lp-phone-screen">
                <div className="lp-phone-notch" />
                <div className="lp-phone-content">
                  <div className="lp-phone-header">
                    <div className="lp-phone-avatar">C</div>
                    <div>
                      <div className="lp-phone-name">ClassIQ</div>
                      <div className="lp-phone-sub">Academic Ecosystem</div>
                    </div>
                  </div>
                  <div className="lp-phone-cards">
                    {[
                      { icon: '📷', label: 'Scan QR',    color: '#1A73E8' },
                      { icon: '🤖', label: 'AI Study',   color: '#6B46C1' },
                      { icon: '🏆', label: 'Trivia',     color: '#D69E2E' },
                      { icon: '📊', label: 'Attendance', color: '#38A169' },
                    ].map((c, i) => (
                      <div key={i} className="lp-phone-card" style={{ '--card-color': c.color }}>
                        <span className="lp-phone-card-icon">{c.icon}</span>
                        <span className="lp-phone-card-label">{c.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="lp-phone-banner">
                    <span>🔥 Daily Trivia Challenge</span>
                    <span className="lp-phone-banner-cta">Play →</span>
                  </div>
                  <div className="lp-phone-stat-row">
                    <div className="lp-phone-stat">
                      <span className="lp-phone-stat-val" style={{ color: '#1A73E8' }}>12</span>
                      <span className="lp-phone-stat-lbl">Classes</span>
                    </div>
                    <div className="lp-phone-stat">
                      <span className="lp-phone-stat-val" style={{ color: '#38A169' }}>94%</span>
                      <span className="lp-phone-stat-lbl">Rate</span>
                    </div>
                    <div className="lp-phone-stat">
                      <span className="lp-phone-stat-val" style={{ color: '#D69E2E' }}>48</span>
                      <span className="lp-phone-stat-lbl">Points</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lp-app-glow" aria-hidden />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta lp-reveal">
        <div className="lp-cta-inner">
          <img src="/logo.png" alt="ClassIQ" className="lp-cta-logo" />
          <h2 className="lp-cta-h2">Join the academic ecosystem</h2>
          <p className="lp-cta-p">
            Thousands of students and class representatives across Ghana are already
            using ClassIQ to learn smarter, attend better, and compete harder.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="lp-btn lp-white lp-lg">Get started free →</Link>
            <button onClick={trackAndDownload} className="lp-btn lp-lg" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}>
              📱 Download App
            </button>
          </div>
        </div>
        <div className="lp-cta-glow" aria-hidden />
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-footer-logo">
              <img src="/logo.png" alt="ClassIQ" style={{ width: 24, height: 24 }} />
              <span>ClassIQ</span>
            </div>
            <p className="lp-footer-copy">© 2026 ClassIQ · The Academic Ecosystem</p>
          </div>
          <div className="lp-footer-contact">
            <p className="lp-footer-contact-label">Contact us</p>
            <a href="mailto:classiq660@gmail.com" className="lp-footer-contact-link">✉️ classiq660@gmail.com</a>
            <a href="tel:+233502076920" className="lp-footer-contact-link">📞 0502 076 920</a>
            <a href="https://whatsapp.com/channel/0029VbCbXOOHrDZpFFYw3r0O" target="_blank" rel="noopener noreferrer" className="lp-footer-contact-link lp-footer-whatsapp">
              💬 Join our WhatsApp Channel
            </a>
          </div>
          <div className="lp-footer-links">
            <Link to="/login">Class Rep Login</Link>
            <Link to="/admin/login">Admin</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
'use client'

import { useEffect, useRef } from 'react'
import { Link, useNavigate } from '../lib/navigation.jsx'
import { motion, MotionConfig, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  MessageCircle,
  QrCode,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import './landing.css'

const PWA_URL = 'https://mobile-classiq.netlify.app/'
const EASE = [0.22, 1, 0.36, 1]
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.6, ease: EASE },
}

function ScrollParallax({ children, className, distance = 28 }) {
  const ref = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])

  return <motion.div ref={ref} className={className} style={{ y: prefersReducedMotion ? 0 : y }}>{children}</motion.div>
}

function CartoonVector({ type }) {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true" focusable="false">
      <circle cx="36" cy="36" r="33" fill="#eaf1fb" />

      {type === 'attendance' && (
        <>
          <rect x="17" y="10" width="38" height="51" rx="8" fill="#fff" stroke="#185adb" strokeWidth="2.5" />
          <path d="M17 19a9 9 0 0 1 9-9h20a9 9 0 0 1 9 9v2H17z" fill="#185adb" />
          <path d="M24 29h12v12H24zM27 32h3v3h-3zM32 37h2v2h-2zM24 46h4v4h-4zM31 46h3v3h-3zM37 29h3v3h-3z" fill="#8eb1ff" />
          <circle cx="49" cy="49" r="11" fill="#34a879" stroke="#fff" strokeWidth="2" />
          <path d="m44 49 3 3 6-7" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}

      {type === 'assistant' && (
        <>
          <path d="M36 10v7" stroke="#7559a0" strokeWidth="3" strokeLinecap="round" />
          <circle cx="36" cy="9" r="4" fill="#ffbd58" />
          <rect x="15" y="19" width="42" height="34" rx="12" fill="#fff" stroke="#7559a0" strokeWidth="2.5" />
          <path d="M15 31v-2a10 10 0 0 1 10-10h22a10 10 0 0 1 10 10v2" fill="#e7dcff" />
          <circle cx="28" cy="36" r="3" fill="#7559a0" /><circle cx="44" cy="36" r="3" fill="#7559a0" />
          <path d="M29 44q7 7 14 0" fill="none" stroke="#7559a0" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M26 54v5m20-5v5M22 60h28" stroke="#7559a0" strokeWidth="2.5" strokeLinecap="round" />
          <path d="m56 12 2 4 4 1-4 2-2 4-1-4-4-2 4-1z" fill="#ffbd58" />
        </>
      )}

      {type === 'trivia' && (
        <>
          <path d="M25 17h22v10c0 11-5 17-11 17s-11-6-11-17z" fill="#ffca5c" stroke="#d58b24" strokeWidth="2.5" />
          <path d="M25 23h-7v4c0 7 4 11 11 11m18-15h7v4c0 7-4 11-11 11" fill="none" stroke="#d58b24" strokeWidth="3" strokeLinecap="round" />
          <path d="M36 44v9m-9 5h18m-15-5h12" stroke="#d58b24" strokeWidth="3" strokeLinecap="round" />
          <path d="m19 13 2 4 4 1-4 2-2 4-1-4-4-2 4-1zM53 42l2 3 3 1-3 1-2 3-1-3-3-1 3-1z" fill="#ff9f43" />
          <path d="m36 24 2 4 4 .6-3 3 .7 4-3.7-2-3.7 2 .7-4-3-3 4-.6z" fill="#fff4c6" />
        </>
      )}

      {type === 'representatives' && (
        <>
          <circle cx="36" cy="27" r="9" fill="#f1b98d" />
          <path d="M26 27q1-12 11-12 9 1 10 10l-4-3-5-5-7 6z" fill="#24375c" />
          <path d="M19 58q1-18 17-18t17 18" fill="#185adb" />
          <circle cx="18" cy="35" r="7" fill="#d99770" /><path d="M10 35q1-10 9-9l5 5-6-1-4 2z" fill="#51416f" />
          <path d="M7 57q0-13 11-13 6 0 9 5l-4 10z" fill="#9b8bd0" />
          <circle cx="55" cy="35" r="7" fill="#f2c59d" /><path d="M48 34q0-9 8-9 5 1 7 7l-6-3-5 2z" fill="#2d4953" />
          <path d="M46 50q3-6 10-6 10 0 11 13H47z" fill="#47a58c" />
          <circle cx="51" cy="52" r="6" fill="#ffca5c" stroke="#fff" strokeWidth="2" />
          <path d="m49 52 2 2 3-4" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}

      {type === 'lecturer' && (
        <>
          <rect x="8" y="13" width="41" height="31" rx="4" fill="#fff" stroke="#185adb" strokeWidth="2.5" />
          <path d="M15 35V27h6v8m4 0V22h6v13m4 0v-5h6v5" fill="#91b6ff" />
          <path d="M17 49h24" stroke="#185adb" strokeWidth="3" strokeLinecap="round" />
          <circle cx="54" cy="29" r="7" fill="#f1b98d" />
          <path d="M48 29q1-9 8-8l5 5-6-2-4 3z" fill="#38486b" />
          <path d="M45 57q1-17 10-17t11 17" fill="#7559a0" />
          <path d="m47 38-9 8" stroke="#f1b98d" strokeWidth="3" strokeLinecap="round" />
          <circle cx="37" cy="47" r="2" fill="#ffbd58" />
        </>
      )}

      {type === 'student' && (
        <>
          <path d="M11 42q12-7 25 1 13-8 25-1v17q-12-6-25 2-13-8-25-2z" fill="#fff" stroke="#185adb" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M36 43v18" stroke="#185adb" strokeWidth="2" />
          <circle cx="36" cy="24" r="9" fill="#d99770" />
          <path d="m20 18 16-8 16 8-16 8z" fill="#7559a0" />
          <path d="M29 21v5q7 5 14 0v-5" fill="#ffca5c" />
          <path d="M20 19v8" stroke="#7559a0" strokeWidth="2" strokeLinecap="round" />
          <circle cx="20" cy="29" r="3" fill="#ffbd58" />
        </>
      )}

      {type === 'account' && (
        <>
          <rect x="18" y="12" width="37" height="49" rx="7" fill="#fff" stroke="#185adb" strokeWidth="2.5" />
          <path d="M28 12v-2h17v7H28z" fill="#ffca5c" stroke="#d58b24" strokeWidth="1.5" />
          <path d="M26 29h19m-19 8h13" stroke="#91b6ff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="45" cy="49" r="11" fill="#34a879" stroke="#fff" strokeWidth="2" />
          <path d="m40 49 3 3 6-7" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m13 43-4 12 11-5" fill="#ff9f43" stroke="#d58b24" strokeWidth="1.5" strokeLinejoin="round" />
        </>
      )}

      {type === 'invite' && (
        <>
          <rect x="9" y="27" width="54" height="34" rx="7" fill="#fff" stroke="#185adb" strokeWidth="2.5" />
          <path d="m11 31 25 18 25-18" fill="none" stroke="#91b6ff" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="26" cy="19" r="7" fill="#f1b98d" /><circle cx="45" cy="19" r="7" fill="#d99770" />
          <path d="M17 29q1-9 9-9 7 0 9 9m2 0q1-9 9-9 8 0 9 9" fill="#7559a0" />
          <circle cx="56" cy="48" r="9" fill="#34a879" stroke="#fff" strokeWidth="2" />
          <path d="M56 43v10m-5-5h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {type === 'checkin' && (
        <>
          <rect x="17" y="8" width="38" height="57" rx="9" fill="#fff" stroke="#185adb" strokeWidth="2.5" />
          <rect x="22" y="15" width="28" height="34" rx="3" fill="#eaf1fb" />
          <path d="M26 19h8v8h-8zm3 3v2h2v-2zm12-3h6v6h-6zm-15 13h6v6h-6zm10-2h3v3h-3zm7 4h4v4h-4zm-7 6h3v3h-3z" fill="#185adb" />
          <circle cx="48" cy="49" r="11" fill="#34a879" stroke="#fff" strokeWidth="2" />
          <path d="m43 49 3 3 6-7" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="29" y="54" width="14" height="3" rx="1.5" fill="#91b6ff" />
        </>
      )}
    </svg>
  )
}

const features = [
  {
    illustration: 'attendance',
    tone: 'blue',
    eyebrow: 'Attendance',
    title: 'A clearer record of every class',
    description: 'Create QR attendance sessions with GPS radius verification. See check-ins as they happen, then review attendance history and reports.',
    bullets: ['Live QR sessions', 'GPS checks and fraud flagging', 'Attendance history and reports'],
  },
  {
    illustration: 'assistant',
    tone: 'violet',
    eyebrow: 'Study assistant · Six',
    title: 'Turn lecture notes into active study',
    description: 'Upload notes or paste text for a simpler explanation, then make practice material from the same content.',
    bullets: ['Topic explanations and study guides', 'MCQs and flashcards', 'Fill-in-the-blank practice'],
  },
  {
    illustration: 'trivia',
    tone: 'amber',
    eyebrow: 'Trivia',
    title: 'Make revision more engaging',
    description: 'Challenge yourself with course-based trivia, timed questions, points, and a global student leaderboard.',
    bullets: ['AI-generated questions', '15-second mixed-question rounds', 'Points and global rankings'],
  },
]

const roles = [
  {
    illustration: 'representatives',
    name: 'Class representatives',
    description: 'Organize your class, invite students, run attendance sessions, review reports, and communicate with your administrator from one dashboard.',
    action: 'Register as a class rep',
    to: '/get-started',
    tone: 'green',
  },
  {
    illustration: 'lecturer',
    name: 'Lecturers',
    description: 'Manage your courses, create QR attendance sessions, and follow weekly topics and student presence.',
    action: 'Register as a lecturer',
    to: '/register/lecturer',
    tone: 'violet',
  },
  {
    illustration: 'student',
    name: 'Students',
    description: 'Scan to check in, keep track of attendance, study with Six, and take part in course trivia.',
    action: 'Get the student app',
    href: PWA_URL,
    tone: 'blue',
  },
]

function Brand({ footer = false }) {
  return (
    <span className={`lp-brand${footer ? ' lp-brand-footer' : ''}`}>
      <img src="/logo.png" alt="" className="lp-brand-mark" />
      <span>Class<span className="lp-brand-accent">IQ</span></span>
    </span>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const user = localStorage.getItem('classiq_user')
    if (!user) return
    try {
      const profile = JSON.parse(user)
      if (profile.role === 'admin') return
      navigate(profile.role === 'lecturer' ? '/lecturer' : '/dashboard', { replace: true })
    } catch {
      // Keep the public landing page available if a saved profile is malformed.
    }
  }, [navigate])

  return (
    <MotionConfig reducedMotion="user">
      <div className="lp-root">
        <header className="lp-header">
          <div className="lp-nav lp-container">
            <Link to="/" className="lp-brand-link" aria-label="ClassIQ home"><Brand /></Link>
            <nav className="lp-nav-links" aria-label="Main navigation">
              <a href="#platform">Platform</a>
              <a href="#how-it-works">How it works</a>
              <a href="#for-everyone">Who it’s for</a>
            </nav>
            <div className="lp-nav-actions">
              <Link to="/login" className="lp-login-link">Log in</Link>
              <Link to="/get-started" className="lp-button lp-button-primary lp-button-nav">Get started <ArrowRight size={16} /></Link>
            </div>
          </div>
        </header>

        <main>
          <section className="lp-hero">
            <div className="lp-container lp-hero-grid">
              <motion.div className="lp-hero-copy" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } } }}>
                <motion.div className="lp-eyebrow" variants={reveal}><span className="lp-eyebrow-mark"><GraduationCap size={15} /></span> Learning and class operations, together</motion.div>
                <motion.h1 variants={reveal}>Make every class <span>count.</span></motion.h1>
                <motion.p className="lp-hero-description" variants={reveal}>ClassIQ brings attendance, study support, and class tools into one connected platform for lecturers, class representatives, and students.</motion.p>
                <motion.div className="lp-hero-actions" variants={reveal}>
                  <Link to="/get-started" className="lp-button lp-button-primary lp-button-large">Get started <ArrowRight size={18} /></Link>
                  <a href="#platform" className="lp-button lp-button-secondary lp-button-large">Explore ClassIQ <ChevronRight size={17} /></a>
                </motion.div>
              </motion.div>
            </div>
          </section>

          <section className="lp-intro-strip" aria-label="ClassIQ summary">
            <div className="lp-container lp-intro-inner">
              <p>One connected experience for the moments before, during, and after class.</p>
              <div className="lp-intro-items"><span><QrCode size={17} /> Check in</span><span><Sparkles size={17} /> Learn actively</span><span><BarChart3 size={17} /> Track progress</span></div>
            </div>
          </section>

          <section className="lp-section lp-platform" id="platform">
            <div className="lp-container">
              <motion.div className="lp-section-heading" {...reveal}>
                <span className="lp-section-kicker">THE CLASSIQ PLATFORM</span>
                <h2>Less admin. More learning.</h2>
                <p>Purpose-built tools help your class stay organized and give students a better way to keep learning.</p>
              </motion.div>
              <ScrollParallax className="lp-feature-parallax" distance={18}>
                <div className="lp-feature-grid">
                  {features.map((feature, index) => {
                    return (
                      <motion.article className={`lp-feature-card lp-tone-${feature.tone}`} key={feature.title} {...reveal} transition={{ ...reveal.transition, delay: index * 0.08 }}>
                        <div className="lp-feature-top"><span className="lp-feature-icon"><CartoonVector type={feature.illustration} /></span><span className="lp-feature-eyebrow">{feature.eyebrow}</span></div>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                        <ul>{feature.bullets.map((bullet) => <li key={bullet}><Check size={15} />{bullet}</li>)}</ul>
                      </motion.article>
                    )
                  })}
                </div>
              </ScrollParallax>
            </div>
          </section>

          <section className="lp-six-section">
            <div className="lp-container lp-six-grid">
              <motion.div className="lp-six-copy" {...reveal}>
                <span className="lp-section-kicker lp-kicker-light"><Sparkles size={14} /> MEET SIX</span>
                <h2>A study partner that starts with your notes.</h2>
                <p>Six helps students work with the material they already have. Upload lecture notes or paste text, then turn it into clearer explanations and focused practice.</p>
                <ul className="lp-six-list">
                  <li><CheckCircle2 size={18} /> Break down complex topics</li>
                  <li><CheckCircle2 size={18} /> Generate MCQs and flashcards</li>
                  <li><CheckCircle2 size={18} /> Practise with fill-in-the-blank questions</li>
                </ul>
                <a href={PWA_URL} target="_blank" rel="noopener noreferrer" className="lp-button lp-button-light">Study with Six <ArrowUpRight size={17} /></a>
              </motion.div>
              <ScrollParallax className="lp-six-image-parallax" distance={34}>
                <motion.figure className="lp-six-image" {...reveal} transition={{ ...reveal.transition, delay: 0.12 }}>
                  <img src="/classiq-student-learning.jpg" alt="A student studying online at home with headphones and a laptop" />
                  <figcaption className="lp-six-image-caption">
                    <span className="lp-six-image-caption-icon"><Sparkles size={18} /></span>
                    <span><strong>Learn with Six</strong><small>Clear explanations and practice from your notes.</small></span>
                  </figcaption>
                </motion.figure>
              </ScrollParallax>
            </div>
          </section>

          <section className="lp-section lp-roles" id="for-everyone">
            <div className="lp-container">
              <motion.div className="lp-section-heading" {...reveal}>
                <span className="lp-section-kicker">MADE FOR YOUR ROLE</span>
                <h2>Everyone has a place in class.</h2>
                <p>Choose the path that fits you. ClassIQ connects the work happening across your academic community.</p>
              </motion.div>
              <div className="lp-role-grid">
                {roles.map((role, index) => {
                  return (
                    <motion.article className={`lp-role-card lp-tone-${role.tone}`} key={role.name} {...reveal} transition={{ ...reveal.transition, delay: index * 0.06 }}>
                      <span className="lp-role-icon"><CartoonVector type={role.illustration} /></span>
                      <h3>{role.name}</h3>
                      <p>{role.description}</p>
                      {role.href ? <a className="lp-text-link" href={role.href} target="_blank" rel="noopener noreferrer">{role.action}<ArrowUpRight size={16} /></a> : <Link className="lp-text-link" to={role.to}>{role.action}<ArrowRight size={16} /></Link>}
                    </motion.article>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="lp-process-section" id="how-it-works">
            <div className="lp-container">
              <motion.div className="lp-section-heading" {...reveal}>
                <span className="lp-section-kicker">A SIMPLE START</span>
                <h2>Get your class moving in three steps.</h2>
                <p>From setup to a more organized lecture routine, the essentials are straightforward.</p>
              </motion.div>
              <div className="lp-process-grid">
                <motion.article className="lp-process-card" {...reveal}>
                  <span className="lp-process-number">01</span><span className="lp-process-icon"><CartoonVector type="account" /></span>
                  <h3>Create your account</h3><p>Class representatives register with their institution and class details. An administrator reviews and approves the request. Lecturers can register directly.</p>
                </motion.article>
                <motion.article className="lp-process-card" {...reveal} transition={{ ...reveal.transition, delay: 0.08 }}>
                  <span className="lp-process-number">02</span><span className="lp-process-icon"><CartoonVector type="invite" /></span>
                  <h3>Bring students in</h3><p>After approval, class reps share their unique registration link. Students join the class and install the mobile app to access their learning tools.</p>
                </motion.article>
                <motion.article className="lp-process-card" {...reveal} transition={{ ...reveal.transition, delay: 0.16 }}>
                  <span className="lp-process-number">03</span><span className="lp-process-icon"><CartoonVector type="checkin" /></span>
                  <h3>Run and review class</h3><p>Start a QR session, set the classroom location and radius, then display the code. End the session after class and review attendance reports.</p>
                </motion.article>
              </div>
              <motion.div className="lp-process-note" {...reveal}><Clock3 size={18} /><p><strong>Useful tip:</strong> End your QR session when the lecture is over to prevent late check-ins.</p></motion.div>
            </div>
          </section>

          <section className="lp-mobile-section" id="mobile-app">
            <div className="lp-container lp-mobile-grid">
              <motion.div className="lp-mobile-copy" {...reveal}>
                <span className="lp-section-kicker">CLASSIQ ON MOBILE</span>
                <h2>Your class tools, ready when you are.</h2>
                <p>The student app brings attendance, study, and trivia together on Android and iPhone. Install ClassIQ as a progressive web app—no app store required.</p>
              <div className="lp-mobile-benefits">
                  <span><ScanLine size={17} /> Scan class QR codes</span>
                  <span><Bot size={17} /> Study with Six</span>
                  <span><Trophy size={17} /> Play trivia and track rankings</span>
                  <span><BarChart3 size={17} /> Review attendance history</span>
                <span><Smartphone size={17} /> Dark and light themes</span>
                </div>
                <a href={PWA_URL} target="_blank" rel="noopener noreferrer" className="lp-button lp-button-primary lp-button-large">Open the ClassIQ app <ArrowUpRight size={18} /></a>
                <p className="lp-mobile-note"><Smartphone size={15} /> Free to install · Android and iOS · No app store needed</p>
              </motion.div>
              <ScrollParallax className="lp-mobile-parallax" distance={24}>
              <motion.div className="lp-mobile-visual" {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} aria-hidden="true">
                <div className="lp-mobile-halo" />
                <div className="lp-phone-shell">
                  <div className="lp-phone-camera" />
                  <div className="lp-phone-screen">
                    <div className="lp-phone-greeting"><span className="lp-phone-logo"><img src="/logo.png" alt="" /></span><span><small>CLASSIQ STUDENT</small><strong>Your class, at a glance</strong></span><span className="lp-phone-profile">S</span></div>
                    <div className="lp-phone-today"><span>YOUR LEARNING SPACE</span><strong>Stay ready for what’s next.</strong><small>Attendance · Study · Class updates</small></div>
                    <div className="lp-phone-action"><span className="lp-phone-action-icon"><QrCode size={19} /></span><span><strong>Mark attendance</strong><small>Scan a class QR code</small></span><ChevronRight size={17} /></div>
                    <div className="lp-phone-action"><span className="lp-phone-action-icon lp-phone-ai"><Sparkles size={19} /></span><span><strong>Study with Six</strong><small>Make more of your notes</small></span><ChevronRight size={17} /></div>
                    <div className="lp-phone-action"><span className="lp-phone-action-icon lp-phone-trivia"><Trophy size={19} /></span><span><strong>Course trivia</strong><small>Practise and earn points</small></span><ChevronRight size={17} /></div>
                    <div className="lp-phone-nav"><span><BookOpen size={16} />Learn</span><span><BarChart3 size={16} />Progress</span><span><Users size={16} />Classes</span></div>
                  </div>
                </div>
                <div className="lp-mobile-float lp-mobile-float-a"><span><Check size={14} /></span>Check in with QR</div>
                <div className="lp-mobile-float lp-mobile-float-b"><Sparkles size={15} /> Keep learning</div>
              </motion.div>
              </ScrollParallax>
            </div>
          </section>

          <section className="lp-cta-section">
            <div className="lp-container">
              <motion.div className="lp-cta-panel" {...reveal}>
                <div className="lp-cta-decoration lp-cta-decoration-one" aria-hidden="true" /><div className="lp-cta-decoration lp-cta-decoration-two" aria-hidden="true" />
                <div className="lp-cta-copy"><span className="lp-cta-kicker"><GraduationCap size={15} /> YOUR NEXT CLASS STARTS HERE</span><h2>Bring your academic community together.</h2><p>Make attendance easier to manage and give students more ways to learn between lectures.</p></div>
                <div className="lp-cta-actions"><Link to="/get-started" className="lp-button lp-button-white lp-button-large">Get started <ArrowRight size={18} /></Link><Link to="/login" className="lp-cta-login">Already have an account? Log in</Link></div>
              </motion.div>
            </div>
          </section>
        </main>

        <footer className="lp-footer">
          <div className="lp-container">
            <div className="lp-footer-main">
              <div className="lp-footer-about"><Link to="/" className="lp-brand-link" aria-label="ClassIQ home"><Brand footer /></Link><p>Tools for class operations, student learning, and the people who make both happen.</p><span className="lp-footer-note"><ShieldCheck size={15} /> Data is encrypted and stored securely. Personal data is never sold.</span></div>
              <nav className="lp-footer-column" aria-label="Explore ClassIQ"><h3>Explore</h3><a href="#platform">Platform</a><a href="#for-everyone">Who it’s for</a><a href="#how-it-works">How it works</a><a href={PWA_URL} target="_blank" rel="noopener noreferrer">Student app <ArrowUpRight size={13} /></a></nav>
              <nav className="lp-footer-column" aria-label="Account links"><h3>Account</h3><Link to="/get-started">Get started</Link><Link to="/login">Log in</Link><Link to="/register/lecturer">Lecturer registration</Link></nav>
              <div className="lp-footer-column lp-footer-contact"><h3>Contact</h3><a href="mailto:classiq660@gmail.com">classiq660@gmail.com</a><a href="tel:+233502076920">0502 076 920</a><a href="https://whatsapp.com/channel/0029VbCbXOOHrDZpFFYw3r0O" target="_blank" rel="noopener noreferrer"><MessageCircle size={15} /> WhatsApp channel <ArrowUpRight size={13} /></a></div>
            </div>
            <div className="lp-footer-bottom"><span>© 2026 ClassIQ. All rights reserved.</span><Link to="/privacy">Privacy policy</Link><span className="lp-footer-locale">For higher education <span>•</span> Android and iOS</span></div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { adminApi } from '../../lib/api'
import { Alert, Button, Card, PageHeader } from '../../components/ui'
import { SmsBatchBadges } from '../../components/admin/SmsBatchBadges'
import { Link, useNavigate } from '../../lib/navigation.jsx'
import {
  Activity, AlertCircle, ArrowRight, ArrowUpRight, Bell, CheckCircle2,
  ClipboardList, Download, GraduationCap, MessageSquare, QrCode, Send,
  ShieldCheck, Smartphone, Sparkles, Trophy, UserPlus, Users, X, Zap,
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import { downloadCsv, escapeCsv } from '../../lib/exportCsv'
import '../../components/ui/components.css'
import './admindashboard.css'

const number = value => Number(value || 0).toLocaleString()
const money = value => `GHS ${Number(value || 0).toFixed(2)}`

function DaysRemainingBadge({ days }) {
  const value = Number(days)
  const status = value <= 3 ? 'critical' : value <= 7 ? 'soon' : 'normal'
  return <span className={`ad-expiry ad-expiry-${status}`}>{value === 0 ? 'Expires today' : `${value} days left`}</span>
}

function MetricCard({ label, value, detail, icon: Icon, tone, href }) {
  const content = <>
    <div className="ad-metric-top"><span>{label}</span><span className={`ad-metric-icon ${tone}`}><Icon size={19}/></span></div>
    <div className="ad-metric-value">{number(value)}</div>
    <div className="ad-metric-detail">{detail}<ArrowRight size={14}/></div>
  </>
  return href ? <Link className="ad-metric-card" to={href}>{content}</Link> : <div className="ad-metric-card">{content}</div>
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [trivia, setTrivia] = useState([])
  const [pendingClassreps, setPendingClassreps] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState(14)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkMsg, setBulkMsg] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkResult, setBulkResult] = useState(null)
  const [bulkError, setBulkError] = useState('')
  const [promptLimit, setPromptLimit] = useState(30)
  const [promptLimitInput, setPromptLimitInput] = useState('30')
  const [promptLimitSaving, setPromptLimitSaving] = useState(false)
  const [promptLimitMsg, setPromptLimitMsg] = useState('')
  const [promptLimitErr, setPromptLimitErr] = useState('')

  useEffect(() => {
    Promise.allSettled([adminApi.getDashboard(), adminApi.getTriviaLeaderboard(5), adminApi.getAiSettings(), adminApi.getClassreps({ status: 'pending' })])
      .then(([dash, triviaRes, aiRes, classrepRes]) => {
        if (dash.status === 'fulfilled') setData(dash.value.data)
        else setError('Dashboard data could not be loaded. Refresh and try again.')
        if (triviaRes.status === 'fulfilled') setTrivia(triviaRes.value.data.leaderboard || [])
        if (aiRes.status === 'fulfilled') {
          const limit = Number(aiRes.value.data.free_prompt_limit) || 30
          setPromptLimit(limit); setPromptLimitInput(String(limit))
        }
        if (classrepRes.status === 'fulfilled') setPendingClassreps(classrepRes.value.data.classreps?.length || 0)
      }).finally(() => setLoading(false))
  }, [])

  const stats = data?.stats || {}
  const subscriptions = data?.subscriptions || []
  const attendance = data?.chart || []
  const signups = data?.signup_chart || []
  const visibleAttendance = attendance.slice(-range)
  const visibleSignups = signups.slice(-range)
  const expiring = useMemo(() => subscriptions.filter(item => Number(item.days_remaining) >= 0 && Number(item.days_remaining) <= 7)
    .sort((a, b) => Number(a.days_remaining) - Number(b.days_remaining)), [subscriptions])
  const attendanceTotal = visibleAttendance.reduce((sum, day) => sum + Number(day.count || 0), 0)
  const signupTotal = visibleSignups.reduce((sum, day) => sum + Number(day.count || 0), 0)
  const peakDay = visibleAttendance.reduce((best, day) => Number(day.count || 0) > Number(best?.count || 0) ? day : best, null)

  const exportOverview = () => {
    const metrics = [
      ['Total students', stats.total_students], ['Class representatives', stats.total_classreps],
      ['Students without class representative', stats.students_no_classrep], ['Attendance sessions', stats.total_sessions],
      ['Active sessions', stats.active_sessions], ["Today's attendance records", stats.today_attendance],
      ['Total attendance records', stats.total_attendance], ['Pending issues', stats.pending_issues],
      ['Active Six subscribers', stats.active_subscriptions], ['Six subscription revenue (GHS)', Number(stats.subscription_revenue || 0).toFixed(2)],
    ]
    downloadCsv(`classiq-admin-overview-${new Date().toISOString().slice(0, 10)}.csv`, ['Metric', 'Value'], metrics.map(([label, value]) => [escapeCsv(label), escapeCsv(value ?? 0)]))
  }

  const sendBulkSms = async () => {
    if (!bulkMsg.trim() || bulkMsg.length > 155) return
    setBulkLoading(true); setBulkError(''); setBulkResult(null)
    try { const { data: result } = await adminApi.sendBulkSms(bulkMsg.trim()); setBulkResult(result) }
    catch (err) { setBulkError(err.response?.data?.message || 'Could not send the message. Please try again.') }
    finally { setBulkLoading(false) }
  }
  const closeBulk = () => { setBulkOpen(false); setBulkMsg(''); setBulkResult(null); setBulkError('') }

  const savePromptLimit = async () => {
    const limit = parseInt(promptLimitInput, 10)
    if (!limit || limit < 1 || limit > 999) { setPromptLimitErr('Enter a number between 1 and 999.'); return }
    setPromptLimitSaving(true); setPromptLimitErr(''); setPromptLimitMsg('')
    try {
      const { data: result } = await adminApi.updateAiPromptLimit(limit)
      setPromptLimit(limit); setPromptLimitInput(String(limit)); setPromptLimitMsg(result.message || 'Prompt limit updated.')
    } catch (err) { setPromptLimitErr(err.response?.data?.message || 'Could not update the prompt limit.') }
    finally { setPromptLimitSaving(false) }
  }

  const resetTrivia = () => {
    if (!confirm('Reset the trivia leaderboard? This cannot be undone.')) return
    adminApi.resetTriviaLeaderboard().then(() => setTrivia([])).catch(() => window.alert('Could not reset the trivia leaderboard.'))
  }

  if (loading) return <div className="ad-loading"><span className="ad-spinner"/><span>Preparing your overview…</span></div>

  const actions = [
    { count: Number(stats.pending_issues || 0), label: 'Student reports need review', detail: 'Review submitted issues and close the loop.', to: '/admin/issues', icon: AlertCircle, tone: 'red' },
    { count: pendingClassreps, label: 'Class reps awaiting approval', detail: 'Check new representative applications.', to: '/admin/classreps', icon: Users, tone: 'amber' },
    { count: Number(stats.students_no_classrep || 0), label: 'Students need a class representative', detail: 'Review their information and assign an approved rep.', to: '/admin/students?unassigned=1', icon: UserPlus, tone: 'amber' },
    { count: Number(stats.flagged_total || 0), label: 'Attendance records flagged for review', detail: 'Review records that the system marked for attention.', to: '/admin/attendance', icon: ClipboardList, tone: 'red' },
    { count: Number(stats.active_sessions || 0), label: 'Attendance sessions are live', detail: 'Monitor current QR sessions and check-ins.', to: '/admin/qr-sessions', icon: QrCode, tone: 'green' },
  ].filter(item => item.count > 0)

  return (
    <div className="admin-dashboard animate-fade-up">
      <PageHeader title="Administrator overview" subtitle="A clear view of student activity, attendance, and the work that needs attention."
        actions={<div className="ad-header-actions">
          <Button variant="secondary" size="sm" icon={<Download size={15}/>} onClick={exportOverview}>Export overview</Button>
          <Button variant="secondary" size="sm" icon={<MessageSquare size={15}/>} onClick={() => setBulkOpen(true)}>Message students</Button>
          <Button size="sm" icon={<Bell size={15}/>} onClick={() => navigate('/admin/push')}>Send notification</Button>
        </div>}/>
      {error && <Alert variant="error">{error}</Alert>}

      <section className="ad-welcome">
        <div className="ad-welcome-icon"><ShieldCheck size={22}/></div>
        <div><strong>ClassIQ operations at a glance</strong><p>Use the signals below to spot follow-ups early and keep classes running smoothly.</p></div>
        <span className="ad-updated"><Activity size={14}/> Current platform snapshot</span>
      </section>

      <section className="ad-metrics" aria-label="Key platform metrics">
        <MetricCard label="Students" value={stats.total_students} detail="Open student directory" icon={GraduationCap} tone="blue" href="/admin/students"/>
        <MetricCard label="Class representatives" value={stats.total_classreps} detail="Manage representatives" icon={Users} tone="violet" href="/admin/classreps"/>
        <MetricCard label="Unassigned students" value={stats.students_no_classrep} detail="Review class assignments" icon={UserPlus} tone="amber" href="/admin/students?unassigned=1"/>
        <MetricCard label="Today’s attendance" value={stats.today_attendance} detail="View attendance records" icon={ClipboardList} tone="green" href="/admin/attendance"/>
      </section>

      <section className="ad-main-grid">
        <Card className="ad-panel ad-analytics">
          <div className="ad-panel-head"><div><span className="ad-kicker">ENGAGEMENT</span><h2>Attendance activity</h2><p>Daily attendance records across the selected period.</p></div>
            <div className="ad-range" aria-label="Chart range">{[7, 14].map(days => <button key={days} type="button" aria-pressed={range === days} className={range === days ? 'active' : ''} onClick={() => setRange(days)}>{days} days</button>)}</div>
          </div>
          <div className="ad-chart-summary"><strong>{number(attendanceTotal)}</strong><span>records in this view</span>{peakDay && <span className="ad-peak">Peak: {peakDay.day} ({number(peakDay.count)})</span>}</div>
          {visibleAttendance.length ? <div className="ad-chart"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={visibleAttendance} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4"/>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }}/>
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11}}/>
              <Tooltip cursor={{ fill: 'rgba(37,99,235,.06)' }} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(15,23,42,.08)', fontSize: 12 }}/>
              <Bar dataKey="count" name="Attendance records" fill="var(--blue)" radius={[5, 5, 0, 0]} maxBarSize={34}/>
            </BarChart>
          </ResponsiveContainer></div> : <div className="ad-chart-empty">Attendance activity will appear here when records are available.</div>}
          <div className="ad-chart-foot"><span><i className="ad-legend-dot blue"/>Attendance records</span><Link to="/admin/attendance">Open attendance <ArrowRight size={14}/></Link></div>
        </Card>

        <Card className="ad-panel ad-action-panel">
          <div className="ad-panel-head"><div><span className="ad-kicker">FOLLOW-UP</span><h2>Priority queue</h2><p>Items that may need administrator attention.</p></div><span className="ad-queue-count">{actions.length}</span></div>
          {actions.length ? <div className="ad-action-list">{actions.map(({ count, label, detail, to, icon: Icon, tone }) => <Link to={to} className="ad-action-row" key={label}>
            <span className={`ad-action-icon ${tone}`}><Icon size={17}/></span><span className="ad-action-copy"><strong>{label}</strong><small>{detail}</small></span><span className="ad-action-count">{number(count)}</span><ArrowRight size={15} className="ad-action-arrow"/>
          </Link>)}</div> : <div className="ad-all-clear"><CheckCircle2 size={22}/><strong>You’re all caught up</strong><span>No flagged follow-ups from the current dashboard metrics.</span></div>}
          <div className="ad-shortcuts"><span>Manage</span><Link to="/admin/students"><GraduationCap size={15}/> Students</Link><Link to="/admin/classreps"><Users size={15}/> Class reps</Link><Link to="/admin/attendance"><ClipboardList size={15}/> Attendance</Link></div>
        </Card>
      </section>

      <section className="ad-secondary-grid">
        <Card className="ad-panel">
          <div className="ad-panel-head"><div><span className="ad-kicker">GROWTH</span><h2>Student sign-ups</h2><p>New student accounts by day.</p></div><span className="ad-growth-total"><ArrowUpRight size={15}/>{number(signupTotal)} in view</span></div>
          {visibleSignups.length ? <div className="ad-chart ad-chart-short"><ResponsiveContainer width="100%" height="100%">
            <LineChart data={visibleSignups} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4"/>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }}/>
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11}}/>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12 }}/>
              <Line type="monotone" dataKey="count" name="New students" stroke="var(--green)" strokeWidth={3} dot={{ r: 3, fill: 'var(--green)' }} activeDot={{ r: 5 }}/>
            </LineChart>
          </ResponsiveContainer></div> : <div className="ad-chart-empty">Sign-up activity will appear here when available.</div>}
          <div className="ad-chart-foot"><span><i className="ad-legend-dot green"/>New student accounts</span><Link to="/admin/students">Student directory <ArrowRight size={14}/></Link></div>
        </Card>

        <Card className="ad-panel ad-platform-panel">
          <div className="ad-panel-head"><div><span className="ad-kicker">PLATFORM</span><h2>Operations snapshot</h2><p>Current usage and support signals.</p></div><Zap size={20} className="ad-panel-mark"/></div>
          <div className="ad-snapshot-list">
            <Link to="/admin/qr-sessions"><span className="ad-snapshot-icon blue"><QrCode size={17}/></span><span>Live QR sessions</span><strong>{number(stats.active_sessions)}</strong><ArrowRight size={14}/></Link>
            <div className="ad-snapshot-static"><span className="ad-snapshot-icon blue"><Activity size={17}/></span><span>Attendance sessions</span><strong>{number(stats.total_sessions)}</strong></div>
            <Link to="/admin/attendance"><span className="ad-snapshot-icon green"><ClipboardList size={17}/></span><span>Attendance records</span><strong>{number(stats.total_attendance)}</strong><ArrowRight size={14}/></Link>
            <Link to="/admin/attendance"><span className="ad-snapshot-icon amber"><AlertCircle size={17}/></span><span>Flagged / outside records</span><strong>{number(stats.flagged_total)} / {number(stats.outside_total)}</strong><ArrowRight size={14}/></Link>
            <Link to="/admin/issues"><span className="ad-snapshot-icon amber"><CheckCircle2 size={17}/></span><span>Resolved reports</span><strong>{number(stats.resolved_issues)}</strong><ArrowRight size={14}/></Link>
            <div className="ad-snapshot-static"><span className="ad-snapshot-icon violet"><Smartphone size={17}/></span><span>Mobile sign-ups</span><strong>{number(stats.mobile_signups)}</strong></div>
            <div className="ad-snapshot-static"><span className="ad-snapshot-icon violet"><Download size={17}/></span><span>App downloads</span><strong>{number(stats.app_downloads)}</strong></div>
          </div>
          <div className="ad-subscription-mini"><span><Sparkles size={15}/> Six subscriptions</span><strong>{number(stats.active_subscriptions)} active</strong><small>{money(stats.subscription_revenue)} recorded revenue</small></div>
        </Card>
      </section>

      <section className="ad-admin-tools-grid">
        <Card className="ad-panel ad-subscriptions">
          <div className="ad-panel-head"><div><span className="ad-kicker">STUDENT SERVICES</span><h2>Subscriptions expiring soon</h2><p>Active Six plans ending within the next seven days.</p></div><span className="ad-queue-count">{expiring.length}</span></div>
          {expiring.length ? <div className="ad-expiring-list">{expiring.slice(0, 6).map((sub, index) => <div className="ad-expiring-row" key={sub.id || `${sub.index_number}-${index}`}>
            <div className="ad-student-avatar">{(sub.student_name || 'S').split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()}</div>
            <div className="ad-expiring-student"><strong>{sub.student_name}</strong><small>{sub.index_number} · {sub.institution || 'Institution not listed'}</small></div>
            <div className="ad-expiring-amount">{money(sub.amount)}</div><DaysRemainingBadge days={sub.days_remaining}/>
          </div>)}</div> : <div className="ad-list-empty"><CheckCircle2 size={18}/> No subscriptions are due to expire this week.</div>}
          {expiring.length > 6 && <p className="ad-list-foot">Showing 6 of {number(expiring.length)} expiring subscriptions.</p>}
        </Card>

        <Card className="ad-panel ad-ai-panel">
          <div className="ad-panel-head"><div><span className="ad-kicker">LEARNING SUPPORT</span><h2>Six AI chat access</h2><p>Set free prompts available per student every two hours.</p></div><Sparkles size={20} className="ad-panel-mark"/></div>
          <div className="ad-prompt-current"><span>Current free chat limit</span><strong>{number(promptLimit)} <small>prompts / 2 hours</small></strong></div>
          {promptLimitErr && <Alert variant="error" onClose={() => setPromptLimitErr('')}>{promptLimitErr}</Alert>}
          {promptLimitMsg && <Alert variant="success" onClose={() => setPromptLimitMsg('')}>{promptLimitMsg}</Alert>}
          <div className="ad-prompt-form"><label htmlFor="admin-prompt-limit">New limit</label><div><input id="admin-prompt-limit" type="number" min="1" max="999" value={promptLimitInput} onChange={e => setPromptLimitInput(e.target.value)} disabled={promptLimitSaving}/><Button size="sm" onClick={savePromptLimit} loading={promptLimitSaving}>Save limit</Button></div></div>
          <p className="ad-ai-note">Subscribers and admin-granted students continue to have unlimited access.</p>
        </Card>
      </section>

      <section className="ad-secondary-grid ad-bottom-grid">
        <Card className="ad-panel ad-trivia-panel">
          <div className="ad-panel-head"><div><span className="ad-kicker">STUDENT ENGAGEMENT</span><h2>Trivia leaderboard</h2><p>Top student scores from the learning quiz.</p></div><Trophy size={20} className="ad-panel-mark"/></div>
          {trivia.length ? <div className="ad-trivia-list">{trivia.map((student, index) => <div className="ad-trivia-row" key={student.student_id}>
            <span className={`ad-rank rank-${index + 1}`}>{index + 1}</span><div><strong>{student.name}</strong><small>{[student.institution, student.program].filter(Boolean).join(' · ')}</small></div><b>{number(student.total_points)} <small>pts</small></b>
          </div>)}</div> : <div className="ad-list-empty">No trivia scores are available yet.</div>}
          <button className="ad-reset-link" type="button" onClick={resetTrivia} disabled={!trivia.length}>Reset leaderboard</button>
        </Card>

        <Card className="ad-panel ad-quick-panel">
          <div className="ad-panel-head"><div><span className="ad-kicker">ADMIN TOOLS</span><h2>Quick access</h2><p>Common tasks for day-to-day administration.</p></div></div>
          <div className="ad-quick-grid">
            <Link to="/admin/students"><GraduationCap size={18}/><span>Manage students</span><ArrowRight size={14}/></Link>
            <Link to="/admin/classreps"><Users size={18}/><span>Manage class reps</span><ArrowRight size={14}/></Link>
            <Link to="/admin/attendance"><ClipboardList size={18}/><span>Review attendance</span><ArrowRight size={14}/></Link>
            <Link to="/admin/qr-sessions"><QrCode size={18}/><span>QR sessions</span><ArrowRight size={14}/></Link>
            <button type="button" onClick={() => setBulkOpen(true)}><MessageSquare size={18}/><span>Message students</span><ArrowRight size={14}/></button>
            <button type="button" onClick={() => navigate('/admin/push')}><Bell size={18}/><span>Send notification</span><ArrowRight size={14}/></button>
          </div>
        </Card>
      </section>

      {bulkOpen && <div className="ad-modal-backdrop" onClick={closeBulk}>
        <div className="ad-modal" role="dialog" aria-modal="true" aria-labelledby="ad-sms-title" onClick={e => e.stopPropagation()}>
          <div className="ad-modal-head"><div><span className="ad-kicker">COMMUNICATION</span><h2 id="ad-sms-title">Message all students</h2><p>Send one SMS announcement to the student list.</p></div><button type="button" aria-label="Close" onClick={closeBulk}><X size={19}/></button></div>
          {bulkError && <Alert variant="error" onClose={() => setBulkError('')}>{bulkError}</Alert>}
          {bulkResult && <Alert variant="success">{bulkResult.message}</Alert>}
          <label className="ad-sms-label" htmlFor="ad-bulk-message">Message</label>
          <textarea id="ad-bulk-message" className="field-textarea" rows={5} maxLength={155} placeholder="Write a short campus or class announcement…" value={bulkMsg} onChange={e => setBulkMsg(e.target.value)} disabled={bulkLoading}/>
          <div className={`ad-sms-count ${bulkMsg.length > 155 ? 'over' : ''}`}>{bulkMsg.length} / 155 characters</div>
          {bulkResult?.batches && <SmsBatchBadges batches={bulkResult.batches}/>}
          <div className="ad-modal-actions"><Button variant="secondary" onClick={closeBulk}>Close</Button><Button onClick={sendBulkSms} loading={bulkLoading} disabled={!bulkMsg.trim() || bulkMsg.length > 155 || Boolean(bulkResult)} icon={<Send size={15}/>}>Send announcement</Button></div>
        </div>
      </div>}
    </div>
  )
}

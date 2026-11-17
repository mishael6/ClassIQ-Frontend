import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../../lib/api'
import { Alert, Badge, Modal } from '../../components/ui'
import {
  Users, CheckCircle, BookOpen, QrCode, Clock, ChevronRight,
  Calendar, TrendingUp, ClipboardList, AlertTriangle, Search,
  ChevronLeft, RefreshCw, GraduationCap, Building2, ArrowUpRight,
  X,
} from 'lucide-react'
import '../../components/ui/components.css'
import './adminattendance.css'

const STUDENTS_PER_PAGE = 25
const fmt = value => Number(value) || 0
const fmtDuration = minutes => {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`
}
const initials = (name = '') => name.trim().split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase()
const localDateValue = date => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function AdminAttendancePage() {
  const today = localDateValue(new Date())
  const [date, setDate] = useState(today)
  const [stats, setStats] = useState({})
  const [classreps, setClassreps] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [students, setStudents] = useState([])
  const [studentsTotal, setStudentsTotal] = useState(0)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [studentsError, setStudentsError] = useState('')
  const [qrSessions, setQrSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionsError, setSessionsError] = useState('')
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [sessionInfo, setSessionInfo] = useState(null)
  const [studentPage, setStudentPage] = useState(1)
  const [studentSearch, setStudentSearch] = useState('')
  const [appliedStudentSearch, setAppliedStudentSearch] = useState('')

  const load = useCallback(async (isRefresh = false) => {
    setError('')
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const response = await adminApi.getDailyAttendance({ date })
      setStats(response.data.stats || {})
      setClassreps(response.data.classreps || [])
    } catch {
      setError('Attendance data could not be loaded. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [date])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!selected || !selectedSessionId) {
      setStudents([])
      setStudentsTotal(0)
      setSessionInfo(null)
      setStudentsLoading(false)
      return
    }
    let cancelled = false
    setStudentsLoading(true)
    setStudentsError('')
    adminApi.getQrSessionAttendance({
      session_id: selectedSessionId,
      search: appliedStudentSearch,
      limit: STUDENTS_PER_PAGE,
      offset: (studentPage - 1) * STUDENTS_PER_PAGE,
    })
      .then(response => {
        if (cancelled) return
        setStudents(response.data.students || [])
        setStudentsTotal(Number(response.data.total) || 0)
        setSessionInfo(response.data.session || null)
      })
      .catch(() => {
        if (cancelled) return
        setStudents([])
        setStudentsTotal(0)
        setSessionInfo(null)
        setStudentsError('Session attendance could not be loaded. Please try again.')
      })
      .finally(() => { if (!cancelled) setStudentsLoading(false) })
    return () => { cancelled = true }
  }, [selected, selectedSessionId, appliedStudentSearch, studentPage])

  useEffect(() => {
    if (!selected) return
    let cancelled = false
    setSessionsLoading(true)
    setSessionsError('')
    setQrSessions([])
    setSelectedSessionId('')
    setStudentPage(1)
    adminApi.getQrSessions({ classrep_id: selected.classrep_id, date, limit: 500, offset: 0 })
      .then(response => {
        if (cancelled) return
        const sessions = response.data.sessions || []
        setQrSessions(sessions)
        if (sessions.length) setSelectedSessionId(String(sessions[0].id))
      })
      .catch(() => { if (!cancelled) setSessionsError('Could not load QR sessions for this representative and date.') })
      .finally(() => { if (!cancelled) setSessionsLoading(false) })
    return () => { cancelled = true }
  }, [selected, date])

  const openRoster = classrep => {
    setSelected(classrep)
    setStudentPage(1)
    setStudentSearch('')
    setAppliedStudentSearch('')
    setStudents([])
    setStudentsTotal(0)
    setStudentsError('')
    setQrSessions([])
    setSessionsError('')
    setSelectedSessionId('')
    setSessionInfo(null)
  }
  const closeRoster = () => {
    setSelected(null)
    setStudents([])
    setStudentsError('')
  }
  const submitStudentSearch = event => {
    event.preventDefault()
    setStudentPage(1)
    setAppliedStudentSearch(studentSearch.trim())
  }
  const changeQrSession = event => {
    setSelectedSessionId(event.target.value)
    setStudentPage(1)
    setStudentSearch('')
    setAppliedStudentSearch('')
    setStudents([])
    setStudentsTotal(0)
    setSessionInfo(null)
  }

  const isToday = date === today
  const dateLabel = isToday
    ? 'Today'
    : new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  const filteredClassreps = classreps.filter(rep =>
    `${rep.classrep_name || ''} ${rep.institution || ''} ${(rep.lectures || []).join(' ')}`
      .toLowerCase().includes(search.trim().toLowerCase()),
  )
  const studentPages = Math.max(1, Math.ceil(studentsTotal / STUDENTS_PER_PAGE))
  const studentRangeStart = studentsTotal ? (studentPage - 1) * STUDENTS_PER_PAGE + 1 : 0
  const studentRangeEnd = Math.min(studentPage * STUDENTS_PER_PAGE, studentsTotal)

  return (
    <main className="att-page">
      <header className="att-page-header">
        <div className="att-heading-copy">
          <div className="att-eyebrow"><ClipboardList size={15} /> Attendance management</div>
          <h1 className="att-title">Attendance overview</h1>
          <p className="att-subtitle">Monitor class attendance and open a QR session to see its student check-ins.</p>
        </div>
        <div className="att-header-controls">
          <div className="att-date-field">
            <label htmlFor="att-date">Report date</label>
            <div className="att-date-control">
              <Calendar size={16} aria-hidden="true" />
              <input id="att-date" type="date" value={date} max={today} onChange={event => setDate(event.target.value)} />
            </div>
          </div>
          <button className="att-refresh-button" type="button" onClick={() => load(true)} disabled={loading || refreshing} aria-label="Refresh attendance">
            <RefreshCw size={16} className={refreshing ? 'att-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      <section className="att-summary" aria-label="Attendance summary">
        <div className="att-summary-intro">
          <span className={`att-status-indicator ${isToday ? 'is-live' : ''}`} />
          <div>
            <p className="att-summary-date">{dateLabel}</p>
            <p className="att-summary-caption">{isToday ? 'Live attendance activity' : 'Historical attendance report'}</p>
          </div>
        </div>
        <div className="att-summary-metrics">
          <SummaryMetric icon={<Users />} label="Active class reps" value={loading ? '—' : fmt(stats.active_classreps)} tone="blue" />
          <SummaryMetric icon={<CheckCircle />} label="Students marked" value={loading ? '—' : fmt(stats.total_students_marked)} tone="green" />
          <SummaryMetric icon={<BookOpen />} label="Lectures held" value={loading ? '—' : fmt(stats.total_lectures)} tone="purple" />
          <SummaryMetric icon={<TrendingUp />} label="Average per rep" value={loading ? '—' : stats.active_classreps ? Math.round(fmt(stats.total_students_marked) / fmt(stats.active_classreps)) : 0} tone="orange" />
        </div>
      </section>

      {error && <Alert variant="error" onClose={() => setError('')} style={{ marginBottom: 18 }}>{error}</Alert>}

      <section className="att-roster-section">
        <div className="att-section-heading">
          <div>
            <p className="att-section-kicker">QR attendance activity</p>
            <h2>Class representatives</h2>
            <p>Choose a QR session to review the students who checked in with that code.</p>
          </div>
          <div className="att-rep-count"><Users size={15} /> {loading ? 'Loading' : `${classreps.length} ${classreps.length === 1 ? 'representative' : 'representatives'}`}</div>
        </div>

        <div className="att-toolbar">
          <label className="att-search-box">
            <Search size={17} aria-hidden="true" />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by representative, institution or lecture" aria-label="Search representatives" />
          </label>
          <span className="att-toolbar-note">Review check-ins by individual QR session</span>
        </div>

        {loading ? (
          <div className="att-rep-grid" aria-label="Loading attendance">
            {[1, 2, 3].map(index => <div className="att-rep-skeleton" key={index} />)}
          </div>
        ) : filteredClassreps.length ? (
          <div className="att-rep-grid">
            {filteredClassreps.map((rep, index) => (
              <article className="att-rep-card" key={rep.classrep_id ?? `${rep.classrep_name}-${index}`}>
                <div className="att-rep-card-head">
                  <div className="att-rep-avatar">{initials(rep.classrep_name)}</div>
                  <div className="att-rep-details">
                    <h3>{rep.classrep_name || 'Class representative'}</h3>
                    <p><Building2 size={13} /> {rep.institution || 'Institution not provided'}</p>
                  </div>
                  <span className="att-qr-count"><QrCode size={14} /> {fmt(rep.qr_count)} QR</span>
                </div>

                <div className="att-rep-facts">
                  <Fact icon={<CheckCircle />} label="Students marked" value={fmt(rep.students_marked)} tone="green" />
                  <Fact icon={<Clock />} label="Average session" value={fmtDuration(rep.avg_duration)} tone="orange" />
                  <Fact icon={<BookOpen />} label="Lectures" value={fmt(rep.lectures_count)} tone="purple" />
                </div>

                <div className="att-rep-card-footer">
                  <div className="att-lecture-list">
                    {(rep.lectures || []).length ? rep.lectures.slice(0, 2).map((lecture, i) => <span key={`${lecture}-${i}`}>{lecture}</span>) : <span className="att-no-lecture">No lecture details</span>}
                    {(rep.lectures || []).length > 2 && <span>+{rep.lectures.length - 2} more</span>}
                  </div>
                  <button className="att-roster-link" type="button" onClick={() => openRoster(rep)}>
                    View QR attendees <ArrowUpRight size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="att-empty-state">
            <div className="att-empty-icon"><ClipboardList size={25} /></div>
            <h3>{search ? 'No matching representatives' : 'No attendance activity found'}</h3>
            <p>{search ? 'Try another search term.' : 'There are no QR attendance sessions for this date. Choose another date to review past activity.'}</p>
          </div>
        )}
      </section>

      <Modal open={!!selected} onClose={closeRoster} title="" width={980}>
        {selected && (
          <div className="att-roster-modal">
            <div className="att-roster-modal-head">
              <div className="att-rep-avatar att-roster-modal-avatar">{initials(selected.classrep_name)}</div>
              <div className="att-roster-title">
                <span className="att-roster-eyebrow"><QrCode size={13} /> QR session attendees</span>
                <h2>{selected.classrep_name}</h2>
                <p>{selected.institution || 'Institution not provided'} <span>·</span> {dateLabel}</p>
              </div>
              <div className="att-roster-total">
                <strong>{studentsLoading && !studentsTotal ? '—' : studentsTotal.toLocaleString()}</strong>
                <span>students marked</span>
              </div>
              <button className="att-roster-close" type="button" onClick={closeRoster} aria-label="Close student roster"><X size={18} /></button>
            </div>

            <div className="att-session-picker-row">
              <label className="att-session-select-field" htmlFor="att-qr-session">
                <span>Choose a QR session</span>
                <select id="att-qr-session" value={selectedSessionId} onChange={changeQrSession} disabled={sessionsLoading || !qrSessions.length}>
                  <option value="">{sessionsLoading ? 'Loading sessions…' : 'Select a QR session'}</option>
                  {qrSessions.map(session => (
                    <option key={session.id} value={session.id}>
                      {session.lecture_name || session.class_name || 'QR attendance'} · {session.created_at ? new Date(session.created_at.replace(' ', 'T')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `Session #${session.id}`}
                    </option>
                  ))}
                </select>
              </label>
              <div className="att-session-picker-note"><Calendar size={14} /> Sessions generated on {dateLabel}</div>
            </div>

            {sessionsError && <Alert variant="error" onClose={() => setSessionsError('')} style={{ margin: '0 0 12px' }}>{sessionsError}</Alert>}

            {sessionInfo && (
              <div className="att-session-info">
                <div><QrCode size={15} /><span>Code</span><strong>{sessionInfo.code || '—'}</strong></div>
                <div><Clock size={15} /><span>Started</span><strong>{sessionInfo.created_at ? new Date(sessionInfo.created_at.replace(' ', 'T')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</strong></div>
                <div><Users size={15} /><span>Checked in</span><strong>{studentsTotal.toLocaleString()}</strong></div>
                <div><span className={`att-session-live-dot ${sessionInfo.ended_at ? '' : 'is-live'}`} /><span>Session</span><strong>{sessionInfo.ended_at ? 'Ended' : 'Active'}</strong></div>
              </div>
            )}
            <p className="att-legacy-note">Older attendance is included only when it can be matched unambiguously to one QR session.</p>

            {!sessionsLoading && !sessionsError && !qrSessions.length ? (
              <div className="att-session-empty"><QrCode size={23} /><strong>No QR sessions for this date</strong><span>Choose another date to review sessions generated by this representative.</span></div>
            ) : selectedSessionId ? (
              <>
                <form className="att-roster-toolbar" onSubmit={submitStudentSearch}>
                  <label className="att-search-box att-roster-search">
                    <Search size={16} aria-hidden="true" />
                    <input value={studentSearch} onChange={event => setStudentSearch(event.target.value)} placeholder="Search attendees by name, index or program" aria-label="Search session attendees" />
                  </label>
                  <button className="att-search-submit" type="submit">Search attendees</button>
                  <span className="att-roster-date"><CheckCircle size={14} /> Students marked with this QR code</span>
                </form>

                {studentsError && <Alert variant="error" onClose={() => setStudentsError('')} style={{ margin: '0 0 12px' }}>{studentsError}</Alert>}
                <div className="att-student-table-wrap">
                  <table className="att-student-table">
                    <thead><tr><th>Student</th><th>Index number</th><th>Program</th><th>Level</th><th>Time marked</th><th>Status</th></tr></thead>
                    <tbody>
                      {studentsLoading ? (
                        <tr><td colSpan="6" className="att-table-message">Loading QR session attendees…</td></tr>
                      ) : students.length ? students.map((student, index) => (
                        <tr key={student.student_id ?? student.index_number ?? `${student.name}-${index}`}>
                          <td><div className="att-student-identity"><span className="att-student-avatar">{initials(student.name)}</span><span>{student.name || 'Unnamed student'}</span></div></td>
                          <td><code>{student.index_number || '—'}</code></td>
                          <td>{student.program || '—'}</td>
                          <td>{student.level ? `Level ${student.level}` : '—'}</td>
                          <td>{student.time_marked ? new Date(student.time_marked.replace(' ', 'T')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                          <td>{student.attendance_status === 'Flagged'
                            ? <Badge variant="flagged"><AlertTriangle size={13} /> Flagged</Badge>
                            : <Badge variant="present"><CheckCircle size={13} /> Present</Badge>}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="6" className="att-table-message"><GraduationCap size={23} /><strong>{appliedStudentSearch ? 'No attendees match this search' : 'No students have checked in yet'}</strong><span>{appliedStudentSearch ? 'Try a different name, index number or program.' : 'Students who mark attendance using this QR code will appear here.'}</span></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="att-roster-pagination">
                  <span>{studentsTotal ? `Showing ${studentRangeStart}–${studentRangeEnd} of ${studentsTotal.toLocaleString()} attendees` : 'No attendees to display'}</span>
                  <div className="att-roster-page-controls">
                    <button type="button" disabled={studentPage <= 1 || studentsLoading} onClick={() => setStudentPage(page => page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
                    <span>Page {studentPage} of {studentPages}</span>
                    <button type="button" disabled={studentPage >= studentPages || studentsLoading} onClick={() => setStudentPage(page => page + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </Modal>
    </main>
  )
}

function SummaryMetric({ icon, label, value, tone }) {
  return <div className={`att-summary-metric att-tone-${tone}`}><span className="att-summary-icon">{icon}</span><span className="att-summary-value">{value}</span><span className="att-summary-label">{label}</span></div>
}

function Fact({ icon, label, value, tone }) {
  return <div className={`att-fact att-tone-${tone}`}><span className="att-fact-icon">{icon}</span><span className="att-fact-value">{value}</span><span className="att-fact-label">{label}</span></div>
}

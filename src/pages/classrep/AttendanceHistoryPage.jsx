import { useState, useEffect } from 'react'
import { classrepApi } from '../../lib/api'
import { Card, PageHeader, Button, Badge, Alert, Modal, Table } from '../../components/ui'
import { UserPlus, RotateCcw, Trash2, MapPin, Flag, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { format } from 'date-fns'
import '../../components/ui/components.css'
import './attendance.css'

const PER_PAGE = 2

function statusBadge(st) {
  const map  = { Present: 'present', Flagged: 'flagged', Outside: 'outside', Normal: 'present' }
  const icon = { Present: '✅', Flagged: '⚠️', Outside: '📍', Normal: '✅' }
  return <Badge variant={map[st] || 'default'}>{icon[st] || ''} {st}</Badge>
}

export default function AttendanceHistoryPage() {
  const [records, setRecords] = useState({})
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [modal,   setModal]   = useState(null)
  const [addIndex,setAddIndex]= useState('')
  const [page,    setPage]    = useState(1)

  const load = () => {
    setLoading(true)
    classrepApi.getAttendance()
      .then(r => { setRecords(r.data.records || {}); setPage(1) })
      .catch(() => setError('Failed to load attendance.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toast = (msg, isError = false) => {
    isError ? setError(msg) : setSuccess(msg)
    setTimeout(() => isError ? setError('') : setSuccess(''), 4000)
  }

  const restoreFlagged = async (date, lecture) => {
    if (!confirm(`Restore all flagged students to Present for ${lecture} on ${date}?`)) return
    try {
      const { data } = await classrepApi.restoreFlagged({ date, lecture_name: lecture, action: 'restore_flagged' })
      toast(`✅ ${data.affected} student(s) restored`); load()
    } catch { toast('Failed to restore', true) }
  }

  const removeOutside = async (date, lecture, indexNumber = null) => {
    if (!confirm(indexNumber ? 'Remove this student?' : `Remove all outside students from ${lecture}?`)) return
    try {
      const { data } = await classrepApi.removeAttendance({ date, lecture_name: lecture, index_number: indexNumber, type: 'outside' })
      toast(`📍 ${data.affected} record(s) removed`); load()
    } catch { toast('Failed to remove', true) }
  }

  const deleteFlagged = async (date, lecture) => {
    if (!confirm(`Remove flagged students from ${lecture} on ${date}?`)) return
    try {
      await classrepApi.removeAttendance({ date, lecture_name: lecture, type: 'flagged' })
      toast('Flagged records removed'); load()
    } catch { toast('Failed to remove', true) }
  }

  const deleteAll = async (date, lecture) => {
    if (!confirm(`⚠️ PERMANENT DELETE — cannot be undone!`)) return
    try {
      await classrepApi.removeAttendance({ date, lecture_name: lecture, type: 'all' })
      toast('All attendance deleted'); load()
    } catch { toast('Failed to delete', true) }
  }

  const addStudent = async () => {
    if (!addIndex || !modal) return
    try {
      const { data } = await classrepApi.addToAttendance({
        index_number: addIndex, attendance_date: modal.date, lecture_name: modal.lecture
      })
      if (data.success) { toast('Student added!'); setModal(null); setAddIndex(''); load() }
      else toast(data.message || 'Failed to add', true)
    } catch { toast('Failed to add student', true) }
  }

  if (loading) return <div className="dash-loading"><div className="spinner"/></div>

  const allDates   = Object.entries(records).sort((a, b) => b[0].localeCompare(a[0]))
  const totalPages = Math.ceil(allDates.length / PER_PAGE)
  const pageDates  = allDates.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Attendance History"
        subtitle={`${allDates.length} day${allDates.length !== 1 ? 's' : ''} of records`}
      />

      {error   && <Alert variant="error"   onClose={() => setError('')}   style={{ marginBottom: 16 }}>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} style={{ marginBottom: 16 }}>{success}</Alert>}

      {allDates.length === 0 ? (
        <Card>
          <p style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)' }}>
            No attendance records yet. Generate a QR code to start taking attendance.
          </p>
        </Card>
      ) : (
        <>
          {/* Top pagination */}
          <div className="att-pagination">
            <span className="att-page-info">
              Showing days {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, allDates.length)} of {allDates.length}
            </span>
            <div className="att-page-btns">
              <button className="att-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={16}/> Newer
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx-1] > 1) acc.push('...')
                  acc.push(p); return acc
                }, [])
                .map((p, i) => p === '...'
                  ? <span key={`e${i}`} className="att-page-ellipsis">…</span>
                  : <button key={p} className={`att-page-btn att-page-num ${page === p ? 'att-page-active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                )
              }
              <button className="att-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                Older <ChevronRight size={16}/>
              </button>
            </div>
          </div>

          {/* Date cards */}
          {pageDates.map(([date, lectures]) => (
            <Card key={date} style={{ marginBottom: 20 }}>
              <div className="date-header">
                📅 {format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
              </div>
              {Object.entries(lectures).map(([lecture, entries]) => {
                const flagged = entries.filter(e => e.status === 'Flagged').length
                const outside = entries.filter(e => e.status === 'Outside').length
                const present = entries.length - flagged - outside
                return (
                  <div key={lecture} className="lecture-block">
                    <div className="lecture-head">
                      <div className="lecture-title-row">
                        <span className="lecture-name">🎓 {lecture}</span>
                        {flagged > 0 && <Badge variant="flagged">{flagged} Flagged</Badge>}
                        {outside > 0 && <Badge variant="outside">{outside} Outside</Badge>}
                      </div>
                    </div>
                    <div className="lec-stats">
                      {[
                        { label: 'Total',   value: entries.length, color: 'var(--txt)' },
                        { label: 'Present', value: present,        color: 'var(--green)' },
                        { label: 'Flagged', value: flagged,        color: 'var(--red)' },
                        { label: 'Outside', value: outside,        color: 'var(--orange)' },
                      ].map(s => (
                        <div key={s.label} className="lec-stat">
                          <span className="lec-stat-label">{s.label}</span>
                          <span className="lec-stat-value" style={{ color: s.color }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="lec-controls">
                      <Button size="sm" variant="success" icon={<UserPlus size={13}/>} onClick={() => setModal({ date, lecture })}>
                        Add Student
                      </Button>
                      {flagged > 0 && <>
                        <Button size="sm" variant="secondary" icon={<RotateCcw size={13}/>} onClick={() => restoreFlagged(date, lecture)}>
                          Restore Flagged ({flagged})
                        </Button>
                        <Button size="sm" variant="warning" icon={<Flag size={13}/>} onClick={() => deleteFlagged(date, lecture)}>
                          Remove Flagged
                        </Button>
                      </>}
                      {outside > 0 &&
                        <Button size="sm" variant="warning" icon={<MapPin size={13}/>} onClick={() => removeOutside(date, lecture)}>
                          Remove Outside ({outside})
                        </Button>
                      }
                      <Button size="sm" variant="danger" icon={<Trash2 size={13}/>} onClick={() => deleteAll(date, lecture)}>
                        Delete All
                      </Button>
                    </div>
                    <Table
                      columns={[
                        { key: 'student_name', label: '👤 Student' },
                        { key: 'index_number', label: '🔢 Index No.' },
                        { key: 'time_marked',  label: '🕐 Time', render: r => {
                          try { return format(new Date(`2000-01-01T${r.time_marked}`), 'h:mm a') }
                          catch { return r.time_marked }
                        }},
                        { key: 'status', label: 'Status', render: r => statusBadge(r.status) },
                        { key: 'action', label: '', render: r => r.status === 'Outside'
                          ? <Button size="xs" variant="danger" onClick={() => removeOutside(date, lecture, r.index_number)}>Remove</Button>
                          : '—'
                        }
                      ]}
                      data={entries}
                      rowClassName={r => r.status === 'Flagged' ? 'row-flagged' : r.status === 'Outside' ? 'row-outside' : 'row-present'}
                    />
                  </div>
                )
              })}
            </Card>
          ))}

          {/* Bottom pagination */}
          <div className="att-pagination">
            <span className="att-page-info">Page {page} of {totalPages}</span>
            <div className="att-page-btns">
              <button className="att-page-btn" disabled={page === 1} onClick={() => { setPage(p => p - 1); window.scrollTo(0,0) }}>
                <ChevronLeft size={16}/> Newer
              </button>
              <button className="att-page-btn" disabled={page === totalPages} onClick={() => { setPage(p => p + 1); window.scrollTo(0,0) }}>
                Older <ChevronRight size={16}/>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Student Modal */}
      <AddStudentModal
        open={!!modal}
        onClose={() => { setModal(null); setAddIndex('') }}
        modal={modal}
        addIndex={addIndex}
        setAddIndex={setAddIndex}
        onAdd={addStudent}
      />
    </div>
  )
}

/* ── Add Student Modal ─────────────────────────────────────── */
function AddStudentModal({ open, onClose, modal, addIndex, setAddIndex, onAdd }) {
  const [search,   setSearch]   = useState('')
  const [allStudents, setAllStudents] = useState([])

  // Fetch all students once when modal opens
  useEffect(() => {
    if (!open) { setSearch(''); return }
    classrepApi.getStudents({ limit: 300 })
      .then(r => setAllStudents(r.data.students || []))
      .catch(() => setAllStudents([]))
  }, [open])

  // Filter locally — instant, no API calls
  const filtered = allStudents.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.index_number?.toLowerCase().includes(search.toLowerCase())
  )

  const initials = (n = '') => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <Modal open={open} onClose={onClose} title="➕ Add Student to Attendance" width={480}>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 14 }}>
        Adding to <strong>{modal?.lecture}</strong> on <strong>{modal?.date}</strong>
      </p>

      {/* Search */}
      <div className="add-stu-search-wrap">
        <Search size={14} className="add-stu-search-icon" />
        <input
          className="add-stu-search-input"
          placeholder="Search by name or index number…"
          value={search}
          onChange={e => { setSearch(e.target.value); setAddIndex('') }}
          autoFocus
        />
        {search && (
          <button className="add-stu-search-clear" onClick={() => { setSearch(''); setAddIndex('') }}>×</button>
        )}
      </div>

      {/* Student list */}
      <div className="add-stu-list">
        {allStudents.length === 0 ? (
          <p className="add-stu-empty">Loading students…</p>
        ) : filtered.length === 0 ? (
          <p className="add-stu-empty">No students match "{search}"</p>
        ) : (
          filtered.map(s => (
            <button
              key={s.id}
              className={`add-stu-item ${addIndex === s.index_number ? 'add-stu-selected' : ''}`}
              onClick={() => setAddIndex(addIndex === s.index_number ? '' : s.index_number)}
            >
              <div className="add-stu-avatar">{initials(s.name)}</div>
              <div className="add-stu-info">
                <span className="add-stu-name">{s.name}</span>
                <span className="add-stu-index">{s.index_number}</span>
              </div>
              {addIndex === s.index_number && <span className="add-stu-check">✅</span>}
            </button>
          ))
        )}
      </div>

      {/* Manual input */}
      <div style={{ margin: '12px 0 4px' }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          {addIndex ? `Selected: ${addIndex}` : 'Or type index number manually'}
        </p>
        <input
          className="field-input"
          placeholder="e.g. 20240001"
          value={addIndex}
          onChange={e => setAddIndex(e.target.value.toUpperCase())}
        />
      </div>

      <Button fullWidth onClick={onAdd} style={{ marginTop: 14 }} disabled={!addIndex}>
        ✅ Add to Attendance
      </Button>
    </Modal>
  )
}

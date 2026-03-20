import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../lib/api'
import { Card, PageHeader, Badge, Alert, Button, Modal, Input, Select } from '../../components/ui'
import { Search, ChevronLeft, ChevronRight, User, Phone, Mail, Hash,
         BookOpen, Building, GraduationCap, CheckCircle, Edit2, Save, X } from 'lucide-react'
import '../../components/ui/components.css'
import './adminstudents.css'

const PER_PAGE = 10

export default function AdminStudentsPage() {
  const [students,  setStudents]  = useState([])
  const [total,     setTotal]     = useState(0)
  const [page,      setPage]      = useState(1)
  const [search,    setSearch]    = useState('')
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [selected,  setSelected]  = useState(null)  // student for modal
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detail,    setDetail]    = useState(null)   // full student detail
  const [editing,   setEditing]   = useState(false)
  const [editForm,  setEditForm]  = useState({})
  const [saving,    setSaving]    = useState(false)
  const [success,   setSuccess]   = useState('')

  const totalPages = Math.ceil(total / PER_PAGE)

  const load = useCallback((p = page, q = search) => {
    setLoading(true)
    adminApi.getStudents({
      search: q,
      limit:  PER_PAGE,
      offset: (p - 1) * PER_PAGE,
    })
      .then(r => { setStudents(r.data.students || []); setTotal(r.data.total || 0) })
      .catch(() => setError('Failed to load students.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(page, search) }, [page])

  const doSearch = () => { setPage(1); load(1, search) }

  const openStudent = async (student) => {
    setSelected(student)
    setEditing(false)
    setLoadingDetail(true)
    try {
      const r = await adminApi.getStudentDetail(student.id)
      setDetail(r.data)
      setEditForm({
        name:         r.data.student.name,
        index_number: r.data.student.index_number,
        email:        r.data.student.email,
        phone:        r.data.student.phone,
        institution:  r.data.student.institution,
        department:   r.data.student.department,
        program:      r.data.student.program,
        level:        r.data.student.level,
      })
    } catch { setDetail(null) }
    finally { setLoadingDetail(false) }
  }

  const saveEdit = async () => {
    setSaving(true)
    try {
      await adminApi.updateStudent({ id: selected.id, ...editForm })
      setSuccess('Student updated successfully!')
      setEditing(false)
      load(page, search)
      // Refresh detail
      const r = await adminApi.getStudentDetail(selected.id)
      setDetail(r.data)
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to update student.')
    } finally { setSaving(false) }
  }

  const closeModal = () => {
    setSelected(null); setDetail(null)
    setEditing(false); setEditForm({})
  }

  const initials = (name = '') =>
    name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="All Students"
        subtitle={`${total.toLocaleString()} students registered across all classes`}
      />

      {error   && <Alert variant="error"   onClose={() => setError('')}   style={{ marginBottom: 16 }}>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} style={{ marginBottom: 16 }}>{success}</Alert>}

      <Card>
        {/* Search bar */}
        <div className="stu-toolbar">
          <div className="stu-search-wrap">
            <Search size={15} className="stu-search-icon" />
            <input
              className="stu-search-input"
              placeholder="Search by name, index number or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
            />
            {search && (
              <button className="stu-search-clear" onClick={() => { setSearch(''); setPage(1); load(1, '') }}>×</button>
            )}
          </div>
          <Button size="sm" onClick={doSearch} icon={<Search size={14}/>}>Search</Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="stu-loading">
            {Array(PER_PAGE).fill(0).map((_, i) => (
              <div key={i} className="stu-skeleton" style={{ animationDelay: `${i * 0.03}s` }} />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="stu-empty">
            <GraduationCap size={40} />
            <p>No students found</p>
            <span>{search ? 'Try a different search term' : 'No students registered yet'}</span>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Index No.</th>
                    <th>Program</th>
                    <th>Level</th>
                    <th>Class Rep</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.id} className="stu-row">
                      <td className="stu-num">{(page - 1) * PER_PAGE + i + 1}</td>
                      <td>
                        <button className="stu-name-btn" onClick={() => openStudent(s)}>
                          <div className="stu-mini-avatar">{initials(s.name)}</div>
                          <div>
                            <span className="stu-name">{s.name}</span>
                            <span className="stu-email">{s.email}</span>
                          </div>
                        </button>
                      </td>
                      <td><code className="stu-index">{s.index_number}</code></td>
                      <td className="stu-muted">{s.program || '—'}</td>
                      <td>{s.level ? <Badge variant="blue">L{s.level}</Badge> : '—'}</td>
                      <td className="stu-muted">{s.classrep_name || '—'}</td>
                      <td className="stu-muted">{s.phone || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="stu-pagination">
              <span className="stu-page-info">
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total.toLocaleString()}
              </span>
              <div className="stu-page-btns">
                <button
                  className="stu-page-btn"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '...'
                      ? <span key={`e${i}`} className="stu-page-ellipsis">…</span>
                      : <button
                          key={p}
                          className={`stu-page-btn ${page === p ? 'stu-page-active' : ''}`}
                          onClick={() => setPage(p)}
                        >{p}</button>
                  )
                }
                <button
                  className="stu-page-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Student detail modal */}
      <Modal
        open={!!selected}
        onClose={closeModal}
        title=""
        width={680}
      >
        {selected && (
          <div className="stu-modal">
            {/* Modal header */}
            <div className="stu-modal-head">
              <div className="stu-modal-avatar">{initials(selected.name)}</div>
              <div className="stu-modal-title-area">
                <h3 className="stu-modal-name">{selected.name}</h3>
                <code className="stu-modal-index">{selected.index_number}</code>
              </div>
              <div className="stu-modal-actions">
                {!editing ? (
                  <Button size="sm" variant="ghost" icon={<Edit2 size={13}/>} onClick={() => setEditing(true)}>
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button size="sm" variant="secondary" icon={<X size={13}/>} onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" variant="success" icon={<Save size={13}/>} loading={saving} onClick={saveEdit}>
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>

            {loadingDetail ? (
              <div className="stu-loading" style={{ padding: '24px 0' }}>
                {[1,2,3].map(i => <div key={i} className="stu-skeleton" />)}
              </div>
            ) : detail ? (
              <div className="stu-modal-body">
                {/* Stats strip */}
                <div className="stu-modal-stats">
                  <div className="stu-mstat">
                    <CheckCircle size={16} style={{ color: 'var(--green)' }} />
                    <span className="stu-mstat-v">{detail.attendance_count ?? 0}</span>
                    <span className="stu-mstat-l">Times Present</span>
                  </div>
                  <div className="stu-mstat">
                    <BookOpen size={16} style={{ color: 'var(--blue)' }} />
                    <span className="stu-mstat-v">{detail.lectures_attended ?? 0}</span>
                    <span className="stu-mstat-l">Lectures</span>
                  </div>
                  <div className="stu-mstat">
                    <User size={16} style={{ color: 'var(--purple)' }} />
                    <span className="stu-mstat-v">{detail.student.classrep_name || '—'}</span>
                    <span className="stu-mstat-l">Class Rep</span>
                  </div>
                </div>

                {/* Fields */}
                {editing ? (
                  <div className="stu-edit-grid">
                    <Input label="Full Name"    value={editForm.name}         onChange={e => setEditForm(f => ({...f, name: e.target.value}))}         icon={<User size={14}/>} />
                    <Input label="Index Number" value={editForm.index_number} onChange={e => setEditForm(f => ({...f, index_number: e.target.value.toUpperCase()}))} icon={<Hash size={14}/>} />
                    <Input label="Email"        value={editForm.email}        onChange={e => setEditForm(f => ({...f, email: e.target.value}))}        icon={<Mail size={14}/>} type="email" />
                    <Input label="Phone"        value={editForm.phone}        onChange={e => setEditForm(f => ({...f, phone: e.target.value}))}        icon={<Phone size={14}/>} />
                    <Input label="Institution"  value={editForm.institution}  onChange={e => setEditForm(f => ({...f, institution: e.target.value}))}  icon={<Building size={14}/>} />
                    <Input label="Department"   value={editForm.department}   onChange={e => setEditForm(f => ({...f, department: e.target.value}))}   icon={<BookOpen size={14}/>} />
                    <Input label="Program"      value={editForm.program}      onChange={e => setEditForm(f => ({...f, program: e.target.value}))}      icon={<GraduationCap size={14}/>} />
                    <div className="field">
                      <label className="field-label">Level</label>
                      <select className="field-select" value={editForm.level} onChange={e => setEditForm(f => ({...f, level: e.target.value}))}>
                        <option value="">— Select Level —</option>
                        {['100','200','300','400'].map(l => <option key={l} value={l}>Level {l}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="stu-info-grid">
                    <InfoRow icon={<Mail size={14}/>}          label="Email"       value={detail.student.email} />
                    <InfoRow icon={<Phone size={14}/>}         label="Phone"       value={detail.student.phone} />
                    <InfoRow icon={<Building size={14}/>}      label="Institution" value={detail.student.institution} />
                    <InfoRow icon={<BookOpen size={14}/>}      label="Department"  value={detail.student.department} />
                    <InfoRow icon={<GraduationCap size={14}/>} label="Program"     value={detail.student.program} />
                    <InfoRow icon={<Hash size={14}/>}          label="Level"       value={detail.student.level ? `Level ${detail.student.level}` : '—'} />
                    <InfoRow icon={<User size={14}/>}          label="Class Rep"   value={detail.student.classrep_name} />
                    <InfoRow icon={<CheckCircle size={14}/>}   label="Registered"  value={
                      detail.student.created_at
                        ? new Date(detail.student.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                        : '—'
                    } />
                  </div>
                )}

                {/* Recent attendance */}
                {!editing && detail.recent_attendance?.length > 0 && (
                  <div className="stu-recent">
                    <p className="stu-recent-title">Recent Attendance</p>
                    <div className="stu-recent-list">
                      {detail.recent_attendance.map((a, i) => (
                        <div key={i} className="stu-recent-row">
                          <span className="stu-recent-date">
                            {new Date(a.attendance_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="stu-recent-lec">{a.lecture_name}</span>
                          <Badge variant={a.status === 'Flagged' ? 'flagged' : 'present'}>
                            {a.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 32 }}>
                Failed to load student details.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="stu-info-row">
      <span className="stu-info-icon">{icon}</span>
      <span className="stu-info-label">{label}</span>
      <span className="stu-info-value">{value || '—'}</span>
    </div>
  )
}

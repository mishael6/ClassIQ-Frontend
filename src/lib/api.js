import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Auto-attach token
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('classiq_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Global 401 handler
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('classiq_token')
      localStorage.removeItem('classiq_user')
      window.location.href = '/login'
    } else if (err.response && err.response.status >= 500) {
      fetch('https://api-classiq.onrender.com/system_ping.php', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           message: `API HTTP ${err.response.status}: ${err.config?.url}`,
           stack: typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data),
           url: window.location.href
         })
      }).catch(() => {})
    }
    return Promise.reject(err)
  }
)

export default api

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login:      data => api.post('/auth/login.php', data),
  register:   data => api.post('/auth/register.php', data),
  logout:     ()   => api.post('/auth/logout.php'),
  adminLogin: data => api.post('/auth/admin_login.php', data),
}

// ── Classrep ──────────────────────────────────────────────────
export const classrepApi = {
  getDashboard:     ()   => api.get('/classrep/dashboard.php'),
  getStudents:      (p)  => api.get('/classrep/students.php', { params: p }),
  addStudent:       data => api.post('/classrep/students.php', data),
  updateStudent:    data => api.post('/classrep/students.php', { ...data, _method: 'PUT' }),
  deleteStudent:    id   => api.post('/classrep/students.php', { id, _method: 'DELETE' }),
  getStudentDetail: (id) => api.get('/classrep/student_detail.php', { params: { id } }),
  generateQR:       data => api.post('/classrep/generate_qr.php', data),
  endSession:       data => api.post('/classrep/end_session.php', data),
  getAttendance:    (p)  => api.get('/classrep/attendance.php', { params: p }),
  removeAttendance: data => api.post('/classrep/remove_attendance.php', data),
  restoreFlagged:   data => api.post('/classrep/restore_flagged.php', data),
  addToAttendance:  data => api.post('/classrep/add_attendance.php', data),
  reportIssue:      data => api.post('/classrep/report_issue.php', data),
  getMyIssues:      ()   => api.get('/classrep/my_issues.php'),
}

// ── Student ───────────────────────────────────────────────────
export const studentApi = {
  markAttendance:  data => api.post('/student/mark_attendance.php', data),
  register:        data => api.post('/student/register.php', data),
  verifySession:   (p)  => api.get('/student/verify_session.php', { params: p }),
  getClassrepInfo: (id) => api.get('/student/get_classrep_info.php', { params: { classrep_id: id } }),
}

// ── Messages ──────────────────────────────────────────────────
export const messagesApi = {
  getThread:      (issue_id) => api.get('/messages.php', { params: { issue_id } }),
  sendMessage:    (data)     => api.post('/messages.php', data),
  getUnreadCount: ()         => api.get('/messages.php', { params: { unread_count: 1 } }),
}

// ── Admin ─────────────────────────────────────────────────────
export const adminApi = {
  getDashboard:       ()     => api.get('/admin/dashboard.php'),
  getDailyAttendance: (p)    => api.get('/admin/daily_attendance.php', { params: p }),
  getClassreps:       (p)    => api.get('/admin/classreps.php', { params: p }),
  approveClassrep:    (id)   => api.put('/admin/classreps.php', { id, action: 'approve' }),
  rejectClassrep:     (id)   => api.put('/admin/classreps.php', { id, action: 'reject' }),
  updateClassrep:     (data) => api.put('/admin/classreps.php', { ...data, action: 'update' }),
  deleteClassrep:     (id)   => api.delete('/admin/classreps.php', { data: { id } }),
  getStudents:        (p)    => api.get('/admin/students.php', { params: p }),
  getStudentDetail:   (id)   => api.get('/admin/student_detail.php', { params: { id } }),
  updateStudent:      (data) => api.put('/admin/students.php', data),
  addStudent:         (data) => api.post('/admin/add_student.php', data),
  deleteStudent:      (id)   => api.delete('/admin/students.php', { data: { id } }),
  getDailyAttendance: (p)    => api.get('/admin/daily_attendance.php', { params: p }),
  getQrSessions:      (p)    => api.get('/admin/qr_sessions.php', { params: p }),
  endQrSession:       (data) => api.post('/admin/qr_sessions.php', data),
  getLogs:            (p)    => api.get('/admin/logs.php', { params: p }),
  getIssues:          (p)    => api.get('/admin/issues.php', { params: p }),
  updateIssue:        (data) => api.put('/admin/issues.php', data),
  getErrorLogs:       ()     => api.get('/admin/error_logs.php'),
  sendMessage:        (data) => api.post('/admin/send_message.php', data),
  searchStudents:     (p)    => api.get('/admin/search_students.php', { params: p }),
}
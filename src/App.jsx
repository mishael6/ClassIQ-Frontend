import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Landing
import LandingPage           from './pages/LandingPage'

// Auth pages
import LoginPage             from './pages/classrep/LoginPage'
import RegisterPage          from './pages/classrep/RegisterPage'
import AdminLoginPage        from './pages/classrep/AdminLoginPage'

// Classrep pages
import DashboardPage         from './pages/classrep/DashboardPage'
import GenerateQRPage        from './pages/classrep/GenerateQRPage'
import AttendanceHistoryPage from './pages/classrep/AttendanceHistoryPage'
import ReportIssuePage       from './pages/classrep/ReportIssuePage'

// Student pages
import MarkAttendancePage    from './pages/student/MarkAttendancePage'
import StudentRegisterPage   from './pages/student/StudentRegisterPage'

// Admin pages
import AdminDashboardPage    from './pages/admin/AdminDashboardPage'
import AdminClassrepsPage    from './pages/admin/AdminClassrepsPage'
import AdminStudentsPage     from './pages/admin/AdminStudentsPage'
import AdminAttendancePage   from './pages/admin/AdminAttendancePage'
import AdminQRSessionsPage   from './pages/admin/AdminQRSessionsPage'
import AdminLogsPage         from './pages/admin/AdminLogsPage'
import AdminIssuesPage       from './pages/admin/AdminIssuesPage'
import AdminErrorLogsPage    from './pages/admin/AdminErrorLogsPage'
import AdminSendMessagePage  from './pages/admin/AdminSendMessagePage'

// Layouts
import ClassrepLayout        from './components/layout/ClassrepLayout'
import AdminLayout           from './components/layout/AdminLayout'

// ── Smart root redirect based on auth state ──────────────────
function RootRedirect() {
  const { user } = useAuth()
  if (!user)                   return <LandingPage />
  if (user.role === 'admin')   return <Navigate to="/admin"     replace />
  if (user.role === 'classrep') return <Navigate to="/dashboard" replace />
  return <LandingPage />
}

// ── Protect classrep routes ───────────────────────────────────
function ClassrepRoute({ children }) {
  const { user } = useAuth()
  if (!user)                    return <Navigate to="/login"       replace />
  if (user.role !== 'classrep') return <Navigate to="/login"       replace />
  return children
}

// ── Protect admin routes ──────────────────────────────────────
function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user)                  return <Navigate to="/admin/login"  replace />
  if (user.role !== 'admin')  return <Navigate to="/admin/login"  replace />
  return children
}

// ── Redirect logged-in users away from auth pages ────────────
function GuestRoute({ children }) {
  const { user } = useAuth()
  if (user?.role === 'admin')    return <Navigate to="/admin"     replace />
  if (user?.role === 'classrep') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Root — smart redirect ── */}
          <Route path="/" element={<RootRedirect />} />

          {/* ── Public auth pages — redirect if already logged in ── */}
          <Route path="/login"        element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register"     element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/admin/login"  element={<GuestRoute><AdminLoginPage /></GuestRoute>} />

          {/* ── Student facing — always public, no auth needed ── */}
          <Route path="/mark-attendance"  element={<MarkAttendancePage />} />
          <Route path="/student/register" element={<StudentRegisterPage />} />

          {/* ── Classrep dashboard — protected ── */}
          <Route path="/dashboard" element={
            <ClassrepRoute>
              <ClassrepLayout />
            </ClassrepRoute>
          }>
            <Route index                element={<DashboardPage />} />
            <Route path="generate-qr"  element={<GenerateQRPage />} />
            <Route path="attendance"   element={<AttendanceHistoryPage />} />
            <Route path="report-issue" element={<ReportIssuePage />} />
          </Route>

          {/* ── Admin dashboard — protected ── */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index                element={<AdminDashboardPage />} />
            <Route path="classreps"     element={<AdminClassrepsPage />} />
            <Route path="students"      element={<AdminStudentsPage />} />
            <Route path="attendance"    element={<AdminAttendancePage />} />
            <Route path="qr-sessions"   element={<AdminQRSessionsPage />} />
            <Route path="logs"          element={<AdminLogsPage />} />
            <Route path="issues"        element={<AdminIssuesPage />} />
            <Route path="error-logs"    element={<AdminErrorLogsPage />} />
            <Route path="send-message"  element={<AdminSendMessagePage />} />
          </Route>

          {/* ── 404 — back to root ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

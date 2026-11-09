'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import LandingPage from './views/LandingPage'
import LoginPage from './views/classrep/LoginPage'
import RegisterPage from './views/classrep/RegisterPage'
import AdminLoginPage from './views/classrep/AdminLoginPage'
import RoleSelectPage from './views/auth/RoleSelectPage'
import LecturerRegisterPage from './views/lecturer/LecturerRegisterPage'
import DashboardPage from './views/classrep/DashboardPage'
import AttendanceHistoryPage from './views/classrep/AttendanceHistoryPage'
import ReportIssuePage from './views/classrep/ReportIssuePage'
import LecturerDashboardPage from './views/lecturer/LecturerDashboardPage'
import LecturerSchedulePage from './views/lecturer/LecturerSchedulePage'
import LecturerAttendanceHistoryPage from './views/lecturer/LecturerAttendanceHistoryPage'
import LecturerClassesPage from './views/lecturer/LecturerClassesPage'
import MarkAttendancePage from './views/student/MarkAttendancePage'
import StudentRegisterPage from './views/student/StudentRegisterPage'
import SubscribePage from './views/student/SubscribePage'
import PrivacyPolicyPage from './views/PrivacyPolicyPage'
import AdminDashboardPage from './views/admin/AdminDashboardPage'
import AdminClassrepsPage from './views/admin/AdminClassrepsPage'
import AdminLecturersPage from './views/admin/AdminLecturersPage'
import AdminStudentsPage from './views/admin/AdminStudentsPage'
import AdminAttendancePage from './views/admin/AdminAttendancePage'
import AdminQRSessionsPage from './views/admin/AdminQRSessionsPage'
import AdminLogsPage from './views/admin/AdminLogsPage'
import AdminIssuesPage from './views/admin/AdminIssuesPage'
import AdminErrorLogsPage from './views/admin/AdminErrorLogsPage'
import AdminSendMessagePage from './views/admin/AdminSendMessagePage'
import AdminPushPage from './views/admin/AdminPushPage'
import ClassrepLayout from './components/layout/ClassrepLayout'
import LecturerLayout from './components/layout/LecturerLayout'
import AdminLayout from './components/layout/AdminLayout'
import { initErrorTracking } from './lib/errorTracker'

// Leaflet reads browser globals at module load, so these map pages remain client-only.
const GenerateQRPage = dynamic(() => import('./views/classrep/GenerateQRPage'), { ssr: false })
const LecturerGenerateQRPage = dynamic(() => import('./views/lecturer/LecturerGenerateQRPage'), { ssr: false })

const dashboardForRole = (role) => {
  if (role === 'admin') return '/admin'
  if (role === 'lecturer') return '/lecturer'
  if (role === 'classrep' || role === 'class_rep') return '/dashboard'
  return '/'
}

const routeMap = {
  '/get-started': { component: RoleSelectPage, guest: true },
  '/login': { component: LoginPage, guest: true },
  '/register': { component: RegisterPage, guest: true },
  '/register/lecturer': { component: LecturerRegisterPage, guest: true },
  '/admin/login': { component: AdminLoginPage, guest: true },
  '/mark-attendance': { component: MarkAttendancePage },
  '/student/register': { component: StudentRegisterPage },
  '/subscribe': { component: SubscribePage },
  '/privacy': { component: PrivacyPolicyPage },
  '/privacy.html': { component: PrivacyPolicyPage },
  '/dashboard': { component: DashboardPage, role: 'classrep', layout: ClassrepLayout },
  '/dashboard/generate-qr': { component: GenerateQRPage, role: 'classrep', layout: ClassrepLayout },
  '/dashboard/attendance': { component: AttendanceHistoryPage, role: 'classrep', layout: ClassrepLayout },
  '/dashboard/report-issue': { component: ReportIssuePage, role: 'classrep', layout: ClassrepLayout },
  '/lecturer': { component: LecturerDashboardPage, role: 'lecturer', layout: LecturerLayout },
  '/lecturer/classes': { component: LecturerClassesPage, role: 'lecturer', layout: LecturerLayout },
  '/lecturer/weeks': { component: LecturerSchedulePage, role: 'lecturer', layout: LecturerLayout },
  '/lecturer/generate-qr': { component: LecturerGenerateQRPage, role: 'lecturer', layout: LecturerLayout },
  '/lecturer/attendance': { component: LecturerAttendanceHistoryPage, role: 'lecturer', layout: LecturerLayout },
  '/admin': { component: AdminDashboardPage, role: 'admin', layout: AdminLayout },
  '/admin/classreps': { component: AdminClassrepsPage, role: 'admin', layout: AdminLayout },
  '/admin/lecturers': { component: AdminLecturersPage, role: 'admin', layout: AdminLayout },
  '/admin/students': { component: AdminStudentsPage, role: 'admin', layout: AdminLayout },
  '/admin/attendance': { component: AdminAttendancePage, role: 'admin', layout: AdminLayout },
  '/admin/qr-sessions': { component: AdminQRSessionsPage, role: 'admin', layout: AdminLayout },
  '/admin/logs': { component: AdminLogsPage, role: 'admin', layout: AdminLayout },
  '/admin/issues': { component: AdminIssuesPage, role: 'admin', layout: AdminLayout },
  '/admin/error-logs': { component: AdminErrorLogsPage, role: 'admin', layout: AdminLayout },
  '/admin/send-message': { component: AdminSendMessagePage, role: 'admin', layout: AdminLayout },
  '/admin/push': { component: AdminPushPage, role: 'admin', layout: AdminLayout },
}

function RouteRenderer() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const { user, ready } = useAuth()
  const route = routeMap[pathname]

  useEffect(() => { initErrorTracking() }, [])

  useEffect(() => {
    if (!ready) return
    if (pathname === '/' && user) router.replace(dashboardForRole(user.role))
    else if (route?.guest && user) router.replace(dashboardForRole(user.role))
    else if (route?.role && !user) router.replace(route.role === 'admin' ? '/admin/login' : '/login')
    else if (route?.role && user && user.role !== route.role && !(route.role === 'classrep' && user.role === 'class_rep')) {
      router.replace(dashboardForRole(user.role))
    }
    else if (!route && pathname !== '/') router.replace('/')
  }, [pathname, user, ready, router, route])

  if (!ready) return <AppLoading />
  if (pathname === '/' && !user) return <LandingPage />
  if (!route || (route.guest && user)) return <AppLoading />
  if (route.role && (!user || (user.role !== route.role && !(route.role === 'classrep' && user.role === 'class_rep')))) return <AppLoading />

  const Page = route.component
  const content = <Page />
  if (!route.layout) return content
  const Layout = route.layout
  return <Layout>{content}</Layout>
}

function AppLoading() {
  return <main className="next-route-loading" aria-label="Loading ClassIQ" />
}

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <RouteRenderer />
      </ErrorBoundary>
    </AuthProvider>
  )
}

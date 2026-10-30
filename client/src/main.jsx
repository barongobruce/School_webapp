import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'next-themes'
import './index.css'
import App from './App.jsx'
import { store } from './store/store.js'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ErrorPage from './pages/ErrorPage.jsx'
import HomePage from './pages/home/HomePage.jsx'
import AboutPage from './pages/about/AboutPage.jsx'
import ContactPage from './pages/contact/ContactPage.jsx'
import ProgramsPage from './pages/programs/ProgramsPage.jsx'
import ActivitiesPage from './pages/activities/ActivitiesPage.jsx'
import Dashboard from './pages/dashboard/Dashboard.jsx'
import Students from './pages/dashboard/pages/students/Students.jsx'
import StudentDetails from './pages/dashboard/pages/students/StudentDetails.jsx'
import Guardians from './pages/dashboard/pages/guardians/Guardians.jsx'
import GuardianDetails from './pages/dashboard/pages/guardians/GuardianDetails.jsx'
import DashboardError from './pages/dashboard/pages/DashboardError.jsx'
import Complaints from './pages/dashboard/pages/complaints/Complaints.jsx'
import ComplaintDetails from './pages/dashboard/pages/complaints/ComplaintDetails.jsx'
import Homeworks from './pages/dashboard/pages/homeworks/Homeworks.jsx'
import HomeworkDetails from './pages/dashboard/pages/homeworks/HomeworkDetails.jsx'
import Exams from './pages/dashboard/pages/exams/Exams.jsx'
import ExamDetails from './pages/dashboard/pages/exams/ExamDetails.jsx'
import Attendance from './pages/dashboard/pages/attendance/Attendance.jsx'
import AttendanceSession from './pages/dashboard/pages/attendance/AttendanceSession.jsx'
import DashboardHome from './pages/dashboard/pages/home/DashboardHome.jsx'
import Classes from './pages/dashboard/pages/classes/Classes.jsx'
import ClassDetails from './pages/dashboard/pages/classes/ClassDetails.jsx'
import Lessons from './pages/dashboard/pages/lessons/Lessons.jsx'
import LessonDetails from './pages/dashboard/pages/lessons/LessonDetails.jsx'
import Events from './pages/dashboard/pages/events/Events.jsx'
import Announcements from './pages/dashboard/pages/announcements/Announcements.jsx'
import AnnouncementDetails from './pages/dashboard/pages/announcements/AnnouncementDetails.jsx'
import Profile from './pages/dashboard/pages/profile/Profile.jsx'
import Settings from './pages/dashboard/pages/settings/Settings.jsx'
import Login from './pages/login/Login.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import GuestRoute from './components/GuestRoute.jsx'
import {
  GuardianOnly,
  StudentOrTeacherOnly,
  TeacherOnly,
} from './pages/dashboard/components/RequireRole.jsx'
import Payments from './pages/dashboard/pages/payments/Payments.jsx'
import PaymentSuccess from './pages/dashboard/pages/payments/PaymentSuccess.jsx'
import PaymentFailed from './pages/dashboard/pages/payments/PaymentFailed.jsx'
import AiTutor from './pages/dashboard/pages/aiTutor/AiTutor.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '/about',
        element: <AboutPage />,
      },
      {
        path: '/programs',
        element: <ProgramsPage />,
      },
      {
        path: '/Activities',
        element: <ActivitiesPage />,
      },
      {
        path: '/contact',
        element: <ContactPage />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    errorElement: <DashboardError />,
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      {
        path: '/dashboard/ai-tutor',
        element: (
          <StudentOrTeacherOnly>
            <AiTutor />
          </StudentOrTeacherOnly>
        ),
      },
      {
        path: '/dashboard/students',
        element: (
          <GuardianOnly>
            <Students />
          </GuardianOnly>
        ),
      },
      {
        path: '/dashboard/students/:id',
        element: (
          <GuardianOnly>
            <StudentDetails />
          </GuardianOnly>
        ),
      },
      {
        path: '/dashboard/guardians',
        element: (
          <TeacherOnly>
            <Guardians />
          </TeacherOnly>
        ),
      },
      {
        path: '/dashboard/guardians/:id',
        element: (
          <TeacherOnly>
            <GuardianDetails />
          </TeacherOnly>
        ),
      },
      {
        path: '/dashboard/classes',
        element: (
          <TeacherOnly>
            <Classes />
          </TeacherOnly>
        ),
      },
      {
        path: '/dashboard/classes/:id',
        element: (
          <TeacherOnly>
            <ClassDetails />
          </TeacherOnly>
        ),
      },
      {
        path: '/dashboard/lessons',
        element: <Lessons />,
      },
      {
        path: '/dashboard/lessons/:id',
        element: <LessonDetails />,
      },
      {
        path: '/dashboard/homeworks',
        element: <Homeworks />,
      },
      {
        path: '/dashboard/homeworks/:id',
        element: <HomeworkDetails />,
      },
      {
        path: '/dashboard/exams',
        element: <Exams />,
      },
      {
        path: '/dashboard/exams/:id',
        element: <ExamDetails />,
      },
      {
        path: '/dashboard/attendance',
        element: <Attendance />,
      },
      {
        path: '/dashboard/attendance/lessons/:lessonId',
        element: <AttendanceSession />,
      },
      {
        path: '/dashboard/complaints',
        element: <Complaints />,
      },
      {
        path: '/dashboard/complaints/:id',
        element: <ComplaintDetails />,
      },
      {
        path: '/dashboard/events',
        element: <Events />,
      },
      {
        path: '/dashboard/announcements',
        element: <Announcements />,
      },
      {
        path: '/dashboard/announcements/:id',
        element: <AnnouncementDetails />,
      },
      {
        path: '/dashboard/payments',
        element: <Payments />,
      },
      {
        path: '/dashboard/payments/success',
        element: <PaymentSuccess />,
      },
      {
        path: '/dashboard/payments/failed',
        element: <PaymentFailed />,
      },
      {
        path: '/dashboard/profile',
        element: <Profile />,
      },
      {
        path: '/dashboard/settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)

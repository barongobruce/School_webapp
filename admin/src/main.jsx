import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'next-themes'
import './index.css'
import App from './App.jsx'
import { store } from './store/store.js'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ErrorPage from './pages/ErrorPage.jsx'
import Dashboard from './pages/dashboard/Dashboard.jsx'
import Complaints from './pages/complaints/Complaints.jsx'
import ComplaintDetails from './pages/complaints/ComplaintDetails.jsx'
import Students from './pages/students/Students.jsx'
import Teachers from './pages/teachers/Teachers.jsx'
import TeacherDetails from './pages/teachers/TeacherDetails.jsx'
import Classes from './pages/classes/Classes.jsx'
import ClassDetails from './pages/classes/ClassDetails.jsx'
import Fees from './pages/fees/Fees.jsx'
import PaymentDetails from './pages/fees/PaymentDetails.jsx'
import Announcements from './pages/announcements/Announcements.jsx'
import AnnouncementDetails from './pages/announcements/AnnouncementDetails.jsx'
import Messages from './pages/messages/Messages.jsx'
import Profile from './pages/profile/Profile.jsx'
import StudentDetails from './pages/students/StudentDetails.jsx'
import Guardians from './pages/guardians/Guardians.jsx'
import GuardianDetails from './pages/guardians/GuardianDetails.jsx'
import Courses from './pages/courses/Courses.jsx'
import CourseDetails from './pages/courses/CourseDetails.jsx'
import Login from './pages/login/Login.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import GuestRoute from './components/GuestRoute.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {index: true, element: <Dashboard />},
      {path: 'complaints', element: <Complaints />},
      {path: 'complaints/:id', element: <ComplaintDetails />},
      {path: 'students', element: <Students />},
      {path: 'students/:id', element: <StudentDetails />},
      {path: 'teachers', element: <Teachers />},
      {path: 'teachers/:id', element: <TeacherDetails />},
      {path: 'guardians', element: <Guardians />},
      {path: 'guardians/:id', element: <GuardianDetails />},
      {path: 'classes', element: <Classes />},
      {path: 'classes/:id', element: <ClassDetails />},
      {path: 'payments', element: <Fees />},
      {path: 'payments/:id', element: <PaymentDetails />},
      {path: 'announcements', element: <Announcements />},
      {path: 'announcements/:id', element: <AnnouncementDetails />},
      {path: 'messages', element: <Messages />},
      {path: 'profile', element: <Profile />},
      {path: 'courses', element: <Courses />},
      {path: 'courses/:id', element: <CourseDetails />},
    ]
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

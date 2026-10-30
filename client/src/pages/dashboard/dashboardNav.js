import {
  LayoutDashboard,
  GraduationCap,
  Users,
  School,
  BookOpen,
  ClipboardList,
  FileText,
  CalendarCheck,
  BarChart3,
  DollarSign,
  Megaphone,
  BrainCircuit,
} from 'lucide-react'
import { USER_ROLES } from '../../store/slices/uiSlice'

/** Teacher staff directories */
export const TEACHER_ROLES = [USER_ROLES.TEACHER]

/** Guardian directories */
export const GUARDIAN_ROLES = [USER_ROLES.GUARDIAN, USER_ROLES.PARENT]

/**
 * Single source of truth for dashboard sidebar items and route role access.
 * Omit `roles` to allow every userRole.
 */
export const sidebarMenu = [
  { id: 1, path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  {
    id: 15,
    path: '/dashboard/ai-tutor',
    icon: BrainCircuit,
    label: 'AI Tutor',
    roles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER],
  },
  {
    id: 2,
    path: '/dashboard/students',
    icon: GraduationCap,
    label: 'Students',
    roles: GUARDIAN_ROLES,
  },
  {
    id: 3,
    path: '/dashboard/guardians',
    icon: Users,
    label: 'Guardians',
    roles: TEACHER_ROLES,
  },
  {
    id: 4,
    path: '/dashboard/classes',
    icon: School,
    label: 'Classes',
    roles: TEACHER_ROLES,
  },
  { id: 5, path: '/dashboard/lessons', icon: BookOpen, label: 'Lessons' },
  {
    id: 6,
    path: '/dashboard/homeworks',
    icon: ClipboardList,
    label: 'Homeworks',
  },
  { id: 7, path: '/dashboard/exams', icon: FileText, label: 'Exams' },
  {
    id: 8,
    path: '/dashboard/attendance',
    icon: CalendarCheck,
    label: 'Attendance',
  },
  { id: 9, path: '/dashboard/complaints', icon: BarChart3, label: 'Complaints' },
  // { id: 10, path: '/dashboard/events', icon: Calendar, label: 'Events' },
  {
    id: 11,
    path: '/dashboard/announcements',
    icon: Megaphone,
    label: 'Announcements',
  },
  {
    id: 12,
    path: '/dashboard/payments',
    icon: DollarSign,
    label: 'Payments',
  },
  // { id: 13, path: '/dashboard/profile', icon: User, label: 'Profile' },
  // { id: 14, path: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

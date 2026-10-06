import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { GUARDIAN_ROLES, TEACHER_ROLES } from '../dashboardNav'

/**
 * Restricts access to dashboard routes by the signed-in user's role.
 * Renders `children` when provided, otherwise an `<Outlet />` for nested routes.
 */
const RequireRole = ({
  allowedRoles,
  redirectTo = '/dashboard',
  children,
}) => {
  const userRole = useSelector((state) => state.user.user?.role)

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />
  }

  return children ?? <Outlet />
}

export const TeacherOnly = ({ children }) => (
  <RequireRole allowedRoles={TEACHER_ROLES}>{children}</RequireRole>
)

export const GuardianOnly = ({ children }) => (
  <RequireRole allowedRoles={GUARDIAN_ROLES}>{children}</RequireRole>
)

export default RequireRole

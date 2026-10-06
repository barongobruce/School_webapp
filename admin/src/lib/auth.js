const TOKEN_KEY = 'adminToken'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export const isAuthenticated = () => Boolean(getToken())

export const formatAdminRole = (role) => {
  if (role === 'superadmin') return 'Super Admin'
  if (role === 'admin') return 'Administrator'
  return role || 'Administrator'
}

export const getAdminFullName = (admin) => {
  if (!admin) return ''
  return [admin.firstName, admin.lastName].filter(Boolean).join(' ').trim()
}
const TOKEN_KEY = 'userToken'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export const isAuthenticated = () => Boolean(getToken())

export const formatUserRole = (role) => {
  if (!role) return ''
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export const getUserFullName = (user) => {
  if (!user) return ''
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
}

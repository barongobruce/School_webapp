import { api, getErrorMessage } from './api'

export const getAdminDashboard = async () => {
  try {
    const { data } = await api.get('/api/admin/dashboard')
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

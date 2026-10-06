import { api, getErrorMessage } from './api'

export const getMyDashboard = async () => {
  try {
    const { data } = await api.get('/api/user/dashboard')
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

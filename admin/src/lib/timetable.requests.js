import { api, getErrorMessage } from './api'

export const getAdminTimetables = async (params = {}) => {
  try {
    const { data } = await api.get('/api/admin/timetables', { params })
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

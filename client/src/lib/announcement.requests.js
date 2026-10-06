import { api, getErrorMessage } from './api'

export const getMyAnnouncements = async ({
  search = '',
  category,
  severity,
} = {}) => {
  try {
    const params = {}
    if (search) params.search = search
    if (category && category !== 'All') params.category = category
    if (severity && severity !== 'All') params.severity = severity

    const { data } = await api.get('/api/user/announcements', {
      params: Object.keys(params).length ? params : undefined,
    })
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getMyAnnouncementById = async (id) => {
  try {
    const { data } = await api.get(`/api/user/announcements/${id}`)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

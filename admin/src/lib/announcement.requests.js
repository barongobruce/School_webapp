import { api, getErrorMessage } from './api'

export const getAnnouncements = async ({
  search = '',
  category,
  severity,
  targetAudience,
} = {}) => {
  try {
    const params = {}
    if (search) params.search = search
    if (category) params.category = category
    if (severity) params.severity = severity
    if (targetAudience) params.targetAudience = targetAudience

    const { data } = await api.get('/api/admin/announcements', {
      params: Object.keys(params).length ? params : undefined,
    })
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getAnnouncementById = async (id) => {
  try {
    const { data } = await api.get(`/api/admin/announcements/${id}`)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const addAnnouncement = async (announcementData) => {
  try {
    const { data } = await api.post('/api/admin/announcements', announcementData)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const updateAnnouncement = async (id, announcementData) => {
  try {
    const { data } = await api.patch(
      `/api/admin/announcements/${id}`,
      announcementData,
    )
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

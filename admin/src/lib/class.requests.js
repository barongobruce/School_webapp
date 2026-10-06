import { api, getErrorMessage } from './api'

export const getClasses = async ({ search = '', isActive } = {}) => {
  try {
    const params = {}
    if (search) params.search = search
    if (isActive === true || isActive === false) params.isActive = String(isActive)

    const { data } = await api.get('/api/admin/classes', {
      params: Object.keys(params).length ? params : undefined,
    })
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getClassById = async (id) => {
  try {
    const { data } = await api.get(`/api/admin/classes/${id}`)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const addClass = async (classData) => {
  try {
    const { data } = await api.post('/api/admin/classes', classData)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const updateClass = async (id, classData) => {
  try {
    const { data } = await api.patch(`/api/admin/classes/${id}`, classData)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

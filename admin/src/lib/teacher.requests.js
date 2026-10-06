import { api, getErrorMessage } from './api'
import { normalizeTeacher, normalizeTeachers } from './normalizeTeacher'

export const getTeachers = async (search = '') => {
  try {
    const { data } = await api.get('/api/admin/teachers', {
      params: search ? { search } : undefined,
    })

    return {
      ...data,
      teachers: normalizeTeachers(data.teachers || []),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getTeacherById = async (id) => {
  try {
    const { data } = await api.get(`/api/admin/teachers/${id}`)

    return {
      ...data,
      teacher: normalizeTeacher(data.teacher),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const addTeacher = async (formData) => {
  try {
    const { data } = await api.post('/api/admin/teachers', formData)

    return {
      ...data,
      teacher: normalizeTeacher(data.teacher),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const updateTeacher = async (id, formData) => {
  try {
    const { data } = await api.put(`/api/admin/teachers/${id}`, formData)

    return {
      ...data,
      teacher: normalizeTeacher(data.teacher),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const setTeacherStatus = async (id, isActive) => {
  try {
    const { data } = await api.patch(`/api/admin/teachers/${id}/status`, {
      isActive,
    })

    return {
      ...data,
      teacher: normalizeTeacher(data.teacher),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

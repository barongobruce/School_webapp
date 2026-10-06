import { api, getErrorMessage } from './api'
import { normalizeStudent, normalizeStudents } from './normalizePerson'

export const getStudents = async ({ search = '', isActive } = {}) => {
  try {
    const params = {}
    if (search) params.search = search
    if (isActive === true || isActive === false) params.isActive = String(isActive)

    const { data } = await api.get('/api/admin/students', {
      params: Object.keys(params).length ? params : undefined,
    })

    return {
      ...data,
      students: normalizeStudents(data.students || []),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getStudentById = async (id) => {
  try {
    const { data } = await api.get(`/api/admin/students/${id}`)

    return {
      ...data,
      student: normalizeStudent(data.student),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const addStudent = async (formData) => {
  try {
    const { data } = await api.post('/api/admin/students', formData)

    return {
      ...data,
      student: normalizeStudent(data.student),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const updateStudent = async (id, formData) => {
  try {
    const { data } = await api.patch(`/api/admin/students/${id}`, formData)

    return {
      ...data,
      student: normalizeStudent(data.student),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const setStudentStatus = async (id, isActive) => {
  try {
    const { data } = await api.patch(`/api/admin/students/${id}/status`, {
      isActive,
    })

    return {
      ...data,
      student: normalizeStudent(data.student),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

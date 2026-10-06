import { api, getErrorMessage } from './api'
import { normalizeStudent, normalizeStudents } from './normalizePerson'

export const getMyStudents = async ({ search = '' } = {}) => {
  try {
    const params = {}
    if (search) params.search = search

    const { data } = await api.get('/api/user/students', {
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

export const getMyStudentById = async (id) => {
  try {
    const { data } = await api.get(`/api/user/students/${id}`)
    return {
      ...data,
      student: normalizeStudent(data.student),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

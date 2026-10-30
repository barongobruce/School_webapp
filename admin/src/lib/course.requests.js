import { api, getErrorMessage } from './api'

export const getCourses = async ({
  search = '',
  courseStatus,
  courseType,
} = {}) => {
  try {
    const params = {}
    if (search) params.search = search
    if (courseStatus) params.courseStatus = courseStatus
    if (courseType) params.courseType = courseType

    const { data } = await api.get('/api/admin/courses', {
      params: Object.keys(params).length ? params : undefined,
    })
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getCourseById = async (id) => {
  try {
    const { data } = await api.get(`/api/admin/courses/${id}`)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const addCourse = async (courseData) => {
  try {
    const { data } = await api.post('/api/admin/courses', courseData)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const updateCourse = async (id, courseData) => {
  try {
    const { data } = await api.patch(`/api/admin/courses/${id}`, courseData)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const updateCourseStudents = async (id, studentIds) => {
  try {
    const { data } = await api.patch(
      `/api/admin/courses/${id}/enrolments`,
      { studentIds },
    )
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

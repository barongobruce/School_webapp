import { api, getErrorMessage } from './api'

const requestData = async (request) => {
  try {
    const { data } = await request
    return data
  } catch (error) {
    const requestError = new Error(getErrorMessage(error))
    requestError.status = error.response?.status
    throw requestError
  }
}

export const getMyTimetables = () =>
  requestData(api.get('/api/user/timetables'))

export const getTeacherTimetable = (classId, params) =>
  requestData(api.get(`/api/teacher/timetables/${classId}`, { params }))

export const saveTeacherTimetableDraft = (classId, payload) =>
  requestData(api.put(`/api/teacher/timetables/${classId}`, payload))

export const publishTeacherTimetable = (classId, payload) =>
  requestData(
    api.post(`/api/teacher/timetables/${classId}/publish`, payload),
  )

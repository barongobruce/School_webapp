import { api, getErrorMessage } from './api'

export const ATTENDANCE_STATUSES = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'excused', label: 'Excused' },
]

const normalizeAttendance = (record) => {
  if (!record || typeof record !== 'object') return record

  return {
    ...record,
    id: record.id || record._id,
    studentId: record.studentId || record.student?._id || record.student || null,
    lessonId: record.lessonId || record.lesson?._id || record.lesson || null,
    classId: record.classId || record.class?._id || record.class || null,
    note: record.note || '',
  }
}

const normalizeRosterItem = (item) => {
  if (!item || typeof item !== 'object') return item

  return {
    ...item,
    studentId: String(item.studentId || item._id || ''),
    name:
      item.name ||
      `${item.firstName || ''} ${item.lastName || ''}`.trim() ||
      'Student',
    status: item.status || null,
    note: item.note || '',
  }
}

const toParams = (filters = {}) => {
  const params = {}
  Object.entries(filters).forEach(([key, value]) => {
    if (value == null || value === '' || value === 'All') return
    params[key] = value
  })
  return params
}

export const getMyAttendance = async (filters = {}) => {
  try {
    const { data } = await api.get('/api/user/attendance', {
      params: toParams(filters),
    })

    return {
      ...data,
      records: (data.records || []).map(normalizeAttendance),
      wards: data.wards || [],
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getMyAttendanceSummary = async (filters = {}) => {
  try {
    const { data } = await api.get('/api/user/attendance/summary', {
      params: toParams(filters),
    })

    return {
      ...data,
      recent: (data.recent || []).map(normalizeAttendance),
      wards: data.wards || [],
      summary: data.summary || {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        presentRate: 0,
      },
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getMyLessonAttendance = async (lessonId) => {
  try {
    const { data } = await api.get(`/api/user/attendance/lessons/${lessonId}`)

    return {
      ...data,
      records: (data.records || []).map(normalizeAttendance),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getTeacherAttendanceLessons = async () => {
  try {
    const { data } = await api.get('/api/teacher/attendance/lessons')

    return {
      ...data,
      lessons: data.lessons || [],
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getLessonAttendanceRoster = async (lessonId) => {
  try {
    const { data } = await api.get(
      `/api/teacher/attendance/lessons/${lessonId}`,
    )

    return {
      ...data,
      roster: (data.roster || []).map(normalizeRosterItem),
      summary: data.summary || {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        presentRate: 0,
        rosterSize: 0,
        markedCount: 0,
        unmarkedCount: 0,
        isComplete: false,
      },
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const saveLessonAttendance = async (lessonId, records) => {
  try {
    const { data } = await api.put(
      `/api/teacher/attendance/lessons/${lessonId}`,
      { records },
    )

    return {
      ...data,
      roster: (data.roster || []).map(normalizeRosterItem),
      summary: data.summary || {},
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

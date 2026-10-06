import { api, getErrorMessage } from './api'

const normalizeHomework = (homework) => {
  if (!homework || typeof homework !== 'object') return homework

  const classItem =
    homework.class && typeof homework.class === 'object' ? homework.class : null
  const courseDoc =
    homework.course && typeof homework.course === 'object'
      ? homework.course
      : null

  return {
    ...homework,
    id: homework.id || homework._id,
    className: homework.className || classItem?.className || '',
    classCode: homework.classCode || classItem?.classCode || '',
    courseId: homework.courseId || courseDoc?._id || homework.course || null,
    courseName:
      homework.courseName || courseDoc?.courseName || homework.subject || '',
    courseCode: homework.courseCode || courseDoc?.courseCode || '',
    subject:
      homework.subject || courseDoc?.courseName || homework.courseName || '',
    teacher: homework.teacher || homework.teacherName || '',
    materials: Array.isArray(homework.materials) ? homework.materials : [],
  }
}

const normalizeHomeworks = (homeworks = []) => homeworks.map(normalizeHomework)

const INSTRUCTIONS_MAX = 5000

const appendIfValue = (formData, key, value) => {
  if (value == null) return
  const text = typeof value === 'string' ? value.trim() : value
  if (text === '') return
  formData.append(key, text)
}

const buildHomeworkFormData = ({
  title,
  course,
  class: classId,
  dueDate,
  instructions,
  existingMaterials = [],
  materials = [],
} = {}) => {
  const formData = new FormData()

  appendIfValue(formData, 'title', title)
  appendIfValue(formData, 'course', course)
  appendIfValue(formData, 'class', classId)
  appendIfValue(formData, 'dueDate', dueDate)
  appendIfValue(
    formData,
    'instructions',
    String(instructions ?? '')
      .trim()
      .slice(0, INSTRUCTIONS_MAX),
  )
  formData.append('existingMaterials', JSON.stringify(existingMaterials || []))

  ;(materials || []).forEach((file) => {
    if (file instanceof File) {
      formData.append('materials', file)
    }
  })

  return formData
}

export const getMyHomeworks = async () => {
  try {
    const { data } = await api.get('/api/user/homeworks')

    return {
      ...data,
      homeworks: normalizeHomeworks(data.homeworks || []),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getMyHomeworkById = async (id) => {
  try {
    const { data } = await api.get(`/api/user/homeworks/${id}`)

    return {
      ...data,
      homework: normalizeHomework(data.homework),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const createHomework = async (payload) => {
  try {
    const formData = buildHomeworkFormData(payload)
    const { data } = await api.post('/api/teacher/homeworks', formData)

    return {
      ...data,
      homework: normalizeHomework(data.homework),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const updateHomework = async (id, payload) => {
  try {
    const formData = buildHomeworkFormData(payload)
    const { data } = await api.patch(`/api/teacher/homeworks/${id}`, formData)

    return {
      ...data,
      homework: normalizeHomework(data.homework),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getMaterialFileName = (url = '') => {
  if (!url || typeof url !== 'string') return 'Attachment'

  try {
    const path = decodeURIComponent(url.split('?')[0] || '')
    const name = path.split('/').pop() || 'Attachment'
    return name.replace(/^\d+-/, '') || 'Attachment'
  } catch {
    return 'Attachment'
  }
}

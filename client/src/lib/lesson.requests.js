import { api, getErrorMessage } from './api'

const normalizeLesson = (lesson) => {
  if (!lesson || typeof lesson !== 'object') return lesson

  const classItem =
    lesson.class && typeof lesson.class === 'object' ? lesson.class : null
  const courseDoc =
    lesson.course && typeof lesson.course === 'object' ? lesson.course : null

  return {
    ...lesson,
    id: lesson.id || lesson._id,
    className: lesson.className || classItem?.className || '',
    classCode: lesson.classCode || classItem?.classCode || '',
    courseId: lesson.courseId || courseDoc?._id || lesson.course || null,
    courseName:
      lesson.courseName || courseDoc?.courseName || lesson.subject || '',
    courseCode: lesson.courseCode || courseDoc?.courseCode || '',
    subject: lesson.subject || courseDoc?.courseName || lesson.courseName || '',
    teacher: lesson.teacher || lesson.teacherName || '',
    materials: Array.isArray(lesson.materials) ? lesson.materials : [],
  }
}

const normalizeLessons = (lessons = []) => lessons.map(normalizeLesson)

const normalizeCourse = (course) => {
  if (!course || typeof course !== 'object') return course

  return {
    ...course,
    id: course.id || course._id,
    value: String(course.id || course._id),
    label: course.courseName,
    description: course.courseCode
      ? `${course.courseCode}${course.className ? ` · ${course.className}` : ''}`
      : course.className || undefined,
  }
}

const NOTES_MAX = 5000
const TEACHER_NOTES_MAX = 1000

const appendIfValue = (formData, key, value) => {
  if (value == null) return
  const text = typeof value === 'string' ? value.trim() : value
  if (text === '') return
  formData.append(key, text)
}

const buildLessonFormData = ({
  title,
  course,
  class: classId,
  scheduledAt,
  durationMinutes,
  notes,
  teacherNotes,
  existingMaterials = [],
  materials = [],
} = {}) => {
  const formData = new FormData()

  appendIfValue(formData, 'title', title)
  appendIfValue(formData, 'course', course)
  appendIfValue(formData, 'class', classId)
  appendIfValue(formData, 'scheduledAt', scheduledAt)
  appendIfValue(formData, 'durationMinutes', String(durationMinutes ?? ''))
  appendIfValue(
    formData,
    'notes',
    String(notes ?? '')
      .trim()
      .slice(0, NOTES_MAX),
  )
  appendIfValue(
    formData,
    'teacherNotes',
    String(teacherNotes ?? '')
      .trim()
      .slice(0, TEACHER_NOTES_MAX),
  )
  formData.append('existingMaterials', JSON.stringify(existingMaterials || []))

  ;(materials || []).forEach((file) => {
    if (file instanceof File) {
      formData.append('materials', file)
    }
  })

  return formData
}

export const getMyCourses = async () => {
  try {
    const { data } = await api.get('/api/user/courses')

    return {
      ...data,
      courses: (data.courses || []).map(normalizeCourse),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getMyLessons = async () => {
  try {
    const { data } = await api.get('/api/user/lessons')

    return {
      ...data,
      lessons: normalizeLessons(data.lessons || []),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getMyLessonById = async (id) => {
  try {
    const { data } = await api.get(`/api/user/lessons/${id}`)

    return {
      ...data,
      lesson: normalizeLesson(data.lesson),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const createLesson = async (payload) => {
  try {
    const formData = buildLessonFormData(payload)
    const { data } = await api.post('/api/teacher/lessons', formData)

    return {
      ...data,
      lesson: normalizeLesson(data.lesson),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const updateLesson = async (id, payload) => {
  try {
    const formData = buildLessonFormData(payload)
    const { data } = await api.patch(`/api/teacher/lessons/${id}`, formData)

    return {
      ...data,
      lesson: normalizeLesson(data.lesson),
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

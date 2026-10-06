import { api, getErrorMessage } from './api'

export const EXAM_TYPE_OPTIONS = [
  { value: 'midterm', label: 'Mid-term' },
  { value: 'final', label: 'Final' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'unit_test', label: 'Unit test' },
  { value: 'other', label: 'Other' },
]

export const EXAM_STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const EXAM_TYPE_LABELS = Object.fromEntries(
  EXAM_TYPE_OPTIONS.map((item) => [item.value, item.label]),
)

const EXAM_STATUS_LABELS = Object.fromEntries(
  EXAM_STATUS_OPTIONS.map((item) => [item.value, item.label]),
)

const normalizeExam = (exam) => {
  if (!exam || typeof exam !== 'object') return exam

  const classItem =
    exam.class && typeof exam.class === 'object' ? exam.class : null
  const examType = exam.examType || 'other'
  const status = exam.status || 'scheduled'

  return {
    ...exam,
    id: exam.id || exam._id,
    classId: exam.classId || classItem?._id || exam.class || null,
    className: exam.className || classItem?.className || '',
    classCode: exam.classCode || classItem?.classCode || '',
    subject: exam.subject || '',
    teacher: exam.teacher || exam.teacherName || '',
    examType,
    examTypeLabel: exam.examTypeLabel || EXAM_TYPE_LABELS[examType] || examType,
    status,
    statusLabel: exam.statusLabel || EXAM_STATUS_LABELS[status] || status,
    venue: exam.venue || '',
    instructions: exam.instructions || '',
    description: exam.description || '',
    startTime: exam.startTime || '',
    endTime: exam.endTime || '',
    duration: exam.duration ?? null,
    totalMarks: exam.totalMarks ?? 0,
    passingMarks: exam.passingMarks ?? 0,
    resultsCount: exam.resultsCount ?? 0,
  }
}

const normalizeResult = (row) => {
  if (!row || typeof row !== 'object') return row
  return {
    ...row,
    studentId: String(row.studentId || row.student || ''),
    firstName: row.firstName || '',
    lastName: row.lastName || '',
    name: row.name || `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Student',
    photo: row.photo || '',
    marksObtained: row.isAbsent ? null : row.marksObtained ?? null,
    grade: row.grade || '',
    remarks: row.remarks || '',
    isAbsent: Boolean(row.isAbsent),
    hasResult: Boolean(row.hasResult),
    percentage: row.percentage ?? null,
    passed: row.passed ?? null,
  }
}

const normalizeExams = (exams = []) => exams.map(normalizeExam)
const normalizeResults = (results = []) => results.map(normalizeResult)

export const getMyExams = async () => {
  try {
    const { data } = await api.get('/api/user/exams')

    return {
      ...data,
      exams: normalizeExams(data.exams || []),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getMyExamById = async (id) => {
  try {
    const { data } = await api.get(`/api/user/exams/${id}`)

    return {
      ...data,
      exam: normalizeExam(data.exam),
      results: normalizeResults(data.results || []),
      resultsSummary: data.resultsSummary || null,
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const createExam = async (payload) => {
  try {
    const { data } = await api.post('/api/teacher/exams', payload)

    return {
      ...data,
      exam: normalizeExam(data.exam),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const updateExam = async (id, payload) => {
  try {
    const { data } = await api.patch(`/api/teacher/exams/${id}`, payload)

    return {
      ...data,
      exam: normalizeExam(data.exam),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const saveExamResults = async (id, results) => {
  try {
    const { data } = await api.put(`/api/teacher/exams/${id}/results`, {
      results,
    })

    return {
      ...data,
      exam: normalizeExam(data.exam),
      results: normalizeResults(data.results || []),
      resultsSummary: data.resultsSummary || null,
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

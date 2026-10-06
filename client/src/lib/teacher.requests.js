import { api, getErrorMessage } from './api'
import {
  normalizeGuardian,
  normalizeGuardians,
  normalizeStudents,
} from './normalizePerson'

const normalizeClass = (classItem) => {
  if (!classItem || typeof classItem !== 'object') return classItem

  return {
    ...classItem,
    students: normalizeStudents(classItem.students || []),
  }
}

const normalizeClasses = (classes = []) =>
  classes.map((classItem) => normalizeClass(classItem))

export const getTeacherClasses = async () => {
  try {
    const { data } = await api.get('/api/teacher/classes')

    return {
      ...data,
      classes: normalizeClasses(data.classes || []),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getTeacherClassById = async (id) => {
  try {
    const { data } = await api.get(`/api/teacher/classes/${id}`)

    return {
      ...data,
      class: normalizeClass(data.class),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getTeacherGuardians = async () => {
  try {
    const { data } = await api.get('/api/teacher/guardians')

    return {
      ...data,
      guardians: normalizeGuardians(data.guardians || []),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getTeacherGuardianById = async (id) => {
  try {
    const { data } = await api.get(`/api/teacher/guardians/${id}`)

    return {
      ...data,
      guardian: normalizeGuardian(data.guardian),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

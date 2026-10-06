import { flattenUserOnto } from './normalizePerson'

/**
 * Flattens nested User identity fields onto the teacher profile
 * so list/detail/edit UI can keep using teacher.firstName, etc.
 */
export const normalizeTeacher = (teacher) => {
  if (!teacher || typeof teacher !== 'object') return teacher
  return flattenUserOnto(teacher, 'teacher')
}

export const normalizeTeachers = (teachers = []) =>
  teachers.map((teacher) => normalizeTeacher(teacher))

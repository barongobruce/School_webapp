const flattenAddress = (address = {}) => ({
  street: address.street || '',
  city: address.city || '',
  state: address.state || address.region || '',
  zip: address.zip || address.postalCode || '',
  country: address.country || '',
  region: address.region || address.state || '',
  postalCode: address.postalCode || address.zip || '',
})

export const flattenUserOnto = (entity, defaultRole = '') => {
  if (!entity || typeof entity !== 'object') return entity

  const user =
    entity.user && typeof entity.user === 'object' ? entity.user : null

  if (!user) {
    return {
      ...entity,
      photo: entity.photo || entity.picture || '',
      picture: entity.picture || entity.photo || '',
      address: flattenAddress(entity.address || {}),
      contactInfo: entity.contactInfo || {},
    }
  }

  const photo = user.photo || entity.photo || entity.picture || ''

  return {
    ...entity,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    photo,
    picture: photo,
    isActive: typeof user.isActive === 'boolean' ? user.isActive : true,
    contactInfo: user.contactInfo ?? {},
    address: flattenAddress(user.address || entity.address || {}),
    socialMedia: user.socialMedia ?? {},
    gender: user.gender ?? entity.gender,
    dateOfBirth: user.dateOfBirth ?? entity.dateOfBirth,
    role: user.role || defaultRole,
    userId: user._id || user.id,
    user,
  }
}

export const normalizeStudent = (student) => {
  if (!student || typeof student !== 'object') return student

  const base = flattenUserOnto(student, 'student')

  return {
    ...base,
    guardian: base.guardian
      ? flattenUserOnto(base.guardian, 'guardian')
      : base.guardian,
    teachers: Array.isArray(base.teachers)
      ? base.teachers.map((teacher) =>
          teacher && typeof teacher === 'object'
            ? flattenUserOnto(teacher, 'teacher')
            : teacher,
        )
      : base.teachers,
  }
}

export const normalizeStudents = (students = []) =>
  students.map((student) => normalizeStudent(student))

export const normalizeGuardian = (guardian) => {
  if (!guardian || typeof guardian !== 'object') return guardian

  const base = flattenUserOnto(guardian, 'guardian')

  return {
    ...base,
    students: Array.isArray(base.students)
      ? base.students.map((student) =>
          student && typeof student === 'object'
            ? flattenUserOnto(student, 'student')
            : student,
        )
      : base.students,
  }
}

export const normalizeGuardians = (guardians = []) =>
  guardians.map((guardian) => normalizeGuardian(guardian))

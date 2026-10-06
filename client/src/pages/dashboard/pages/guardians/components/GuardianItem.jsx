import React from 'react'
import {
  GraduationCap,
  IdCard,
  MapPin,
  Phone,
} from 'lucide-react'
import Button from '../../../../../components/Button'

const statusClass = (status) =>
  status === 'Active'
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
    : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'

const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const avatarRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const studentAvatarRadius = { borderRadius: '0.55rem 0.18rem 0.55rem 0.18rem' }

const getGuardianId = (guardian) => guardian._id || guardian.id

const getStatus = (guardian) => {
  const isActive =
    typeof guardian.isActive === 'boolean'
      ? guardian.isActive
      : guardian.user?.isActive

  if (typeof isActive === 'boolean') {
    return isActive ? 'Active' : 'Inactive'
  }
  return guardian.status || 'Active'
}

const getPhone = (guardian) =>
  guardian.contactInfo?.phone ||
  guardian.user?.contactInfo?.phone ||
  guardian.phone ||
  '—'

const getLocation = (guardian) => {
  const address = guardian.address || guardian.user?.address || {}
  const parts = [address.city, address.country].filter(Boolean)
  return parts.length ? parts.join(', ') : '—'
}

const getSubtitle = (guardian) =>
  guardian.idType ||
  guardian.email ||
  guardian.user?.email ||
  'Guardian'

const resolveStudents = (students = []) =>
  students.map((student) => {
    if (student && typeof student === 'object') {
      const id = student._id || student.id
      const firstName = student.firstName || student.user?.firstName || ''
      const lastName = student.lastName || student.user?.lastName || ''
      const name = `${firstName} ${lastName}`.trim() || 'Student'

      return {
        id,
        name,
        photo: student.photo || student.user?.photo || null,
      }
    }

    return { id: student, name: String(student), photo: null }
  })

const GuardianStudents = ({ students: studentRefs, compact = false }) => {
  const students = resolveStudents(studentRefs)
  const count = students.length

  if (count === 0) {
    return (
      <p className='text-[12px] text-gray-400 dark:text-gray-500'>
        No linked students
      </p>
    )
  }

  if (compact) {
    return (
      <span
        className='inline-flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-800 dark:bg-blue-500/15 dark:text-blue-300'
        style={chipRadius}
      >
        <GraduationCap className='size-3' strokeWidth={2} />
        {count} {count === 1 ? 'student' : 'students'}
      </span>
    )
  }

  return (
    <div>
      <div className='mb-2 flex items-center justify-between gap-2'>
        <p className='text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-gray-400'>
          Students
        </p>
        <span
          className='bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800 dark:bg-blue-500/15 dark:text-blue-300'
          style={chipRadius}
        >
          {count}
        </span>
      </div>

      <ul className='flex flex-wrap gap-1.5'>
        {students.map((student) => (
          <li key={student.id}>
            <span
              title={student.name}
              className='inline-flex max-w-full items-center gap-1.5 border border-blue-100 bg-blue-50/70 py-1 pr-2.5 pl-1 text-[11px] font-medium text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200'
              style={chipRadius}
            >
              <span
                className='size-5 shrink-0 overflow-hidden'
                style={studentAvatarRadius}
              >
                {student.photo ? (
                  <img
                    src={student.photo}
                    alt=''
                    className='!h-full !w-full object-cover'
                  />
                ) : (
                  <span className='grid !h-full !w-full place-items-center bg-blue-200 text-[9px] font-semibold text-blue-800 dark:bg-blue-500/30 dark:text-blue-200'>
                    {student.name.charAt(0)}
                  </span>
                )}
              </span>
              <span className='truncate'>{student.name.split(' ')[0]}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const GuardianAvatar = ({ guardian, className = 'size-11' }) => {
  const firstName = guardian.firstName || guardian.user?.firstName || ''
  const lastName = guardian.lastName || guardian.user?.lastName || ''
  const photo = guardian.photo || guardian.user?.photo || ''
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()

  return (
    <div
      className={`${className} shrink-0 overflow-hidden shadow-[var(--shadow-soft)]`}
      style={avatarRadius}
    >
      {photo ? (
        <img
          src={photo}
          alt=''
          className='!h-full !w-full object-cover'
        />
      ) : (
        <div className='flex !h-full !w-full items-center justify-center bg-blue-100 text-xs font-semibold text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'>
          {initials || '?'}
        </div>
      )}
    </div>
  )
}

const GuardianItem = ({ guardian, view = 'grid' }) => {
  const guardianId = getGuardianId(guardian)
  const firstName = guardian.firstName || guardian.user?.firstName || ''
  const lastName = guardian.lastName || guardian.user?.lastName || ''
  const email = guardian.email || guardian.user?.email || ''
  const fullName = `${firstName} ${lastName}`.trim() || 'Unnamed guardian'
  const status = getStatus(guardian)
  const phone = getPhone(guardian)
  const location = getLocation(guardian)
  const subtitle = getSubtitle(guardian)
  const studentCount = guardian.students?.length ?? 0

  if (view === 'list') {
    return (
      <article
        className='flex items-center gap-3 bg-white p-3 shadow-[var(--shadow-soft)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] dark:bg-[#152238] sm:gap-4 sm:px-4'
        style={cardRadius}
      >
        <GuardianAvatar guardian={guardian} className='size-10 sm:size-11' />

        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
            <h2 className='truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
              {fullName}
            </h2>
            <span className='truncate text-[11px] text-gray-400 dark:text-gray-500'>
              {email || guardianId}
            </span>
          </div>
          <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            {subtitle}
            <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
            {phone}
          </p>
        </div>

        <GuardianStudents students={guardian.students} compact />

        <span
          className={`hidden shrink-0 px-2.5 py-1 text-[11px] font-medium sm:inline-flex ${statusClass(status)}`}
          style={chipRadius}
        >
          {status}
        </span>

        <Button
          to={`/dashboard/guardians/${guardianId}`}
          variant='secondary'
          size='sm'
        >
          View
        </Button>
      </article>
    )
  }

  return (
    <article
      className='flex h-full flex-col bg-white p-4 shadow-[var(--shadow-soft)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] dark:bg-[#152238]'
      style={cardRadius}
    >
      <div className='flex items-start gap-3'>
        <GuardianAvatar guardian={guardian} />

        <div className='min-w-0 flex-1'>
          <h2 className='truncate text-[14px] font-semibold tracking-tight text-gray-900 dark:text-white'>
            {fullName}
          </h2>
          <p className='mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            <IdCard className='size-3 shrink-0' strokeWidth={1.75} />
            <span className='truncate'>{subtitle}</span>
          </p>
        </div>

        <span
          className={`shrink-0 px-2.5 py-1 text-[11px] font-medium ${statusClass(status)}`}
          style={chipRadius}
        >
          {status}
        </span>
      </div>

      <div className='mt-3 flex flex-wrap gap-1.5'>
        <span
          className='inline-flex items-center gap-1 bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200'
          style={chipRadius}
        >
          <MapPin className='size-3' strokeWidth={2} />
          {location}
        </span>
        <span
          className='inline-flex items-center gap-1 bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200'
          style={chipRadius}
        >
          <Phone className='size-3' strokeWidth={2} />
          {phone}
        </span>
        <span
          className='inline-flex items-center gap-1 bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-800 dark:bg-blue-500/15 dark:text-blue-300'
          style={chipRadius}
        >
          <GraduationCap className='size-3' strokeWidth={2} />
          {studentCount} {studentCount === 1 ? 'student' : 'students'}
        </span>
      </div>

      <div
        className='mt-3 border border-dashed border-blue-200/80 bg-blue-50/40 p-3 dark:border-blue-500/20 dark:bg-blue-500/10'
        style={{ borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }}
      >
        <GuardianStudents students={guardian.students} />
      </div>

      <div className='mt-auto flex items-center justify-between gap-3 pt-4'>
        <p className='truncate text-[12px] text-gray-400 dark:text-gray-500'>
          {email || 'No email on file'}
        </p>
        <Button
          to={`/dashboard/guardians/${guardianId}`}
          variant='secondary'
          size='sm'
        >
          View Profile
        </Button>
      </div>
    </article>
  )
}

export default GuardianItem

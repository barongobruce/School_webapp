import React from 'react'
import {
  Bookmark,
  Calendar,
  MapPin,
  School,
  UserRound,
} from 'lucide-react'
import Button from '../../../../../components/Button'

const formatFees = (amount) =>
  new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 0,
  }).format(amount)

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const statusClass = (status) =>
  status === 'Active'
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
    : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'

const getStudentId = (student) => student._id || student.id

const getStatus = (student) => {
  const isActive =
    typeof student.isActive === 'boolean'
      ? student.isActive
      : student.user?.isActive

  if (typeof isActive === 'boolean') {
    return isActive ? 'Active' : 'Inactive'
  }
  return student.status || 'Active'
}

const getLocation = (student) => {
  const address = student.address || student.user?.address || {}
  const parts = [address.city, address.country].filter(Boolean)
  return parts.length ? parts.join(', ') : '—'
}

const getClassLabel = (student) => {
  if (student.classGrade) return student.classGrade
  if (typeof student.class === 'object' && student.class) {
    return (
      student.class.className ||
      (student.class.grade != null ? `Grade ${student.class.grade}` : '') ||
      student.class.classCode ||
      '—'
    )
  }
  return '—'
}

const getGuardianName = (student) => {
  const guardian = student.guardian
  if (!guardian) return 'No guardian linked'

  const firstName = guardian.firstName || guardian.user?.firstName || ''
  const lastName = guardian.lastName || guardian.user?.lastName || ''
  return `${firstName} ${lastName}`.trim() || 'No guardian linked'
}

const getAdmittedDate = (student) =>
  student.dateOfAdmission || student.createdAt

const getFeesLabel = (student) => {
  if (typeof student.feesBalance !== 'number') return null
  return student.feesBalance === 0 ? 'Paid in full' : formatFees(student.feesBalance)
}

const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const avatarRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }

const StudentAvatar = ({ student, className = 'size-11' }) => {
  const firstName = student.firstName || student.user?.firstName || ''
  const lastName = student.lastName || student.user?.lastName || ''
  const photo = student.photo || student.user?.photo || ''
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

const StudentItem = ({ student, view = 'grid' }) => {
  const studentId = getStudentId(student)
  const firstName = student.firstName || student.user?.firstName || ''
  const lastName = student.lastName || student.user?.lastName || ''
  const email = student.email || student.user?.email || ''
  const fullName = `${firstName} ${lastName}`.trim() || 'Unnamed student'
  const location = getLocation(student)
  const status = getStatus(student)
  const classLabel = getClassLabel(student)
  const guardianName = getGuardianName(student)
  const admittedDate = getAdmittedDate(student)
  const feesLabel = getFeesLabel(student)

  if (view === 'list') {
    return (
      <article
        className='flex items-center gap-3 bg-white p-3 shadow-[var(--shadow-soft)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] dark:bg-[#152238] sm:gap-4 sm:px-4'
        style={cardRadius}
      >
        <StudentAvatar student={student} className='size-10 sm:size-11' />

        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
            <h2 className='truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
              {fullName}
            </h2>
            <span className='truncate text-[11px] text-gray-400 dark:text-gray-500'>
              {classLabel}
            </span>
          </div>
          <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            {guardianName}
            {feesLabel && (
              <>
                <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
                <span
                  className={
                    student.feesBalance === 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-blue-700 dark:text-blue-400'
                  }
                >
                  {feesLabel}
                </span>
              </>
            )}
          </p>
        </div>

        <span
          className={`hidden shrink-0 px-2.5 py-1 text-[11px] font-medium sm:inline-flex ${statusClass(status)}`}
          style={{ borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }}
        >
          {status}
        </span>

        <Button
          to={`/dashboard/students/${studentId}`}
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
        <StudentAvatar student={student} />

        <div className='min-w-0 flex-1'>
          <h2 className='truncate text-[14px] font-semibold tracking-tight text-gray-900 dark:text-white'>
            {fullName}
          </h2>
          <p className='mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            <UserRound className='size-3 shrink-0' strokeWidth={1.75} />
            <span className='truncate'>{guardianName}</span>
          </p>
        </div>

        <button
          type='button'
          aria-label={`Bookmark ${fullName}`}
          className='shrink-0 p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:hover:bg-white/8 dark:hover:text-gray-200'
          style={{ borderRadius: '0.7rem 0.2rem 0.7rem 0.2rem' }}
        >
          <Bookmark className='size-3.5' strokeWidth={1.75} />
        </button>
      </div>

      <div className='mt-3 flex flex-wrap gap-1.5'>
        <span
          className='inline-flex items-center gap-1 bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200'
          style={{ borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }}
        >
          <MapPin className='size-3' strokeWidth={2} />
          {location}
        </span>
        <span
          className={`inline-flex px-2 py-1 text-[11px] font-medium ${statusClass(status)}`}
          style={{ borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }}
        >
          {status}
        </span>
        <span
          className='inline-flex items-center gap-1 bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200'
          style={{ borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }}
        >
          <School className='size-3' strokeWidth={2} />
          {classLabel}
        </span>
      </div>

      {admittedDate && (
        <p className='mt-3 flex items-center gap-1.5 text-[12px] text-gray-500 dark:text-gray-400'>
          <Calendar className='size-3 shrink-0' strokeWidth={1.75} />
          Admitted {formatDate(admittedDate)}
        </p>
      )}

      <div className='mt-auto flex items-center justify-between gap-3 pt-4'>
        {feesLabel ? (
          <p
            className={`text-[13px] font-semibold ${
              student.feesBalance === 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-blue-700 dark:text-blue-400'
            }`}
          >
            {feesLabel}
          </p>
        ) : (
          <p className='truncate text-[12px] text-gray-400 dark:text-gray-500'>
            {email || '—'}
          </p>
        )}
        <Button
          to={`/dashboard/students/${studentId}`}
          variant='secondary'
          size='sm'
        >
          View Profile
        </Button>
      </div>
    </article>
  )
}

export default StudentItem

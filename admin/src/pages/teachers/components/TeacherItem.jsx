import React from 'react'
import {
  BookOpen,
  Building2,
  MapPin,
  School,
} from 'lucide-react'
import Button from '../../../components/Button'

const statusClass = (status) =>
  status === 'Active'
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
    : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'

const getTeacherId = (teacher) => teacher._id || teacher.id

const getPhoto = (teacher) =>
  teacher.picture || teacher.photo || teacher.user?.photo || ''

const getStatus = (teacher) => {
  const isActive =
    typeof teacher.isActive === 'boolean'
      ? teacher.isActive
      : teacher.user?.isActive

  if (typeof isActive === 'boolean') {
    return isActive ? 'Active' : 'Inactive'
  }
  return teacher.status || 'Active'
}

const getFullName = (teacher) => {
  const firstName = teacher.firstName || teacher.user?.firstName || ''
  const lastName = teacher.lastName || teacher.user?.lastName || ''
  const name = `${firstName} ${lastName}`.trim()

  if (teacher.title && name) return `${teacher.title} ${name}`
  return name || 'Unnamed teacher'
}

const getSubtitle = (teacher) => {
  if (teacher.department) return teacher.department
  if (teacher.qualifications?.[0]?.title) return teacher.qualifications[0].title
  return teacher.email || teacher.user?.email || '—'
}

const getLocation = (teacher) => {
  const address = teacher.address || teacher.user?.address || {}
  const parts = [address.city, address.country].filter(Boolean)
  return parts.length ? parts.join(', ') : '—'
}

const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const avatarRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }

const TeacherAvatar = ({ teacher, className = 'size-11' }) => {
  const photo = getPhoto(teacher)
  const firstName = teacher.firstName || teacher.user?.firstName || ''
  const lastName = teacher.lastName || teacher.user?.lastName || ''
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()

  if (photo) {
    return (
      <img
        src={photo}
        alt=''
        className={`${className} shrink-0 object-cover shadow-[var(--shadow-soft)]`}
        style={avatarRadius}
      />
    )
  }

  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center bg-blue-100 text-xs font-semibold text-blue-800 shadow-[var(--shadow-soft)] dark:bg-blue-500/20 dark:text-blue-300`}
      style={avatarRadius}
    >
      {initials || '?'}
    </div>
  )
}

const TeacherSubjects = ({ subjects = [], compact = false }) => {
  const count = subjects.length

  if (count === 0) {
    return (
      <p className='text-[12px] text-gray-400 dark:text-gray-500'>
        No subjects assigned
      </p>
    )
  }

  if (compact) {
    return (
      <span
        className='inline-flex items-center gap-1.5 bg-teal-100 px-2.5 py-1 text-[11px] font-medium text-teal-800 dark:bg-teal-500/20 dark:text-teal-300'
        style={chipRadius}
      >
        <BookOpen className='size-3' strokeWidth={2} />
        {count} {count === 1 ? 'subject' : 'subjects'}
      </span>
    )
  }

  return (
    <div>
      <div className='mb-2 flex items-center justify-between gap-2'>
        <p className='text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-gray-400'>
          Subjects
        </p>
        <span
          className='bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-800 dark:bg-teal-500/20 dark:text-teal-300'
          style={chipRadius}
        >
          {count}
        </span>
      </div>

      <ul className='flex flex-wrap gap-1.5'>
        {subjects.map((subject) => (
          <li key={subject}>
            <span
              className='inline-flex items-center bg-teal-50 px-2.5 py-1 text-[11px] font-medium text-teal-800 dark:bg-teal-500/15 dark:text-teal-200'
              style={chipRadius}
            >
              {subject}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const TeacherItem = ({ teacher, view = 'grid' }) => {
  const teacherId = getTeacherId(teacher)
  const fullName = getFullName(teacher)
  const status = getStatus(teacher)
  const location = getLocation(teacher)
  const classCount = teacher.classes?.length ?? 0
  const subjects = teacher.subjects || []

  if (view === 'list') {
    return (
      <article
        className='flex items-center gap-3 bg-white p-3 shadow-[var(--shadow-soft)] transition-shadow duration-200 hover:shadow-[var(--shadow-lift)] dark:bg-[#152238] sm:gap-4 sm:px-4'
        style={cardRadius}
      >
        <TeacherAvatar teacher={teacher} className='size-10 sm:size-11' />

        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
            <h2 className='truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
              {fullName}
            </h2>
            <span className='truncate text-[11px] text-gray-400 dark:text-gray-500'>
              {teacherId}
            </span>
          </div>
          <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            {getSubtitle(teacher)}
            {subjects.length > 0 && (
              <>
                <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
                {subjects.join(', ')}
              </>
            )}
          </p>
        </div>

        <TeacherSubjects subjects={subjects} compact />

        <span
          className={`hidden shrink-0 px-2.5 py-1 text-[11px] font-medium sm:inline-flex ${statusClass(status)}`}
          style={chipRadius}
        >
          {status}
        </span>

        <Button to={`/teachers/${teacherId}`} variant='secondary' size='sm'>
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
        <TeacherAvatar teacher={teacher} />

        <div className='min-w-0 flex-1'>
          <h2 className='truncate text-[14px] font-semibold tracking-tight text-gray-900 dark:text-white'>
            {fullName}
          </h2>
          <p className='mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
            <Building2 className='size-3 shrink-0' strokeWidth={1.75} />
            <span className='truncate'>{getSubtitle(teacher)}</span>
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
          <School className='size-3' strokeWidth={2} />
          {classCount} {classCount === 1 ? 'class' : 'classes'}
        </span>
      </div>

      <div
        className='mt-3 bg-teal-50/70 p-3 dark:bg-teal-500/10'
        style={{ borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }}
      >
        <TeacherSubjects subjects={subjects} />
      </div>

      <div className='mt-auto flex items-center justify-between gap-3 pt-4'>
        <p className='truncate text-[12px] text-gray-500 dark:text-gray-400'>
          {teacher.yearsOfExperience != null ? (
            <>
              <span className='font-semibold text-gray-800 dark:text-gray-200'>
                {teacher.yearsOfExperience}
              </span>{' '}
              yrs experience
            </>
          ) : (
            teacher.email || teacher.user?.email || '—'
          )}
        </p>
        <Button to={`/teachers/${teacherId}`} variant='secondary' size='sm'>
          View Profile
        </Button>
      </div>
    </article>
  )
}

export default TeacherItem

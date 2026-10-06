import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  NotebookPen,
  Pencil,
  UserRound,
} from 'lucide-react'
import {
  getMaterialFileName,
  getMyLessonById,
} from '../../../../lib/lesson.requests'
import useModal from '../../../../hooks/useModal'
import { USER_ROLES } from '../../../../store/slices/uiSlice'
import Button from '../../../../components/Button'
import EditLesson from './components/EditLesson'

const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const avatarRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }

const surface =
  'border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#0c1528]'

const subjectTone = (subject) => {
  switch (subject) {
    case 'Mathematics':
      return 'bg-blue-50 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300'
    case 'Science':
      return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300'
    case 'English':
      return 'bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-300'
    case 'History':
      return 'bg-yellow-50 text-yellow-900 dark:bg-yellow-500/10 dark:text-yellow-300'
    case 'Geography':
      return 'bg-sky-50 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300'
    case 'French':
      return 'bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300'
    default:
      return 'bg-gray-50 text-gray-700 dark:bg-white/5 dark:text-gray-300'
  }
}

const formatWhen = (iso) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const SectionCard = ({ title, icon: Icon, children, className = '' }) => (
  <section className={`${surface} p-5 ${className}`} style={cardRadius}>
    <h2 className='mb-4 flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase dark:text-gray-400'>
      {Icon ? <Icon className='size-3.5' strokeWidth={1.75} aria-hidden='true' /> : null}
      {title}
    </h2>
    {children}
  </section>
)

const MaterialList = ({ items }) => {
  if (!items?.length) {
    return (
      <p className='text-[13px] text-gray-500 dark:text-gray-400'>
        No files attached.
      </p>
    )
  }

  return (
    <ul className='space-y-2'>
      {items.map((url) => (
        <li key={url}>
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex max-w-full items-center gap-2 text-[13px] font-semibold text-blue-700 transition-colors hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200'
          >
            <FileText className='size-3.5 shrink-0' strokeWidth={1.75} />
            <span className='truncate'>{getMaterialFileName(url)}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

const LessonDetailsSkeleton = () => (
  <section
    className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4'
    aria-busy='true'
    aria-label='Loading lesson'
  >
    <div className='mb-4 h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-white/10' />
    <div className={`mb-4 ${surface} p-4 sm:p-5`} style={cardRadius}>
      <div className='flex flex-col gap-5 sm:flex-row'>
        <div
          className='size-24 shrink-0 animate-pulse bg-gray-200 sm:size-28 dark:bg-white/10'
          style={avatarRadius}
        />
        <div className='min-w-0 flex-1 space-y-3'>
          <div className='h-7 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-white/10' />
          <div className='h-4 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-white/10' />
          <div className='h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-white/10' />
        </div>
      </div>
    </div>
    <div className='grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.9fr)]'>
      <div className={`${surface} h-72 animate-pulse bg-gray-100 dark:bg-white/5`} style={cardRadius} />
      <div className={`${surface} h-72 animate-pulse bg-gray-100 dark:bg-white/5`} style={cardRadius} />
    </div>
  </section>
)

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className='flex items-start gap-2.5'>
    <Icon
      className='mt-0.5 size-3.5 shrink-0 text-gray-400 dark:text-gray-500'
      strokeWidth={1.75}
      aria-hidden='true'
    />
    <div className='min-w-0 flex-1'>
      <dt className='text-[11px] font-medium tracking-[0.06em] text-gray-400 uppercase dark:text-gray-500'>
        {label}
      </dt>
      <dd className='mt-0.5 text-[13px] font-medium text-gray-900 dark:text-gray-100'>
        {value || '—'}
      </dd>
    </div>
  </div>
)

const LessonDetails = () => {
  const { id } = useParams()
  const { open } = useModal()
  const userRole = useSelector((state) => state.user.user?.role)
  const isTeacher = userRole === USER_ROLES.TEACHER

  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    const loadLesson = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getMyLessonById(id)
        if (!cancelled) setLesson(data.lesson)
      } catch (err) {
        if (!cancelled) {
          setLesson(null)
          setError(err.message || 'Failed to load lesson.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadLesson()

    return () => {
      cancelled = true
    }
  }, [id, refreshKey])

  const handleEditLesson = () => {
    if (!lesson) return

    open({
      title: 'Edit lesson',
      description: 'Update this lesson plan.',
      size: '2xl',
      content: (
        <EditLesson
          lesson={lesson}
          onSuccess={() => setRefreshKey((key) => key + 1)}
        />
      ),
    })
  }

  if (loading) {
    return <LessonDetailsSkeleton />
  }

  if (!lesson) {
    return (
      <section className='flex flex-1 flex-col items-start gap-4 overflow-y-auto px-3 py-5 sm:px-4'>
        <Link
          to='/dashboard/lessons'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to lessons
        </Link>
        <div className={`w-full ${surface} px-6 py-12 text-center`} style={cardRadius}>
          <h1 className='text-[15px] font-semibold text-gray-900 dark:text-white'>
            Lesson not found
          </h1>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {error || 'This lesson plan is unavailable or may have been removed.'}
          </p>
        </div>
      </section>
    )
  }

  const subjectLabel = lesson.courseName || lesson.subject || 'Course'
  const metaParts = [subjectLabel, lesson.className].filter(Boolean)

  return (
    <section className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <Link
          to='/dashboard/lessons'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to lessons
        </Link>

        {isTeacher ? (
          <Button
            type='button'
            variant='primary'
            size='sm'
            onClick={handleEditLesson}
          >
            <Pencil className='size-3.5' strokeWidth={1.75} />
            Edit lesson
          </Button>
        ) : null}
      </div>

      <div className={`mb-4 ${surface} p-4 sm:p-5`} style={cardRadius}>
        <div className='flex flex-col gap-5 sm:flex-row sm:items-stretch'>
          <div
            className={`grid size-24 shrink-0 place-items-center sm:size-28 ${subjectTone(subjectLabel)}`}
            style={avatarRadius}
            aria-hidden='true'
          >
            <span className='text-2xl font-semibold'>
              {subjectLabel?.[0]?.toUpperCase() || '?'}
            </span>
          </div>

          <div className='flex min-w-0 flex-1 flex-col justify-between gap-4'>
            <div>
              <div className='min-w-0'>
                <p className='text-[11px] font-medium tracking-[0.06em] text-gray-400 uppercase dark:text-gray-500'>
                  Lesson plan
                </p>
                <h1 className='mt-1 text-[22px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[26px]'>
                  {lesson.title}
                </h1>
              </div>

              {metaParts.length > 0 && (
                <p className='mt-3 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400'>
                  {metaParts.map((part, index) => (
                    <React.Fragment key={`${part}-${index}`}>
                      {index > 0 && (
                        <span
                          className='mx-2 text-gray-300 dark:text-gray-600'
                          aria-hidden='true'
                        >
                          ·
                        </span>
                      )}
                      <span>{part}</span>
                    </React.Fragment>
                  ))}
                </p>
              )}
            </div>

            <div className='flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-gray-100 pt-3 dark:border-white/8'>
              <span className='inline-flex items-center gap-1.5 px-2 py-1.5 text-[13px] text-gray-600 dark:text-gray-300'>
                <Calendar className='size-3.5 shrink-0' strokeWidth={1.75} />
                {formatWhen(lesson.scheduledAt)}
              </span>
              <span
                className='hidden text-gray-200 sm:inline dark:text-gray-700'
                aria-hidden='true'
              >
                |
              </span>
              <span className='inline-flex items-center gap-1.5 px-2 py-1.5 text-[13px] text-gray-600 dark:text-gray-300'>
                <Clock className='size-3.5 shrink-0' strokeWidth={1.75} />
                {lesson.durationMinutes} min
              </span>
              {lesson.teacher ? (
                <>
                  <span
                    className='hidden text-gray-200 sm:inline dark:text-gray-700'
                    aria-hidden='true'
                  >
                    |
                  </span>
                  <span className='inline-flex items-center gap-1.5 px-2 py-1.5 text-[13px] text-gray-600 dark:text-gray-300'>
                    <UserRound className='size-3.5 shrink-0' strokeWidth={1.75} />
                    {lesson.teacher}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.9fr)]'>
        <div className='flex min-w-0 flex-col gap-4'>
          <SectionCard title='Lesson notes' icon={NotebookPen}>
            <div className='space-y-3 text-[13px] leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300'>
              {lesson.notes || 'No notes added yet.'}
            </div>
          </SectionCard>

          {lesson.teacherNotes ? (
            <SectionCard title='Teacher reminders'>
              <p className='text-[13px] leading-relaxed text-gray-700 dark:text-gray-300'>
                {lesson.teacherNotes}
              </p>
            </SectionCard>
          ) : null}
        </div>

        <div className='flex min-w-0 flex-col gap-4'>
          <SectionCard title='Session details' icon={ClipboardList}>
            <dl className='space-y-3'>
              <DetailRow
                icon={GraduationCap}
                label='Class'
                value={lesson.className}
              />
              <DetailRow
                icon={BookOpen}
                label='Subject / Course'
                value={subjectLabel}
              />
              <DetailRow
                icon={UserRound}
                label='Teacher'
                value={lesson.teacher}
              />
              <DetailRow
                icon={Clock}
                label='Duration'
                value={`${lesson.durationMinutes} minutes`}
              />
              <DetailRow
                icon={Calendar}
                label='Scheduled'
                value={formatWhen(lesson.scheduledAt)}
              />
            </dl>
          </SectionCard>

          <SectionCard title='Materials'>
            <MaterialList items={lesson.materials} />
          </SectionCard>
        </div>
      </div>
    </section>
  )
}

export default LessonDetails

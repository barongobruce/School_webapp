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
  Hash,
  MapPin,
  NotebookPen,
  Pencil,
  Plus,
  UserRound,
} from 'lucide-react'
import { getMyExamById } from '../../../../lib/exam.requests'
import useModal from '../../../../hooks/useModal'
import { USER_ROLES } from '../../../../store/slices/uiSlice'
import Button from '../../../../components/Button'
import EditExam from './components/EditExam'
import EnterExamResults from './components/EnterExamResults'
import ExamResults from './components/ExamResults'

const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const avatarRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }

const surface =
  'border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#0c1528]'

const subjectTone = (subject) => {
  switch (subject) {
    case 'Mathematics':
      return 'bg-blue-50 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300'
    case 'Science':
    case 'Biology':
    case 'Chemistry':
    case 'Physics':
      return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300'
    case 'English':
    case 'Literature':
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

const STATUS_TONE = {
  scheduled:
    'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  ongoing:
    'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  completed:
    'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  cancelled: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
}

const formatExamDate = (iso) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatTimeLabel = (value) => {
  if (!value) return '—'
  const [hours, minutes] = String(value).split(':')
  const hour = Number(hours)
  if (!Number.isFinite(hour)) return value
  const date = new Date()
  date.setHours(hour, Number(minutes) || 0, 0, 0)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const SectionCard = ({
  title,
  icon: Icon,
  children,
  className = '',
  action = null,
}) => (
  <section className={`${surface} p-5 ${className}`} style={cardRadius}>
    <div className='mb-4 flex items-center justify-between gap-3'>
      <h2 className='flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase dark:text-gray-400'>
        {Icon ? <Icon className='size-3.5' strokeWidth={1.75} aria-hidden='true' /> : null}
        {title}
      </h2>
      {action}
    </div>
    {children}
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

const ExamDetailsSkeleton = () => (
  <section
    className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4'
    aria-busy='true'
    aria-label='Loading exam'
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

const ExamDetails = () => {
  const { id } = useParams()
  const { open } = useModal()
  const userRole = useSelector((state) => state.user.user?.role)
  const isTeacher = userRole === USER_ROLES.TEACHER
  const isGuardian =
    userRole === USER_ROLES.GUARDIAN || userRole === USER_ROLES.PARENT

  const [exam, setExam] = useState(null)
  const [results, setResults] = useState([])
  const [resultsSummary, setResultsSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    const loadExam = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getMyExamById(id)
        if (!cancelled) {
          setExam(data.exam)
          setResults(data.results || [])
          setResultsSummary(data.resultsSummary || null)
        }
      } catch (err) {
        if (!cancelled) {
          setExam(null)
          setResults([])
          setResultsSummary(null)
          setError(err.message || 'Failed to load exam.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadExam()

    return () => {
      cancelled = true
    }
  }, [id, refreshKey])

  const handleEditExam = () => {
    if (!exam) return

    open({
      title: 'Edit exam',
      description: 'Update this exam session.',
      size: 'xl',
      content: (
        <EditExam
          exam={exam}
          onSuccess={() => setRefreshKey((key) => key + 1)}
        />
      ),
    })
  }

  const handleEnterResults = () => {
    if (!exam) return

    open({
      title: 'Enter scores',
      description: `Record marks out of ${exam.totalMarks} for ${exam.className || 'this class'}.`,
      size: 'xl',
      content: (
        <EnterExamResults
          exam={exam}
          results={results}
          onSuccess={(data) => {
            if (data?.exam) setExam(data.exam)
            if (data?.results) setResults(data.results)
            if (data?.resultsSummary) setResultsSummary(data.resultsSummary)
            else setRefreshKey((key) => key + 1)
          }}
        />
      ),
    })
  }

  if (loading) {
    return <ExamDetailsSkeleton />
  }

  if (!exam) {
    return (
      <section className='flex flex-1 flex-col items-start gap-4 overflow-y-auto px-3 py-5 sm:px-4'>
        <Link
          to='/dashboard/exams'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to exams
        </Link>
        <div className={`w-full ${surface} px-6 py-12 text-center`} style={cardRadius}>
          <h1 className='text-[15px] font-semibold text-gray-900 dark:text-white'>
            Exam not found
          </h1>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {error || 'This exam is unavailable or may have been removed.'}
          </p>
        </div>
      </section>
    )
  }

  const subjectLabel = exam.subject || 'Subject'
  const metaParts = [
    subjectLabel,
    exam.className,
    exam.examTypeLabel,
  ].filter(Boolean)
  const status = exam.status || 'scheduled'
  const timeRange = `${formatTimeLabel(exam.startTime)} – ${formatTimeLabel(exam.endTime)}`
  const recordedCount = resultsSummary?.recordedCount ?? results.filter((r) => r.hasResult).length

  const resultsEmptyHint = (() => {
    if (isTeacher) return 'Use Enter scores to record marks for this class.'
    if (isGuardian) return 'Scores for your ward will appear here once recorded.'
    return 'Your score will appear here once your teacher records results.'
  })()

  return (
    <section className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <Link
          to='/dashboard/exams'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to exams
        </Link>

        {isTeacher ? (
          <div className='flex flex-wrap gap-2'>
            <Button
              type='button'
              variant='secondary'
              size='sm'
              onClick={handleEnterResults}
            >
              <Plus className='size-3.5' strokeWidth={1.75} />
              Enter scores
            </Button>
            <Button
              type='button'
              variant='primary'
              size='sm'
              onClick={handleEditExam}
            >
              <Pencil className='size-3.5' strokeWidth={1.75} />
              Edit exam
            </Button>
          </div>
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
              <div className='flex flex-wrap items-center gap-2'>
                <p className='text-[11px] font-medium tracking-[0.06em] text-gray-400 uppercase dark:text-gray-500'>
                  Exam
                </p>
                <span
                  className={`inline-flex px-2 py-0.5 text-[11px] font-semibold ${STATUS_TONE[status] || STATUS_TONE.scheduled}`}
                  style={chipRadius}
                >
                  {exam.statusLabel || status}
                </span>
              </div>
              <h1 className='mt-1 text-[22px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[26px]'>
                {exam.title}
              </h1>

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

              {exam.description ? (
                <p className='mt-2 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400'>
                  {exam.description}
                </p>
              ) : null}
            </div>

            <div className='flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-gray-100 pt-3 dark:border-white/8'>
              <span className='inline-flex items-center gap-1.5 px-2 py-1.5 text-[13px] text-gray-600 dark:text-gray-300'>
                <Calendar className='size-3.5 shrink-0' strokeWidth={1.75} />
                {formatExamDate(exam.examDate)}
              </span>
              <span
                className='hidden text-gray-200 sm:inline dark:text-gray-700'
                aria-hidden='true'
              >
                |
              </span>
              <span className='inline-flex items-center gap-1.5 px-2 py-1.5 text-[13px] text-gray-600 dark:text-gray-300'>
                <Clock className='size-3.5 shrink-0' strokeWidth={1.75} />
                {timeRange}
              </span>
              {exam.venue ? (
                <>
                  <span
                    className='hidden text-gray-200 sm:inline dark:text-gray-700'
                    aria-hidden='true'
                  >
                    |
                  </span>
                  <span className='inline-flex items-center gap-1.5 px-2 py-1.5 text-[13px] text-gray-600 dark:text-gray-300'>
                    <MapPin className='size-3.5 shrink-0' strokeWidth={1.75} />
                    {exam.venue}
                  </span>
                </>
              ) : null}
              {exam.teacher ? (
                <>
                  <span
                    className='hidden text-gray-200 sm:inline dark:text-gray-700'
                    aria-hidden='true'
                  >
                    |
                  </span>
                  <span className='inline-flex items-center gap-1.5 px-2 py-1.5 text-[13px] text-gray-600 dark:text-gray-300'>
                    <UserRound className='size-3.5 shrink-0' strokeWidth={1.75} />
                    {exam.teacher}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.9fr)]'>
        <div className='flex min-w-0 flex-col gap-4'>
          <SectionCard
            title='Scores'
            icon={ClipboardList}
            action={
              isTeacher ? (
                <button
                  type='button'
                  onClick={handleEnterResults}
                  className='text-[12px] font-medium text-blue-700 transition-colors hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200'
                >
                  {recordedCount > 0 ? 'Update scores' : 'Enter scores'}
                </button>
              ) : null
            }
          >
            <ExamResults
              results={results}
              summary={isTeacher ? resultsSummary : null}
              totalMarks={exam.totalMarks}
              passingMarks={exam.passingMarks}
              emptyHint={resultsEmptyHint}
            />
          </SectionCard>

          <SectionCard title='Instructions' icon={NotebookPen}>
            <div className='space-y-3 text-[13px] leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300'>
              {exam.instructions || 'No instructions added yet.'}
            </div>
          </SectionCard>
        </div>

        <div className='flex min-w-0 flex-col gap-4'>
          <SectionCard title='Details' icon={ClipboardList}>
            <dl className='space-y-3'>
              <DetailRow
                icon={GraduationCap}
                label='Class'
                value={exam.className}
              />
              <DetailRow
                icon={BookOpen}
                label='Subject'
                value={subjectLabel}
              />
              <DetailRow
                icon={FileText}
                label='Type'
                value={exam.examTypeLabel}
              />
              <DetailRow
                icon={UserRound}
                label='Teacher'
                value={exam.teacher}
              />
              <DetailRow
                icon={Calendar}
                label='Date'
                value={formatExamDate(exam.examDate)}
              />
              <DetailRow
                icon={Clock}
                label='Time'
                value={`${timeRange}${exam.duration ? ` · ${exam.duration} min` : ''}`}
              />
              <DetailRow
                icon={MapPin}
                label='Venue'
                value={exam.venue || '—'}
              />
              <DetailRow
                icon={Hash}
                label='Marks'
                value={`${exam.totalMarks} total · pass ${exam.passingMarks}`}
              />
            </dl>
          </SectionCard>
        </div>
      </div>
    </section>
  )
}

export default ExamDetails

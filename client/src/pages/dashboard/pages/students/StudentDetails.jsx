import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  CalendarCheck,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  School,
  UserRound,
} from 'lucide-react'
import { getMyStudentById } from '../../../../lib/student.requests'
import RelatedComplaints from '../../../../components/RelatedComplaints'
import AttendanceDonut from '../attendance/components/AttendanceDonut'

const formatFees = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount || 0)

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getAge = (dateOfBirth) => {
  if (!dateOfBirth) return null
  const today = new Date()
  const birth = new Date(dateOfBirth)
  if (Number.isNaN(birth.getTime())) return null
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age -= 1
  }
  return age
}

const statusClass = (status) =>
  status === 'Active'
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'

const DetailRow = ({ label, value }) => (
  <div className='flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4'>
    <dt className='shrink-0 text-sm text-gray-500 dark:text-gray-400'>{label}</dt>
    <dd className='text-sm font-medium text-gray-900 sm:text-right dark:text-gray-100'>
      {value || '—'}
    </dd>
  </div>
)

const SectionCard = ({ title, children }) => (
  <section className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900'>
    <h2 className='mb-4 text-sm font-semibold! tracking-wide text-gray-900 uppercase dark:text-gray-100'>
      {title}
    </h2>
    <dl className='flex flex-col gap-3.5'>{children}</dl>
  </section>
)

const StatCard = ({ label, value, valueClassName = '' }) => (
  <div className='rounded-2xl border border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900'>
    <p className='text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400'>
      {label}
    </p>
    <p
      className={`mt-1.5 text-lg font-semibold! text-gray-900 dark:text-gray-100 ${valueClassName}`}
    >
      {value}
    </p>
  </div>
)

const StudentDetails = () => {
  const { id } = useParams()
  const [student, setStudent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError('')
      try {
        const data = await getMyStudentById(id)
        if (!cancelled) setStudent(data.student || null)
      } catch (err) {
        if (!cancelled) {
          setStudent(null)
          setError(err.message || 'Student not found')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (isLoading) {
    return (
      <section className='flex flex-1 items-center justify-center gap-2 px-3 py-10 text-[13px] text-gray-500 dark:text-gray-400'>
        <LoaderCircle className='size-4 animate-spin' strokeWidth={1.75} />
        Loading student…
      </section>
    )
  }

  if (!student) {
    return (
      <section className='flex flex-1 flex-col items-start gap-4 overflow-y-auto px-2 py-6'>
        <Link
          to='/dashboard/students'
          className='inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-4' strokeWidth={1.75} />
          Back to students
        </Link>
        <div className='w-full rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900'>
          <h1 className='text-lg font-semibold! text-gray-900 dark:text-gray-100'>
            Student not found
          </h1>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            {error || (
              <>
                No student matches the ID{' '}
                <span className='font-medium text-gray-700 dark:text-gray-300'>
                  {id}
                </span>
                .
              </>
            )}
          </p>
        </div>
      </section>
    )
  }

  const fullName =
    student.name ||
    `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
    'Student'
  const address = student.address || {}
  const fullAddress = [
    address.street,
    address.city,
    address.district || address.state,
    address.country,
  ]
    .filter(Boolean)
    .join(', ')
  const feesPaid = Number(student.feesPaid) || 0
  const feesBalance = Number(student.feesBalance) || 0
  const feesTotal = feesPaid + feesBalance
  const feesProgress =
    feesTotal > 0 ? Math.round((feesPaid / feesTotal) * 100) : 100
  const age = getAge(student.dateOfBirth)
  const phone = student.phone || student.contactInfo?.phone || ''
  const classLabel =
    student.classGrade ||
    student.class?.className ||
    (student.class?.grade != null ? `Grade ${student.class.grade}` : '') ||
    '—'
  const teacherLabel = student.teacher || student.teachers?.[0]?.name || '—'
  const guardian = student.parentGuardian || {
    name: student.guardian?.name || '',
    email: student.guardian?.email || '',
    phone: student.guardian?.phone || '',
    relationship: 'Guardian',
  }
  const status =
    student.status ||
    (student.isActive === false ? 'Inactive' : 'Active')

  return (
    <section className='flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-3'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <Link
          to='/dashboard/students'
          className='inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-4' strokeWidth={1.75} />
          Back to students
        </Link>
      </div>

      <div className='mb-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900 sm:p-6'>
        <div className='flex flex-col gap-5 sm:flex-row sm:items-start'>
          {student.photo ? (
            <img
              src={student.photo}
              alt=''
              className='size-24! shrink-0 rounded-2xl object-cover sm:size-28!'
            />
          ) : (
            <span className='grid size-24 shrink-0 place-items-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-white/10 sm:size-28'>
              <UserRound className='size-10' strokeWidth={1.5} />
            </span>
          )}

          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-2xl font-semibold! tracking-tight text-gray-900 dark:text-gray-100'>
                {fullName}
              </h1>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(status)}`}
              >
                {status}
              </span>
            </div>

            <div className='mt-3 flex flex-wrap gap-2'>
              <span className='inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300'>
                <School className='size-3' strokeWidth={2} />
                {classLabel}
              </span>
              {teacherLabel !== '—' ? (
                <span className='inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300'>
                  <UserRound className='size-3' strokeWidth={2} />
                  {teacherLabel}
                </span>
              ) : null}
              {(address.city || address.country) && (
                <span className='inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300'>
                  <MapPin className='size-3' strokeWidth={2} />
                  {[address.city, address.country].filter(Boolean).join(', ')}
                </span>
              )}
              {student.dateOfAdmission || student.createdAt ? (
                <span className='inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300'>
                  <Calendar className='size-3' strokeWidth={2} />
                  Admitted{' '}
                  {formatDate(student.dateOfAdmission || student.createdAt)}
                </span>
              ) : null}
            </div>

            <div className='mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600 dark:text-gray-300'>
              {student.email ? (
                <a
                  href={`mailto:${student.email}`}
                  className='inline-flex items-center gap-1.5 transition-colors hover:text-blue-600 dark:hover:text-blue-400'
                >
                  <Mail className='size-3.5 shrink-0' strokeWidth={1.75} />
                  {student.email}
                </a>
              ) : null}
              {phone ? (
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className='inline-flex items-center gap-1.5 transition-colors hover:text-blue-600 dark:hover:text-blue-400'
                >
                  <Phone className='size-3.5 shrink-0' strokeWidth={1.75} />
                  {phone}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <StatCard
          label='Fees paid'
          value={formatFees(feesPaid)}
          valueClassName='text-emerald-600 dark:text-emerald-400'
        />
        <StatCard
          label='Fees balance'
          value={feesBalance === 0 ? 'Paid in full' : formatFees(feesBalance)}
          valueClassName={
            feesBalance === 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-blue-600 dark:text-blue-400'
          }
        />
        <StatCard
          label='Attendance'
          value={`${student.attendanceSummary?.presentRate ?? 0}%`}
          valueClassName='text-blue-600 dark:text-blue-400'
        />
      </div>

      <div className='mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900'>
          <div className='mb-2 flex items-center justify-between gap-3'>
            <h2 className='text-sm font-semibold! text-gray-900 dark:text-gray-100'>
              Fee payment progress
            </h2>
            <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>
              {feesProgress}%
            </span>
          </div>
          <div
            className='h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800'
            role='progressbar'
            aria-valuenow={feesProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label='Fee payment progress'
          >
            <div
              className='h-full rounded-full bg-blue-600 transition-[width] dark:bg-blue-500'
              style={{ width: `${feesProgress}%` }}
            />
          </div>
          <p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
            {formatFees(feesPaid)} of {formatFees(feesTotal)} paid
          </p>
        </div>

        <section className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900'>
          <div className='mb-4 flex items-center justify-between gap-3'>
            <h2 className='flex items-center gap-2 text-sm font-semibold! tracking-wide text-gray-900 uppercase dark:text-gray-100'>
              <CalendarCheck className='size-3.5' strokeWidth={1.75} />
              Attendance
            </h2>
            <Link
              to='/dashboard/attendance'
              className='text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
            >
              Full record
            </Link>
          </div>
          <AttendanceDonut
            summary={student.attendanceSummary}
            emptyLabel='No attendance has been recorded for this student yet.'
          />
        </section>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <SectionCard title='Personal information'>
          <DetailRow label='Full name' value={fullName} />
          <DetailRow label='Gender' value={student.gender} />
          <DetailRow
            label='Date of birth'
            value={
              student.dateOfBirth
                ? `${formatDate(student.dateOfBirth)}${age != null ? ` (${age} yrs)` : ''}`
                : '—'
            }
          />
          <DetailRow
            label='Emergency contact'
            value={student.emergencyContact}
          />
        </SectionCard>

        <SectionCard title='Academic information'>
          <DetailRow label='Class / Grade' value={classLabel} />
          <DetailRow label='Class teacher' value={teacherLabel} />
          <DetailRow
            label='Date of admission'
            value={formatDate(student.dateOfAdmission || student.createdAt)}
          />
          <DetailRow label='Status' value={status} />
        </SectionCard>

        <SectionCard title='Parent / Guardian'>
          <DetailRow label='Name' value={guardian.name} />
          <DetailRow label='Relationship' value={guardian.relationship} />
          <DetailRow label='Phone' value={guardian.phone} />
          <DetailRow label='Email' value={guardian.email} />
        </SectionCard>

        <SectionCard title='Address'>
          <DetailRow label='Street' value={address.street} />
          <DetailRow label='City' value={address.city} />
          <DetailRow
            label='District / State'
            value={address.district || address.state}
          />
          <DetailRow label='Country' value={address.country} />
          <DetailRow label='Full address' value={fullAddress} />
        </SectionCard>
      </div>

      <RelatedComplaints
        complaints={Array.isArray(student.reports) ? student.reports : []}
        personLabel='student'
      />
    </section>
  )
}

export default StudentDetails

import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Ban,
  Mail,
  Phone,
  Pencil,
} from 'lucide-react'
import { getStudentById, setStudentStatus } from '../../lib/student.requests'
import useModal from '../../hooks/useModal'
import Button from '../../components/Button'
import EditStudent from './components/EditStudent'
import StudentDetailsSkeleton from './components/StudentDetailsSkeleton'
import RelatedComplaints from '../../components/RelatedComplaints'

const formatFees = (amount) =>
  new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 0,
  }).format(amount)

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
    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25'
    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25'

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

const getTeacherName = (student) => {
  if (typeof student.teacher === 'string' && student.teacher.trim()) {
    return student.teacher
  }

  const teacher = student.class?.teachers?.[0]
  if (!teacher) return 'Unassigned'
  if (typeof teacher === 'string') return teacher

  const firstName = teacher.firstName || teacher.user?.firstName || ''
  const lastName = teacher.lastName || teacher.user?.lastName || ''
  return `${firstName} ${lastName}`.trim() || 'Unassigned'
}

const getGuardianName = (student) => {
  if (student.parentGuardian?.name) return student.parentGuardian.name
  const guardian = student.guardian
  if (!guardian) return '—'
  const firstName = guardian.firstName || guardian.user?.firstName || ''
  const lastName = guardian.lastName || guardian.user?.lastName || ''
  return `${firstName} ${lastName}`.trim() || '—'
}

const getPhone = (student) =>
  student.phone ||
  student.contactInfo?.phone ||
  student.user?.contactInfo?.phone ||
  ''

const getAltPhone = (student) =>
  student.contactInfo?.altPhone ||
  student.user?.contactInfo?.altPhone ||
  student.alternatePhone ||
  ''

const getWhatsapp = (student) =>
  student.contactInfo?.whatsapp ||
  student.user?.contactInfo?.whatsapp ||
  student.whatsapp ||
  ''

const toTelHref = (phone) => `tel:${phone.replace(/\s/g, '')}`
const toWhatsAppHref = (phone) => `https://wa.me/${phone.replace(/\D/g, '')}`

const WhatsAppIcon = ({ className = 'size-4' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 24 24'
    fill='currentColor'
    className={className}
    aria-hidden='true'
  >
    <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z' />
  </svg>
)

const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const avatarRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }

const surface =
  'border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#0c1528]'

const contactActionClass =
  'inline-flex items-center gap-2 border border-blue-200/80 bg-blue-50 px-3.5 py-2.5 text-[13px] font-medium text-blue-800 transition-colors hover:border-blue-300 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/15'

const whatsappActionClass =
  'inline-flex items-center gap-2 border border-emerald-200/80 bg-emerald-50 px-3.5 py-2.5 text-[13px] font-medium text-emerald-800 transition-colors hover:border-emerald-300 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/15'

const DetailRow = ({ label, value }) => (
  <div className='flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4'>
    <dt className='shrink-0 text-[12px] text-gray-500 dark:text-gray-400'>{label}</dt>
    <dd className='text-[13px] font-medium text-gray-900 sm:text-right dark:text-gray-100'>
      {value || '—'}
    </dd>
  </div>
)

const SectionCard = ({ title, children }) => (
  <section className={`${surface} p-5`} style={cardRadius}>
    <h2 className='mb-4 text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase dark:text-gray-400'>
      {title}
    </h2>
    <dl className='flex flex-col gap-3'>{children}</dl>
  </section>
)

const StatCard = ({ label, value, valueClassName = '' }) => (
  <div className={`${surface} px-4 py-4`} style={cardRadius}>
    <p className='text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-gray-400'>
      {label}
    </p>
    <p
      className={`mt-1.5 text-[17px] font-semibold tracking-tight text-gray-900 dark:text-white ${valueClassName}`}
    >
      {value}
    </p>
  </div>
)

const StudentAvatar = ({ student, className = 'size-28 sm:size-32' }) => {
  const firstName = student.firstName || student.user?.firstName || ''
  const lastName = student.lastName || student.user?.lastName || ''
  const photo = student.photo || student.user?.photo || ''
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()

  if (photo) {
    return (
      <img
        src={photo}
        alt=''
        className={`${className} shrink-0 object-cover ring-1 ring-gray-200/80 dark:ring-white/10`}
        style={avatarRadius}
      />
    )
  }

  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center bg-blue-50 text-2xl font-semibold text-blue-800 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20`}
      style={avatarRadius}
    >
      {initials || '?'}
    </div>
  )
}

const StudentDetails = () => {
  const { id } = useParams()
  const { open } = useModal()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [banLoading, setBanLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadStudent = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getStudentById(id)
        if (!cancelled) setStudent(data.student)
      } catch (err) {
        if (!cancelled) {
          setStudent(null)
          setError(err.message || 'Failed to load student.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadStudent()

    return () => {
      cancelled = true
    }
  }, [id])

  const reloadStudent = async () => {
    try {
      const data = await getStudentById(id)
      setStudent(data.student)
    } catch (err) {
      setError(err.message || 'Failed to reload student.')
    }
  }

  const handleEditStudent = () => {
    if (!student) return
    const name =
      `${student.firstName || student.user?.firstName || ''} ${student.lastName || student.user?.lastName || ''}`.trim() ||
      'this student'
    open({
      title: 'Edit Student',
      description: `Update the enrollment profile for ${name}.`,
      size: 'full',
      content: <EditStudent student={student} onSuccess={reloadStudent} />,
    })
  }

  const handleToggleBan = async () => {
    if (!student || banLoading) return

    const studentId = student._id || student.id
    const isActive =
      typeof student.isActive === 'boolean'
        ? student.isActive
        : student.user?.isActive !== false
    const name =
      `${student.firstName || student.user?.firstName || ''} ${student.lastName || student.user?.lastName || ''}`.trim() ||
      'this student'

    const confirmed = window.confirm(
      isActive
        ? `Ban ${name}? They will not be able to log in until unbanned.`
        : `Unban ${name}? They will be able to log in again.`,
    )
    if (!confirmed) return

    setBanLoading(true)
    setError('')
    try {
      const data = await setStudentStatus(studentId, !isActive)
      setStudent(data.student)
    } catch (err) {
      setError(err.message || 'Could not update student status.')
    } finally {
      setBanLoading(false)
    }
  }

  if (loading) {
    return <StudentDetailsSkeleton />
  }

  if (!student) {
    return (
      <section className='flex flex-1 flex-col items-start gap-4 overflow-y-auto px-3 py-5 sm:px-4'>
        <Link
          to='/students'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to students
        </Link>
        <div className={`w-full ${surface} px-6 py-12 text-center`} style={cardRadius}>
          <h1 className='text-[15px] font-semibold text-gray-900 dark:text-white'>
            Student not found
          </h1>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
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

  const firstName = student.firstName || student.user?.firstName || ''
  const lastName = student.lastName || student.user?.lastName || ''
  const email = student.email || student.user?.email || ''
  const fullName = `${firstName} ${lastName}`.trim() || 'Unnamed student'
  const status = getStatus(student)
  const isUserActive = status === 'Active'
  const classLabel = getClassLabel(student)
  const teacherName = getTeacherName(student)
  const phone = getPhone(student)
  const altPhone = getAltPhone(student)
  const whatsapp = getWhatsapp(student)
  const emergencyContact = student.emergencyContact || ''
  const age = getAge(student.dateOfBirth || student.user?.dateOfBirth)
  const admittedDate = student.dateOfAdmission || student.createdAt
  const address = student.address || student.user?.address || {}
  const guardian = student.guardian || student.parentGuardian || {}
  const fullAddress = [
    address.street,
    address.city,
    address.region || address.state || address.district,
    address.postalCode || address.zip,
    address.country,
  ]
    .filter(Boolean)
    .join(', ')

  const locationLabel = [address.city, address.country].filter(Boolean).join(', ')
  const metaParts = [
    classLabel !== '—' ? classLabel : null,
    teacherName,
    locationLabel || null,
    admittedDate ? `Admitted ${formatDate(admittedDate)}` : null,
  ].filter(Boolean)

  const hasContacts = email || phone || whatsapp || altPhone || emergencyContact

  const hasFees =
    typeof student.feesPaid === 'number' || typeof student.feesBalance === 'number'
  const feesPaid = student.feesPaid ?? 0
  const feesBalance = student.feesBalance ?? 0
  const feesTotal = feesPaid + feesBalance
  const feesProgress =
    feesTotal > 0 ? Math.round((feesPaid / feesTotal) * 100) : 100

  return (
    <section className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <Link
          to='/students'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to students
        </Link>

        <div className='flex flex-wrap items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            loading={banLoading}
            onClick={handleToggleBan}
            className={
              isUserActive
                ? 'border border-rose-200/90 text-rose-700 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-950/40'
                : 'border border-emerald-200/90 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-950/40'
            }
          >
            <Ban className='size-3.5' strokeWidth={1.75} />
            {isUserActive ? 'Ban User' : 'Unban User'}
          </Button>
          <Button type='button' variant='primary' size='sm' onClick={handleEditStudent}>
            <Pencil className='size-3.5' strokeWidth={1.75} />
            Edit Student
          </Button>
        </div>
      </div>

      {error ? (
        <p
          role='alert'
          className='mb-4 text-[13px] text-rose-600 dark:text-rose-300'
        >
          {error}
        </p>
      ) : null}

      {/* Identity */}
      <div className={`mb-4 ${surface} p-4 sm:p-5`} style={cardRadius}>
        <div className='flex flex-col gap-5 sm:flex-row sm:items-stretch'>
          <StudentAvatar student={student} />

          <div className='flex min-w-0 flex-1 flex-col justify-between gap-4'>
            <div>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <h1 className='truncate text-[22px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[26px]'>
                    {fullName}
                  </h1>
                </div>

                <span
                  className={`inline-flex shrink-0 px-2.5 py-1 text-[11px] font-medium ${statusClass(status)}`}
                  style={chipRadius}
                >
                  {status}
                </span>
              </div>

              {metaParts.length > 0 && (
                <p className='mt-3 text-[13px] leading-relaxed text-gray-500 dark:text-gray-400'>
                  {metaParts.map((part, index) => (
                    <React.Fragment key={`${part}-${index}`}>
                      {index > 0 && (
                        <span className='mx-2 text-gray-300 dark:text-gray-600' aria-hidden='true'>
                          ·
                        </span>
                      )}
                      <span>{part}</span>
                    </React.Fragment>
                  ))}
                </p>
              )}
            </div>

            {hasContacts ? (
              <div className='flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-white/8'>
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className={contactActionClass}
                    style={chipRadius}
                    aria-label={`Email ${email}`}
                  >
                    <Mail className='size-4 shrink-0' strokeWidth={1.75} />
                    Email
                  </a>
                ) : null}
                {phone ? (
                  <a
                    href={toTelHref(phone)}
                    className={contactActionClass}
                    style={chipRadius}
                    aria-label={`Call ${phone}`}
                  >
                    <Phone className='size-4 shrink-0' strokeWidth={1.75} />
                    Call
                  </a>
                ) : null}
                {whatsapp ? (
                  <a
                    href={toWhatsAppHref(whatsapp)}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={whatsappActionClass}
                    style={chipRadius}
                    aria-label='Chat on WhatsApp'
                  >
                    <WhatsAppIcon className='size-4 shrink-0' />
                    WhatsApp
                  </a>
                ) : null}
                {altPhone ? (
                  <a
                    href={toTelHref(altPhone)}
                    className={contactActionClass}
                    style={chipRadius}
                    aria-label={`Call alternate ${altPhone}`}
                  >
                    <Phone className='size-4 shrink-0' strokeWidth={1.75} />
                    Alt. Call
                  </a>
                ) : null}
                {emergencyContact && emergencyContact !== phone && emergencyContact !== altPhone ? (
                  <a
                    href={toTelHref(emergencyContact)}
                    className={contactActionClass}
                    style={chipRadius}
                    aria-label={`Call emergency contact ${emergencyContact}`}
                  >
                    <Phone className='size-4 shrink-0' strokeWidth={1.75} />
                    Emergency
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3'>
        {hasFees ? (
          <>
            <StatCard
              label='Attendance'
              value={
                typeof student.attendanceRate === 'number'
                  ? `${student.attendanceRate}%`
                  : '—'
              }
            />
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
                  : 'text-blue-700 dark:text-blue-400'
              }
            />
          </>
        ) : (
          <>
            <StatCard label='Status' value={status} />
            <StatCard
              label='Age'
              value={age != null ? `${age} yrs` : '—'}
            />
            <StatCard label='ID type' value={student.idType || '—'} />
          </>
        )}
      </div>

      {hasFees && (
        <div className={`mb-4 ${surface} p-5`} style={cardRadius}>
          <div className='mb-2.5 flex items-center justify-between gap-3'>
            <h2 className='text-[13px] font-semibold text-gray-900 dark:text-white'>
              Fee payment progress
            </h2>
            <span className='text-[13px] font-semibold text-gray-700 dark:text-gray-200'>
              {feesProgress}%
            </span>
          </div>
          <div
            className='h-1.5 overflow-hidden bg-gray-100 dark:bg-white/10'
            style={{ borderRadius: '999px' }}
            role='progressbar'
            aria-valuenow={feesProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label='Fee payment progress'
          >
            <div
              className='brand-gradient h-full transition-[width]'
              style={{
                width: `${feesProgress}%`,
                borderRadius: '999px',
              }}
            />
          </div>
          <p className='mt-2 text-[12px] text-gray-500 dark:text-gray-400'>
            {formatFees(feesPaid)} of {formatFees(feesTotal)} paid
          </p>
        </div>
      )}

      <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
        <SectionCard title='Personal information'>
          <DetailRow label='Full name' value={fullName} />
          <DetailRow
            label='Gender'
            value={student.gender || student.user?.gender}
          />
          <DetailRow
            label='Date of birth'
            value={
              student.dateOfBirth || student.user?.dateOfBirth
                ? `${formatDate(student.dateOfBirth || student.user?.dateOfBirth)}${age != null ? ` (${age} yrs)` : ''}`
                : '—'
            }
          />
          <DetailRow label='ID type' value={student.idType} />
          <DetailRow
            label='Emergency contact'
            value={student.emergencyContact}
          />
        </SectionCard>

        <SectionCard title='Academic information'>
          <DetailRow label='Class / Grade' value={classLabel} />
          <DetailRow label='Class teacher' value={teacherName} />
          <DetailRow
            label='Date of admission'
            value={formatDate(admittedDate)}
          />
          <DetailRow label='Status' value={status} />
        </SectionCard>

        <SectionCard title='Parent / Guardian'>
          <DetailRow label='Name' value={getGuardianName(student)} />
          <DetailRow
            label='Phone'
            value={
              guardian.contactInfo?.phone ||
              guardian.user?.contactInfo?.phone ||
              guardian.phone ||
              '—'
            }
          />
          <DetailRow
            label='Email'
            value={guardian.email || guardian.user?.email || '—'}
          />
          <DetailRow label='ID type' value={guardian.idType || '—'} />
        </SectionCard>

        <SectionCard title='Address'>
          <DetailRow label='Street' value={address.street} />
          <DetailRow label='City' value={address.city} />
          <DetailRow
            label='Region'
            value={address.region || address.state || address.district}
          />
          <DetailRow
            label='Postal code'
            value={address.postalCode || address.zip}
          />
          <DetailRow label='Country' value={address.country} />
          <DetailRow label='Full address' value={fullAddress} />
        </SectionCard>
      </div>

      <RelatedComplaints complaints={student.reports || []} personLabel='student' />
    </section>
  )
}

export default StudentDetails

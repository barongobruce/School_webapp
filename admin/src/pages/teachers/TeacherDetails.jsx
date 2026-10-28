import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Ban,
  BookOpen,
  ChevronDown,
  Mail,
  Pencil,
  Phone,
} from 'lucide-react'
import { getTeacherById, setTeacherStatus } from '../../lib/teacher.requests'
import { normalizeIdType } from '../../lib/idTypes'
import useModal from '../../hooks/useModal'
import Button from '../../components/Button'
import EditTeacher from './components/EditTeacher'
import TeacherDetailsSkeleton from './components/TeacherDetailsSkeleton'
import RelatedComplaints from '../../components/RelatedComplaints'
import AdminTeacherTimetable from './components/AdminTeacherTimetable'

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const statusClass = (status) =>
  status === 'Active'
    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25'
    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25'

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
const itemRadius = { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }

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

const TeacherAvatar = ({ teacher, className = 'size-28 sm:size-32' }) => {
  const photo = teacher.picture || teacher.photo || teacher.user?.photo || ''
  const firstName = teacher.firstName || teacher.user?.firstName || ''
  const lastName = teacher.lastName || teacher.user?.lastName || ''
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

const TeacherDetails = () => {
  const { id } = useParams()
  const { open } = useModal()
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [banLoading, setBanLoading] = useState(false)
  const [addressExpanded, setAddressExpanded] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadTeacher = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getTeacherById(id)
        if (!cancelled) setTeacher(data.teacher)
      } catch (err) {
        if (!cancelled) {
          setTeacher(null)
          setError(err.message || 'Failed to load teacher.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadTeacher()

    return () => {
      cancelled = true
    }
  }, [id])

  const reloadTeacher = async () => {
    try {
      const data = await getTeacherById(id)
      setTeacher(data.teacher)
    } catch (err) {
      setError(err.message || 'Failed to reload teacher.')
    }
  }

  const handleEditTeacher = () => {
    if (!teacher) return
    open({
      title: 'Edit Teacher',
      description: `Update the staff profile for ${getFullName(teacher)}.`,
      size: 'full',
      content: <EditTeacher teacher={teacher} onSuccess={reloadTeacher} />,
    })
  }

  const handleToggleBan = async () => {
    if (!teacher || banLoading) return

    const teacherId = teacher._id || teacher.id
    const isActive =
      typeof teacher.isActive === 'boolean'
        ? teacher.isActive
        : teacher.user?.isActive !== false
    const name = getFullName(teacher) || 'this teacher'

    const confirmed = window.confirm(
      isActive
        ? `Ban ${name}? They will not be able to log in until unbanned.`
        : `Unban ${name}? They will be able to log in again.`,
    )
    if (!confirmed) return

    setBanLoading(true)
    setError('')
    try {
      const data = await setTeacherStatus(teacherId, !isActive)
      setTeacher(data.teacher)
    } catch (err) {
      setError(err.message || 'Could not update teacher status.')
    } finally {
      setBanLoading(false)
    }
  }

  if (loading) {
    return <TeacherDetailsSkeleton />
  }

  if (!teacher) {
    return (
      <section className='flex flex-1 flex-col items-start gap-4 overflow-y-auto px-3 py-5 sm:px-4'>
        <Link
          to='/teachers'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to teachers
        </Link>
        <div className={`w-full ${surface} px-6 py-12 text-center`} style={cardRadius}>
          <h1 className='text-[15px] font-semibold text-gray-900 dark:text-white'>
            Teacher not found
          </h1>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {error || (
              <>
                No teacher matches the ID{' '}
                <span className='font-medium text-gray-700 dark:text-gray-300'>{id}</span>.
              </>
            )}
          </p>
        </div>
      </section>
    )
  }

  const teacherId = teacher._id || teacher.id
  const fullName = getFullName(teacher)
  const status = getStatus(teacher)
  const isUserActive = status === 'Active'
  const email = teacher.email || teacher.user?.email || ''
  const role = teacher.role || teacher.user?.role || 'teacher'
  const contact = teacher.contactInfo || teacher.user?.contactInfo || {}
  const address = teacher.address || teacher.user?.address || {}
  const qualifications = teacher.qualifications || []
  const classCount = teacher.classes?.length ?? 0
  const fullAddress = [
    address.street,
    address.city,
    address.state,
    address.zip,
    address.country,
  ]
    .filter(Boolean)
    .join(', ')

  const locationLabel = [address.city, address.country].filter(Boolean).join(', ')
  const metaParts = [
    role || null,
    teacher.department || null,
    locationLabel || null,
    `${qualifications.length} ${qualifications.length === 1 ? 'certificate' : 'certificates'}`,
    teacher.createdAt ? `Joined ${formatDate(teacher.createdAt)}` : null,
  ].filter(Boolean)

  const hasContacts = email || contact.phone || contact.whatsapp || contact.altPhone

  return (
    <section className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <Link
          to='/teachers'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to teachers
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
          <Button type='button' variant='primary' size='sm' onClick={handleEditTeacher}>
            <Pencil className='size-3.5' strokeWidth={1.75} />
            Edit Teacher
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
          <TeacherAvatar teacher={teacher} />

          <div className='flex min-w-0 flex-1 flex-col justify-between gap-4'>
            <div>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <h1 className='truncate text-[22px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[26px]'>
                    {fullName}
                  </h1>
                  <p className='mt-1 font-mono text-[12px] tracking-wide text-gray-400 dark:text-gray-500'>
                    {teacherId}
                  </p>
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

            {hasContacts && (
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
                {contact.phone ? (
                  <a
                    href={toTelHref(contact.phone)}
                    className={contactActionClass}
                    style={chipRadius}
                    aria-label={`Call ${contact.phone}`}
                  >
                    <Phone className='size-4 shrink-0' strokeWidth={1.75} />
                    Call
                  </a>
                ) : null}
                {contact.whatsapp ? (
                  <a
                    href={toWhatsAppHref(contact.whatsapp)}
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
                {contact.altPhone ? (
                  <a
                    href={toTelHref(contact.altPhone)}
                    className={contactActionClass}
                    style={chipRadius}
                    aria-label={`Call alternate ${contact.altPhone}`}
                  >
                    <Phone className='size-4 shrink-0' strokeWidth={1.75} />
                    Alt. Call
                  </a>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <StatCard
          label='Qualifications'
          value={qualifications.length}
          valueClassName='text-teal-600 dark:text-teal-400'
        />
        <StatCard label='Role' value={role || '—'} />
        <StatCard
          label='Classes'
          value={classCount}
          valueClassName='text-teal-600 dark:text-teal-400'
        />
      </div>

      <div className='mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2'>
        <div
          className='border border-teal-200/60 bg-teal-50/40 p-5 dark:border-teal-500/20 dark:bg-teal-500/8'
          style={cardRadius}
        >
          <div className='mb-4 flex items-center justify-between gap-3'>
            <h2 className='text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase dark:text-gray-400'>
              Qualifications
            </h2>
            <span
              className='bg-teal-100 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 dark:bg-teal-500/25 dark:text-teal-300'
              style={chipRadius}
            >
              {qualifications.length}
            </span>
          </div>

          {qualifications.length === 0 ? (
            <p className='text-[13px] text-gray-500 dark:text-gray-400'>
              No qualification documents uploaded.
            </p>
          ) : (
            <ul className='flex flex-col gap-2'>
              {qualifications.map((item, index) => (
                <li key={`${item.title}-${index}`}>
                  <a
                    href={item.document}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex w-full items-center justify-between gap-3 border border-gray-200/70 bg-white px-3 py-2 text-[13px] font-medium text-teal-800 transition-colors hover:border-teal-200 hover:bg-teal-50/60 dark:border-white/10 dark:bg-[#0c1528] dark:text-teal-200 dark:hover:border-teal-500/30 dark:hover:bg-teal-500/10'
                    style={itemRadius}
                  >
                    <span className='truncate'>{item.title || `Certificate ${index + 1}`}</span>
                    <BookOpen className='size-3.5 shrink-0' strokeWidth={1.75} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className='border border-teal-200/60 bg-teal-50/40 p-5 dark:border-teal-500/20 dark:bg-teal-500/8'
          style={cardRadius}
        >
          <div className='mb-4 flex items-center justify-between gap-3'>
            <h2 className='text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase dark:text-gray-400'>
              Classes assigned
            </h2>
            <span
              className='bg-teal-100 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 dark:bg-teal-500/25 dark:text-teal-300'
              style={chipRadius}
            >
              {classCount}
            </span>
          </div>

          {classCount === 0 ? (
            <p className='text-[13px] text-gray-500 dark:text-gray-400'>
              No classes assigned to this teacher.
            </p>
          ) : (
            <p className='text-[13px] text-gray-600 dark:text-gray-300'>
              This teacher is linked to {classCount}{' '}
              {classCount === 1 ? 'class' : 'classes'}.
            </p>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
        <SectionCard title='Account information'>
          <DetailRow label='Full name' value={fullName} />
          <DetailRow label='Email' value={email} />
          <DetailRow label='Role' value={role} />
          <DetailRow label='Status' value={status} />
        </SectionCard>

        <SectionCard title='Contact information'>
          <DetailRow label='Phone' value={contact.phone} />
          <DetailRow label='Alternate phone' value={contact.altPhone} />
          <DetailRow label='WhatsApp' value={contact.whatsapp} />
          <DetailRow label='Email' value={email} />
        </SectionCard>

        <SectionCard title='Identification'>
          <DetailRow
            label='ID type'
            value={normalizeIdType(teacher.identification?.type)}
          />
          {teacher.identification?.front && (
            <DetailRow
              label='Front document'
              value={
                <a
                  href={teacher.identification.front}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:underline dark:text-blue-400'
                >
                  View
                </a>
              }
            />
          )}
          {teacher.identification?.back && (
            <DetailRow
              label='Back document'
              value={
                <a
                  href={teacher.identification.back}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:underline dark:text-blue-400'
                >
                  View
                </a>
              }
            />
          )}
        </SectionCard>

        <section className={`${surface} p-5`} style={cardRadius}>
          <button
            type='button'
            onClick={() => setAddressExpanded((prev) => !prev)}
            aria-expanded={addressExpanded}
            className='flex w-full items-start justify-between gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'
          >
            <div className='min-w-0 flex-1'>
              <h2 className='text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase dark:text-gray-400'>
                Address
              </h2>
              {!addressExpanded && (
                <p className='mt-1.5 truncate text-[13px] text-gray-500 dark:text-gray-400'>
                  {fullAddress || '—'}
                </p>
              )}
            </div>
            <ChevronDown
              className={`mt-0.5 size-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                addressExpanded ? 'rotate-180' : ''
              }`}
              strokeWidth={1.75}
              aria-hidden='true'
            />
          </button>

          {addressExpanded && (
            <dl className='mt-4 flex flex-col gap-3'>
              <DetailRow label='Street' value={address.street} />
              <DetailRow label='City' value={address.city} />
              <DetailRow label='State / region' value={address.state} />
              <DetailRow label='ZIP / postal code' value={address.zip} />
              <DetailRow label='Country' value={address.country} />
              <DetailRow label='Full address' value={fullAddress} />
            </dl>
          )}
        </section>

        <SectionCard title='Record details'>
          <DetailRow label='Teacher ID' value={teacherId} />
          <DetailRow label='Created' value={formatDate(teacher.createdAt)} />
          <DetailRow label='Updated' value={formatDate(teacher.updatedAt)} />
        </SectionCard>
      </div>

      <AdminTeacherTimetable teacherId={teacher._id || teacher.id} />

      <RelatedComplaints complaints={teacher.reports || []} personLabel='teacher' />
    </section>
  )
}

export default TeacherDetails

import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  GraduationCap,
  IdCard,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'
import { getTeacherGuardianById } from '../../../../lib/teacher.requests'
import GuardianDetailsSkeleton from './components/GuardianDetailsSkeleton'
import RelatedComplaints from '../../../../components/RelatedComplaints'

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

const getStatus = (entity) => {
  const isActive = entity?.isActive ?? entity?.user?.isActive
  if (typeof isActive === 'boolean') {
    return isActive ? 'Active' : 'Inactive'
  }
  return entity?.status || 'Active'
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

const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const avatarRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }

const surface =
  'border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#0c1528]'

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

const contactActionClass =
  'inline-flex items-center gap-2 border border-blue-200/80 bg-blue-50 px-3.5 py-2.5 text-[13px] font-medium text-blue-800 transition-colors hover:border-blue-300 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/15'

const whatsappActionClass =
  'inline-flex items-center gap-2 border border-emerald-200/80 bg-emerald-50 px-3.5 py-2.5 text-[13px] font-medium text-emerald-800 transition-colors hover:border-emerald-300 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/15'

const socialIconClass =
  'grid size-9 place-items-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200'

const metaChipClass =
  'inline-flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200/80 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10'

const DetailRow = ({ label, value }) => (
  <div className='flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4'>
    <dt className='shrink-0 text-[12px] text-gray-500 dark:text-gray-400'>
      {label}
    </dt>
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

const resolveStudents = (students = []) =>
  students.map((student) => {
    if (student && typeof student === 'object') {
      const id = student._id || student.id
      const firstName = student.firstName || student.user?.firstName || ''
      const lastName = student.lastName || student.user?.lastName || ''
      return {
        id,
        name: `${firstName} ${lastName}`.trim() || 'Student',
        photo: student.photo || student.user?.photo || null,
        classGrade: getClassLabel(student),
        status: getStatus(student),
        linked: Boolean(id),
      }
    }

    return {
      id: student,
      name: String(student),
      photo: null,
      classGrade: null,
      status: null,
      linked: false,
    }
  })

const GuardianAvatar = ({ guardian, className = 'size-24 sm:size-28' }) => {
  const firstName = guardian.firstName || guardian.user?.firstName || ''
  const lastName = guardian.lastName || guardian.user?.lastName || ''
  const photo = guardian.photo || guardian.user?.photo || ''
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()

  return (
    <div
      className={`${className} shrink-0 overflow-hidden ring-1 ring-gray-200/80 dark:ring-white/10`}
      style={avatarRadius}
    >
      {photo ? (
        <img src={photo} alt='' className='!h-full !w-full object-cover' />
      ) : (
        <div className='flex !h-full !w-full items-center justify-center bg-blue-50 text-2xl font-semibold text-blue-800 dark:bg-blue-500/10 dark:text-blue-300'>
          {initials || '?'}
        </div>
      )}
    </div>
  )
}

const GuardianDetails = () => {
  const { id } = useParams()
  const [addressExpanded, setAddressExpanded] = useState(false)
  const [guardian, setGuardian] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadGuardian = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getTeacherGuardianById(id)
        if (!cancelled) setGuardian(data.guardian)
      } catch (err) {
        if (!cancelled) {
          setGuardian(null)
          setError(err.message || 'Failed to load guardian.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadGuardian()

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return <GuardianDetailsSkeleton />
  }

  if (!guardian) {
    return (
      <section className='flex flex-1 flex-col items-start gap-4 overflow-y-auto px-3 py-5 sm:px-4'>
        <Link
          to='/dashboard/guardians'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to guardians
        </Link>
        <div
          className={`w-full ${surface} px-6 py-12 text-center`}
          style={cardRadius}
        >
          <h1 className='text-[15px] font-semibold text-gray-900 dark:text-white'>
            Guardian not found
          </h1>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {error || (
              <>
                No guardian matches the ID{' '}
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

  const guardianId = guardian._id || guardian.id
  const firstName = guardian.firstName || guardian.user?.firstName || ''
  const lastName = guardian.lastName || guardian.user?.lastName || ''
  const email = guardian.email || guardian.user?.email || ''
  const fullName = `${firstName} ${lastName}`.trim() || 'Unnamed guardian'
  const status = getStatus(guardian)
  const phone =
    guardian.contactInfo?.phone ||
    guardian.user?.contactInfo?.phone ||
    guardian.phone ||
    ''
  const altPhone =
    guardian.contactInfo?.altPhone ||
    guardian.user?.contactInfo?.altPhone ||
    guardian.alternatePhone ||
    ''
  const whatsapp =
    guardian.contactInfo?.whatsapp ||
    guardian.user?.contactInfo?.whatsapp ||
    guardian.whatsapp ||
    ''
  const socials =
    guardian.socialMedia || guardian.user?.socialMedia || guardian.socials || {}
  const address = guardian.address || guardian.user?.address || {}
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
  const linkedStudents = resolveStudents(guardian.students)
  const studentCount = linkedStudents.length
  const reports = Array.isArray(guardian.reports)
    ? guardian.reports.filter(
        (report) => report && typeof report === 'object' && report.title,
      )
    : []

  const hasSocials = Boolean(
    socials.facebook ||
      socials.twitter ||
      socials.instagram ||
      socials.linkedin,
  )

  return (
    <section className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <Link
          to='/dashboard/guardians'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to guardians
        </Link>
      </div>

      {/* Identity + contact actions */}
      <div className={`mb-4 ${surface} p-5 sm:p-6`} style={cardRadius}>
        <div className='flex flex-col gap-5 sm:flex-row sm:items-start'>
          <GuardianAvatar guardian={guardian} />

          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-[22px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[26px]'>
                {fullName}
              </h1>
              <span
                className={`inline-flex px-2.5 py-1 text-[11px] font-medium ${statusClass(status)}`}
                style={chipRadius}
              >
                {status}
              </span>
            </div>

            <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
              {email || guardianId}
            </p>

            <div className='mt-3 flex flex-wrap gap-2'>
              {guardian.idType ? (
                <span className={metaChipClass} style={chipRadius}>
                  <IdCard className='size-3' strokeWidth={2} />
                  {guardian.idType}
                </span>
              ) : null}
              {locationLabel ? (
                <span className={metaChipClass} style={chipRadius}>
                  <MapPin className='size-3' strokeWidth={2} />
                  {locationLabel}
                </span>
              ) : null}
              <span
                className='inline-flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-800 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20'
                style={chipRadius}
              >
                <GraduationCap className='size-3' strokeWidth={2} />
                {studentCount} {studentCount === 1 ? 'student' : 'students'}
              </span>
              <span className={metaChipClass} style={chipRadius}>
                <Calendar className='size-3' strokeWidth={2} />
                Joined {formatDate(guardian.createdAt)}
              </span>
            </div>

            <div className='mt-4 flex flex-wrap gap-2'>
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
            </div>
          </div>

          {hasSocials ? (
            <div className='flex shrink-0 flex-row gap-1.5 self-start sm:flex-col'>
              {socials.facebook ? (
                <a
                  href={socials.facebook}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label='Facebook profile'
                  className={socialIconClass}
                  style={chipRadius}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='size-5'
                    aria-hidden='true'
                  >
                    <path d='M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4z' />
                  </svg>
                </a>
              ) : null}
              {socials.twitter ? (
                <a
                  href={socials.twitter}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label='Twitter profile'
                  className={socialIconClass}
                  style={chipRadius}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='size-5'
                    aria-hidden='true'
                  >
                    <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z' />
                  </svg>
                </a>
              ) : null}
              {socials.instagram ? (
                <a
                  href={socials.instagram}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label='Instagram profile'
                  className={socialIconClass}
                  style={chipRadius}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='size-5'
                    aria-hidden='true'
                  >
                    <path d='M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772c-.5.509-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z' />
                  </svg>
                </a>
              ) : null}
              {socials.linkedin ? (
                <a
                  href={socials.linkedin}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label='LinkedIn profile'
                  className={socialIconClass}
                  style={chipRadius}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='size-5'
                    aria-hidden='true'
                  >
                    <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1-.004-4.123 2.062 2.062 0 0 1 .004 4.123zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                  </svg>
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <StatCard
          label='Linked students'
          value={studentCount}
          valueClassName='text-blue-700 dark:text-blue-400'
        />
        <StatCard label='ID type' value={guardian.idType || '—'} />
        <StatCard label='Phone' value={phone || '—'} />
      </div>

      <div
        className='mb-4 border border-blue-200/70 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 p-5 dark:border-blue-500/20 dark:from-blue-500/10 dark:via-[#0c1528] dark:to-blue-500/5'
        style={cardRadius}
      >
        <div className='mb-4 flex items-center justify-between gap-3'>
          <h2 className='text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase dark:text-gray-400'>
            Linked students
          </h2>
          <span
            className='inline-flex bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20'
            style={chipRadius}
          >
            {studentCount}
          </span>
        </div>

        {studentCount === 0 ? (
          <p className='text-[13px] text-gray-500 dark:text-gray-400'>
            No students are linked to this guardian.
          </p>
        ) : (
          <ul className='grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3'>
            {linkedStudents.map((student) => (
              <li key={student.id}>
                {student.linked ? (
                  <div
                    className={`flex items-center gap-3 ${surface} p-3`}
                    style={chipRadius}
                  >
                    <span
                      className='size-11 shrink-0 overflow-hidden ring-1 ring-gray-200/80 dark:ring-white/10'
                      style={chipRadius}
                    >
                      {student.photo ? (
                        <img
                          src={student.photo}
                          alt=''
                          className='!h-full !w-full object-cover'
                        />
                      ) : (
                        <span className='grid !h-full !w-full place-items-center bg-blue-50 text-[11px] font-semibold text-blue-800 dark:bg-blue-500/10 dark:text-blue-300'>
                          {student.name.charAt(0)}
                        </span>
                      )}
                    </span>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
                        {student.name}
                      </p>
                      <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
                        {student.classGrade}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 text-[11px] font-medium ${statusClass(student.status)}`}
                      style={chipRadius}
                    >
                      {student.status}
                    </span>
                  </div>
                ) : (
                  <div
                    className='flex items-center gap-3 border border-dashed border-gray-200 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.03]'
                    style={chipRadius}
                  >
                    <div
                      className='grid size-11 shrink-0 place-items-center bg-gray-100 text-gray-400 dark:bg-white/5'
                      style={chipRadius}
                    >
                      <GraduationCap className='size-5' strokeWidth={1.75} />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate font-mono text-[13px] font-medium text-gray-700 dark:text-gray-200'>
                        {student.id}
                      </p>
                      <p className='mt-0.5 text-[12px] text-gray-400 dark:text-gray-500'>
                        Record not available
                      </p>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
        <SectionCard title='Personal information'>
          <DetailRow label='Full name' value={fullName} />
          <DetailRow label='Email' value={email} />
          <DetailRow label='ID type' value={guardian.idType} />
          <DetailRow label='Status' value={status} />
        </SectionCard>

        <SectionCard title='Contact information'>
          <DetailRow label='Phone' value={phone} />
          <DetailRow label='Alternate phone' value={altPhone} />
          <DetailRow label='WhatsApp' value={whatsapp} />
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
              {!addressExpanded ? (
                <p className='mt-1.5 truncate text-[13px] text-gray-500 dark:text-gray-400'>
                  {fullAddress || 'No address on file'}
                </p>
              ) : null}
            </div>
            <ChevronDown
              className={`mt-0.5 size-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                addressExpanded ? 'rotate-180' : ''
              }`}
              strokeWidth={1.75}
              aria-hidden='true'
            />
          </button>

          {addressExpanded ? (
            <dl className='mt-4 flex flex-col gap-3'>
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
            </dl>
          ) : null}
        </section>

        <SectionCard title='Record details'>
          <DetailRow label='Guardian ID' value={guardianId} />
          <DetailRow label='Created' value={formatDate(guardian.createdAt)} />
          <DetailRow label='Updated' value={formatDate(guardian.updatedAt)} />
        </SectionCard>
      </div>

      <RelatedComplaints complaints={reports} personLabel='guardian' />
    </section>
  )
}

export default GuardianDetails

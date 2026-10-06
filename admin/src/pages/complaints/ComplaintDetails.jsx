import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  UserRound,
  Users,
} from 'lucide-react'
import { getComplaintById } from '../../lib/complaint.requests'

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const statusClass = (status) => {
  switch (status) {
    case 'Open':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/80 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/25'
    case 'Under Review':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/80 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25'
    case 'Resolved':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25'
    case 'Closed':
      return 'bg-gray-50 text-gray-600 ring-1 ring-gray-200/80 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10'
    case 'Dismissed':
      return 'bg-slate-50 text-slate-600 ring-1 ring-slate-200/80 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/25'
    default:
      return 'bg-gray-50 text-gray-600 ring-1 ring-gray-200/80 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10'
  }
}

const priorityClass = (priority) => {
  switch (priority) {
    case 'Critical':
      return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200/80 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/25'
    case 'High':
      return 'bg-orange-50 text-orange-700 ring-1 ring-orange-200/80 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/25'
    case 'Medium':
      return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/80 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/25'
    case 'Low':
      return 'bg-gray-50 text-gray-600 ring-1 ring-gray-200/80 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10'
    default:
      return 'bg-gray-50 text-gray-600 ring-1 ring-gray-200/80 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10'
  }
}

const rolePath = (role, id) => {
  if (role === 'student') return `/students/${id}`
  if (role === 'teacher') return `/teachers/${id}`
  if (role === 'guardian') return `/guardians/${id}`
  return null
}

const roleLabel = (role) =>
  role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown'

const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const itemRadius = { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }
const iconRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }

const surface =
  'border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#0c1528]'

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
    {children}
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

const PartyCard = ({ label, party, tone }) => {
  if (!party) return null

  const path = rolePath(party.role, party.id)
  const tones = {
    reporter:
      'border border-violet-200/80 bg-violet-50/40 dark:border-violet-500/25 dark:bg-violet-500/10',
    reported:
      'border border-rose-200/80 bg-rose-50/40 dark:border-rose-500/25 dark:bg-rose-500/10',
  }
  const showMeta = Boolean(party.role && party.role !== 'unknown' && party.id)

  const body = (
    <div className={`p-4 ${tones[tone]}`} style={cardRadius}>
      <p className='text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-gray-400'>
        {label}
      </p>
      <p className='mt-2 text-[15px] font-semibold text-gray-900 dark:text-white'>
        {party.name}
      </p>
      {showMeta ? (
        <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
          {roleLabel(party.role)}
          <span className='mx-1.5 text-gray-300 dark:text-gray-600'>·</span>
          <span className='font-mono text-[11px]'>{party.id}</span>
        </p>
      ) : null}
      {path && (
        <span className='mt-3 inline-flex text-[12px] font-medium text-blue-600 dark:text-blue-400'>
          View profile
        </span>
      )}
    </div>
  )

  if (path) {
    return (
      <Link
        to={path}
        className='block transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500'
      >
        {body}
      </Link>
    )
  }

  return body
}

const getRelatedStudents = (complaint) => {
  const people = [
    complaint?.reporter,
    ...(complaint?.reportedParties || []),
    ...(complaint?.witnesses || []),
  ].filter(Boolean)

  const seen = new Set()
  return people.filter((person) => {
    if (person.role !== 'student' || !person.id || seen.has(person.id)) {
      return false
    }
    seen.add(person.id)
    return true
  })
}

const ComplaintDetails = () => {
  const { id } = useParams()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadComplaint = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getComplaintById(id)
        if (!cancelled) setComplaint(data.complaint)
      } catch (err) {
        if (!cancelled) {
          setComplaint(null)
          setError(err.message || 'Failed to load complaint.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadComplaint()

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <section
        className='flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-5 sm:px-4'
        aria-busy='true'
        aria-label='Loading complaint'
      >
        <div
          className='h-4 w-36 animate-pulse bg-gray-200 dark:bg-white/10'
          style={{ borderRadius: '0.6rem 0.2rem 0.6rem 0.2rem' }}
        />
        <div
          className={`h-48 animate-pulse bg-gray-200 dark:bg-white/10 ${surface}`}
          style={cardRadius}
        />
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className={`h-20 animate-pulse bg-gray-200 dark:bg-white/10 ${surface}`}
              style={cardRadius}
            />
          ))}
        </div>
      </section>
    )
  }

  if (!complaint) {
    return (
      <section className='flex flex-1 flex-col items-start gap-4 overflow-y-auto px-3 py-5 sm:px-4'>
        <Link
          to='/complaints'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to complaints
        </Link>
        <div
          className={`w-full ${surface} px-6 py-12 text-center`}
          style={cardRadius}
        >
          <h1 className='text-[15px] font-semibold text-gray-900 dark:text-white'>
            Complaint not found
          </h1>
          <p className='mt-1 text-[13px] text-gray-500 dark:text-gray-400'>
            {error || (
              <>
                No complaint matches the ID{' '}
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

  const relatedStudents = getRelatedStudents(complaint)
  const isClosed = complaint.status === 'Resolved'

  return (
    <section className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4'>
      <div className='mb-4'>
        <Link
          to='/complaints'
          className='inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-gray-400 dark:hover:text-blue-400'
        >
          <ArrowLeft className='size-3.5' strokeWidth={1.75} />
          Back to complaints
        </Link>
      </div>

      <div className={`mb-4 ${surface} p-5 sm:p-6`} style={cardRadius}>
        <div className='flex flex-wrap items-center gap-2'>
          <span
            className={`inline-flex px-2.5 py-1 text-[11px] font-medium ${statusClass(complaint.status)}`}
            style={chipRadius}
          >
            {complaint.status}
          </span>
          <span
            className={`inline-flex px-2.5 py-1 text-[11px] font-medium ${priorityClass(complaint.priority)}`}
            style={chipRadius}
          >
            {complaint.priority}
          </span>
          <span
            className='inline-flex bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200/80 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10'
            style={chipRadius}
          >
            {complaint.category}
          </span>
        </div>

        <h1 className='mt-3 text-[22px] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[26px]'>
          {complaint.title}
        </h1>

        {complaint.incidentDate ? (
          <div className='mt-3 flex flex-wrap gap-2'>
            <span className={metaChipClass} style={chipRadius}>
              <Calendar className='size-3' strokeWidth={2} />
              Filed {formatDate(complaint.incidentDate)}
            </span>
          </div>
        ) : null}

        <p className='mt-4 text-[13px] leading-relaxed text-gray-600 dark:text-gray-300'>
          {complaint.description}
        </p>
      </div>

      <div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <StatCard label='Priority' value={complaint.priority} />
        <StatCard label='Category' value={complaint.category} />
        <StatCard
          label='Filed'
          value={
            complaint.createdAt ? formatDate(complaint.createdAt) : '—'
          }
          valueClassName='text-[15px]'
        />
      </div>

      <div className='mb-4 grid grid-cols-1 items-center gap-3 lg:grid-cols-[1fr_auto_1fr]'>
        <PartyCard
          label='Complainant'
          party={complaint.reporter}
          tone='reporter'
        />
        <div className='hidden justify-center lg:flex'>
          <ArrowRight
            className='size-5 text-gray-300 dark:text-gray-600'
            strokeWidth={1.75}
            aria-hidden='true'
          />
        </div>
        <PartyCard
          label='Reported party'
          party={complaint.reportedParty}
          tone='reported'
        />
      </div>

      {complaint.resolution ? (
        <div
          className='mb-4 border border-emerald-200/80 bg-emerald-50/40 p-5 dark:border-emerald-500/25 dark:bg-emerald-500/10'
          style={cardRadius}
        >
          <div className='mb-2 flex items-center gap-2'>
            <CheckCircle2
              className='size-4 text-emerald-600 dark:text-emerald-400'
              strokeWidth={1.75}
            />
            <h2 className='text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase dark:text-gray-400'>
              Resolution
            </h2>
            {complaint.resolvedAt ? (
              <span className='ml-auto text-[12px] text-gray-500 dark:text-gray-400'>
                {formatDate(complaint.resolvedAt)}
              </span>
            ) : null}
          </div>
          <p className='text-[13px] leading-relaxed text-gray-700 dark:text-gray-300'>
            {complaint.resolution}
          </p>
        </div>
      ) : null}

      {!complaint.resolution && !isClosed ? (
        <div
          className='mb-4 border border-dashed border-amber-200/80 bg-amber-50/30 px-5 py-4 dark:border-amber-500/25 dark:bg-amber-500/10'
          style={cardRadius}
        >
          <p className='text-[13px] text-amber-800 dark:text-amber-300'>
            This case is still active and awaiting a resolution.
          </p>
        </div>
      ) : null}

      <div
        className='mb-4 border border-rose-200/60 bg-rose-50/40 p-5 dark:border-rose-500/20 dark:bg-rose-500/8'
        style={cardRadius}
      >
        <div className='mb-4 flex items-center justify-between gap-3'>
          <h2 className='text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase dark:text-gray-400'>
            Related students
          </h2>
          <span
            className='bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-500/25 dark:text-rose-300'
            style={chipRadius}
          >
            {relatedStudents.length}
          </span>
        </div>

        {relatedStudents.length === 0 ? (
          <p className='text-[13px] text-gray-500 dark:text-gray-400'>
            No related students linked to this complaint.
          </p>
        ) : (
          <ul className='grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3'>
            {relatedStudents.map((student) => (
              <li key={student.id}>
                <Link
                  to={`/students/${student.id}`}
                  className='flex items-center gap-3 border border-gray-200/70 bg-white p-3 transition-colors hover:border-rose-200 hover:bg-rose-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-white/10 dark:bg-[#0c1528] dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10'
                  style={itemRadius}
                >
                  <span
                    className='size-11 shrink-0 overflow-hidden ring-1 ring-gray-200/80 dark:ring-white/10'
                    style={iconRadius}
                  >
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt=''
                        className='!h-full !w-full object-cover'
                      />
                    ) : (
                      <span className='grid !h-full !w-full place-items-center bg-rose-50 text-[11px] font-semibold text-rose-800 dark:bg-rose-500/10 dark:text-rose-300'>
                        {student.name?.charAt(0) || (
                          <UserRound className='size-5' strokeWidth={1.75} />
                        )}
                      </span>
                    )}
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
                      {student.name}
                    </p>
                    <p className='mt-0.5 truncate font-mono text-[11px] text-gray-500 dark:text-gray-400'>
                      {student.id}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
        <SectionCard title='Witnesses'>
          {complaint.witnesses?.length ? (
            <ul className='flex flex-col gap-2'>
              {complaint.witnesses.map((witness) => (
                <li
                  key={witness.id || witness.name}
                  className='flex items-center gap-3 border border-gray-100 bg-gray-50/80 px-3 py-2.5 dark:border-white/8 dark:bg-white/[0.03]'
                  style={itemRadius}
                >
                  <div
                    className='grid size-8 shrink-0 place-items-center bg-white text-gray-400 dark:bg-[#152238]'
                    style={iconRadius}
                  >
                    <Users className='size-4' strokeWidth={1.75} />
                  </div>
                  <div className='min-w-0'>
                    <p className='truncate text-[13px] font-medium text-gray-900 dark:text-gray-100'>
                      {witness.name}
                    </p>
                    {witness.role && witness.role !== 'unknown' ? (
                      <p className='text-[11px] text-gray-500 dark:text-gray-400'>
                        {roleLabel(witness.role)}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-[13px] text-gray-500 dark:text-gray-400'>
              No witnesses listed.
            </p>
          )}
        </SectionCard>

        <SectionCard title='Case record'>
          <dl className='flex flex-col gap-3'>
            <DetailRow label='Complaint ID' value={complaint.id} />
            <DetailRow
              label='Created'
              value={
                complaint.createdAt ? formatDate(complaint.createdAt) : '—'
              }
            />
            <DetailRow
              label='Updated'
              value={
                complaint.updatedAt ? formatDate(complaint.updatedAt) : '—'
              }
            />
            <DetailRow
              label='Resolved'
              value={
                complaint.resolvedAt
                  ? formatDate(complaint.resolvedAt)
                  : 'Pending'
              }
            />
          </dl>
        </SectionCard>
      </div>
    </section>
  )
}

export default ComplaintDetails

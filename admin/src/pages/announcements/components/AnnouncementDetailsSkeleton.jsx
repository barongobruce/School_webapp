import React from 'react'

const bone = 'animate-pulse bg-gray-200 dark:bg-white/10'
const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const softRadius = { borderRadius: '0.7rem 0.22rem 0.7rem 0.22rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const avatarRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }
const surface =
  'border border-gray-200/70 bg-white dark:border-white/10 dark:bg-[#0c1528]'

const DetailRowSkeleton = () => (
  <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
    <div className={`${bone} h-3 w-24`} style={softRadius} />
    <div className={`${bone} h-3 w-32 sm:w-40`} style={softRadius} />
  </div>
)

const SectionCardSkeleton = ({ rows = 4, variant = 'rows' }) => (
  <section className={`${surface} p-5`} style={cardRadius}>
    <div className={`${bone} mb-4 h-3 w-36`} style={softRadius} />
    {variant === 'chips' ? (
      <div className='flex flex-wrap gap-2'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={`${bone} h-9 w-24`} style={chipRadius} />
        ))}
      </div>
    ) : variant === 'body' ? (
      <div className='space-y-2'>
        <div className={`${bone} h-3.5 w-full`} style={softRadius} />
        <div className={`${bone} h-3.5 w-5/6`} style={softRadius} />
        <div className={`${bone} h-3.5 w-2/3`} style={softRadius} />
      </div>
    ) : (
      <div className='flex flex-col gap-3'>
        {Array.from({ length: rows }).map((_, index) => (
          <DetailRowSkeleton key={index} />
        ))}
      </div>
    )}
  </section>
)

const AnnouncementDetailsSkeleton = () => (
  <section
    className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4'
    aria-busy='true'
    aria-label='Loading announcement details'
  >
    <div className='mb-4 flex items-center justify-between gap-3'>
      <div className={`${bone} h-3.5 w-36`} style={softRadius} />
      <div
        className={`${bone} h-9 w-36`}
        style={{ borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }}
      />
    </div>

    <div className={`mb-4 ${surface} p-4 sm:p-5`} style={cardRadius}>
      <div className='flex flex-col gap-5 sm:flex-row sm:items-stretch'>
        <div
          className={`${bone} size-28 shrink-0 sm:size-32`}
          style={avatarRadius}
        />

        <div className='flex min-w-0 flex-1 flex-col justify-between gap-4'>
          <div className='space-y-3'>
            <div className='flex flex-wrap items-start justify-between gap-3'>
              <div className='space-y-2'>
                <div className={`${bone} h-7 w-56`} style={softRadius} />
                <div className={`${bone} h-3 w-40`} style={softRadius} />
              </div>
              <div className={`${bone} h-6 w-16`} style={chipRadius} />
            </div>
            <div className={`${bone} h-3.5 w-72 max-w-full`} style={softRadius} />
          </div>
          <div className='flex gap-3 border-t border-gray-100 pt-3 dark:border-white/8'>
            <div className={`${bone} h-4 w-24`} style={softRadius} />
            <div className={`${bone} h-4 w-28`} style={softRadius} />
            <div className={`${bone} h-4 w-28`} style={softRadius} />
          </div>
        </div>
      </div>
    </div>

    <div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3'>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className={`${surface} px-4 py-4`} style={cardRadius}>
          <div className={`${bone} h-3 w-20`} style={softRadius} />
          <div className={`${bone} mt-3 h-5 w-16`} style={softRadius} />
        </div>
      ))}
    </div>

    <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
      <SectionCardSkeleton variant='body' />
      <SectionCardSkeleton variant='chips' />
      <SectionCardSkeleton rows={4} />
      <SectionCardSkeleton rows={4} />
    </div>
  </section>
)

export default AnnouncementDetailsSkeleton

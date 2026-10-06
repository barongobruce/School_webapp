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

const SectionCardSkeleton = ({ rows = 4 }) => (
  <section className={`${surface} p-5`} style={cardRadius}>
    <div className={`${bone} mb-4 h-3 w-36`} style={softRadius} />
    <div className='flex flex-col gap-3'>
      {Array.from({ length: rows }).map((_, index) => (
        <DetailRowSkeleton key={index} />
      ))}
    </div>
  </section>
)

const GuardianDetailsSkeleton = () => (
  <section
    className='flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4'
    aria-busy='true'
    aria-label='Loading guardian details'
  >
    <div className='mb-4 flex items-center justify-between gap-3'>
      <div className={`${bone} h-3.5 w-28`} style={softRadius} />
    </div>

    <div className={`mb-4 ${surface} p-5 sm:p-6`} style={cardRadius}>
      <div className='flex flex-col gap-5 sm:flex-row sm:items-start'>
        <div
          className={`${bone} size-24 shrink-0 sm:size-28`}
          style={avatarRadius}
        />
        <div className='min-w-0 flex-1 space-y-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <div className={`${bone} h-7 w-48`} style={softRadius} />
            <div className={`${bone} h-6 w-16`} style={chipRadius} />
          </div>
          <div className={`${bone} h-3.5 w-40`} style={softRadius} />
          <div className='flex flex-wrap gap-2'>
            <div className={`${bone} h-6 w-24`} style={chipRadius} />
            <div className={`${bone} h-6 w-28`} style={chipRadius} />
            <div className={`${bone} h-6 w-20`} style={chipRadius} />
          </div>
          <div className='flex flex-wrap gap-2 pt-1'>
            <div className={`${bone} h-10 w-24`} style={chipRadius} />
            <div className={`${bone} h-10 w-20`} style={chipRadius} />
            <div className={`${bone} h-10 w-28`} style={chipRadius} />
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

    <div className={`mb-4 ${surface} p-5`} style={cardRadius}>
      <div className='mb-4 flex items-center justify-between gap-3'>
        <div className={`${bone} h-3 w-28`} style={softRadius} />
        <div className={`${bone} h-5 w-8`} style={chipRadius} />
      </div>
      <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className='flex items-center gap-3 border border-gray-100 bg-gray-50/70 p-3 dark:border-white/8 dark:bg-white/[0.03]'
            style={chipRadius}
          >
            <div className={`${bone} size-11 shrink-0`} style={chipRadius} />
            <div className='min-w-0 flex-1 space-y-2'>
              <div className={`${bone} h-3 w-24`} style={softRadius} />
              <div className={`${bone} h-2.5 w-16`} style={softRadius} />
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
      <SectionCardSkeleton rows={4} />
      <SectionCardSkeleton rows={3} />
      <SectionCardSkeleton rows={1} />
      <SectionCardSkeleton rows={3} />
    </div>
  </section>
)

export default GuardianDetailsSkeleton

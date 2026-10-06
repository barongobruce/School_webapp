import React from 'react'

const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }

const AnnouncementDetailsSkeleton = () => (
  <section
    className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-3 sm:px-4'
    aria-busy='true'
    aria-label='Loading announcement'
  >
    <div className='h-5 w-40 animate-pulse rounded bg-gray-200 dark:bg-white/10' />
    <div className='h-40 animate-pulse bg-gray-200 dark:bg-white/10' style={cardRadius} />
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className='h-20 animate-pulse bg-gray-200 dark:bg-white/10'
          style={cardRadius}
        />
      ))}
    </div>
    <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className='h-40 animate-pulse bg-gray-200 dark:bg-white/10'
          style={cardRadius}
        />
      ))}
    </div>
  </section>
)

export default AnnouncementDetailsSkeleton

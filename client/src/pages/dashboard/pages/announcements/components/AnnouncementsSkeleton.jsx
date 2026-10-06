import React from 'react'

const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }

const AnnouncementsSkeleton = () => (
  <section className='px-3 pb-4 sm:px-4' aria-busy='true' aria-label='Loading announcements'>
    <div className='mb-4 h-5 w-40 animate-pulse rounded bg-gray-200 dark:bg-white/10' />
    <ul className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
      {Array.from({ length: 6 }).map((_, index) => (
        <li
          key={index}
          className='h-44 animate-pulse bg-gray-200 dark:bg-white/10'
          style={cardRadius}
        />
      ))}
    </ul>
  </section>
)

export default AnnouncementsSkeleton

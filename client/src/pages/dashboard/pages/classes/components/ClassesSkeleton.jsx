import React from 'react'

const bone = 'animate-pulse bg-gray-200 dark:bg-white/10'
const cardRadius = { borderRadius: '1.5rem 0.5rem 1.5rem 0.5rem' }

const ClassCardSkeleton = () => (
  <article
    className='flex h-full flex-col bg-white p-4 shadow-[var(--shadow-soft)] dark:bg-[#152238]'
    style={cardRadius}
  >
    <div className='flex items-start gap-3'>
      <div
        className={`${bone} size-11 shrink-0`}
        style={{ borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }}
      />
      <div className='min-w-0 flex-1 space-y-2'>
        <div
          className={`${bone} h-3.5 w-3/4`}
          style={{ borderRadius: '0.6rem 0.2rem 0.6rem 0.2rem' }}
        />
        <div
          className={`${bone} h-3 w-1/2`}
          style={{ borderRadius: '0.6rem 0.2rem 0.6rem 0.2rem' }}
        />
      </div>
      <div
        className={`${bone} size-7`}
        style={{ borderRadius: '0.7rem 0.2rem 0.7rem 0.2rem' }}
      />
    </div>

    <div className='mt-3 flex flex-wrap gap-1.5'>
      <div
        className={`${bone} h-6 w-14`}
        style={{ borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }}
      />
      <div
        className={`${bone} h-6 w-20`}
        style={{ borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }}
      />
      <div
        className={`${bone} h-6 w-24`}
        style={{ borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }}
      />
    </div>

    <div
      className={`${bone} mt-3 h-3 w-36`}
      style={{ borderRadius: '0.6rem 0.2rem 0.6rem 0.2rem' }}
    />

    <div className='mt-auto flex items-center justify-between gap-3 pt-4'>
      <div
        className={`${bone} h-3.5 w-16`}
        style={{ borderRadius: '0.6rem 0.2rem 0.6rem 0.2rem' }}
      />
      <div
        className={`${bone} h-9 w-24`}
        style={{ borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }}
      />
    </div>
  </article>
)

const ClassesSkeleton = () => (
  <section
    className='px-3 pb-4 sm:px-4'
    aria-busy='true'
    aria-label='Loading classes'
  >
    <div className='mb-4 flex items-center justify-between gap-3'>
      <div
        className={`${bone} h-3.5 w-28`}
        style={{ borderRadius: '0.6rem 0.2rem 0.6rem 0.2rem' }}
      />
      <div
        className={`${bone} h-9 w-18`}
        style={{ borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }}
      />
    </div>

    <ul className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
      {Array.from({ length: 6 }).map((_, index) => (
        <li key={index}>
          <ClassCardSkeleton />
        </li>
      ))}
    </ul>
  </section>
)

export default ClassesSkeleton

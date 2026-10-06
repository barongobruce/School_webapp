import React from 'react'
import { cardRadius, softRadius } from '../attendanceUtils'

const AttendanceSkeleton = () => (
  <section
    className='flex min-h-0 flex-1 flex-col gap-4 px-3 pb-4 sm:px-4'
    aria-busy='true'
    aria-label='Loading attendance'
  >
    <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className='h-24 animate-pulse bg-gray-200 dark:bg-white/10'
          style={softRadius}
        />
      ))}
    </div>
    <div
      className='h-56 animate-pulse bg-gray-200 dark:bg-white/10'
      style={cardRadius}
    />
    <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className='h-36 animate-pulse bg-gray-200 dark:bg-white/10'
          style={cardRadius}
        />
      ))}
    </div>
  </section>
)

export default AttendanceSkeleton

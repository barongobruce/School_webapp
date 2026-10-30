import React from 'react'
import { BookOpen, Sparkles } from 'lucide-react'

const panelRadius = { borderRadius: '1.35rem 0.45rem 1.35rem 0.45rem' }
const chipRadius = { borderRadius: '1rem 0.3rem 1rem 0.3rem' }

const CoursePicker = ({ catalog = [], loading = false }) => (
  <div className='form-field border p-3' style={panelRadius}>
    <div className='mb-3 flex flex-wrap gap-2'>
      {loading ? <p className='px-1 py-2 text-[12px] text-gray-400'>Loading school courses…</p> : null}
      {!loading && catalog.length === 0 ? (
        <div className='flex w-full items-center gap-3 px-1 py-2'>
          <span className='grid size-9 shrink-0 place-items-center border border-gray-200/70 bg-gray-50 text-[#20509b] dark:border-white/10 dark:bg-[#152238] dark:text-blue-300' style={chipRadius}>
            <Sparkles className='size-3.5' strokeWidth={2} />
          </span>
          <p className='text-[12px] text-gray-400'>No active school courses yet. Add subjects from the Courses page.</p>
        </div>
      ) : null}
      {catalog.map((course) => (
        <span key={course._id || course.id} className='inline-flex max-w-full items-center gap-1.5 brand-gradient px-2.5 py-1.5 text-[12px] font-semibold text-white shadow-[0_8px_16px_rgba(32,80,155,0.22)]' style={chipRadius}>
          <BookOpen className='size-3.5 shrink-0' />
          <span className='truncate'>{course.courseName}{course.courseCode ? ' · ' + course.courseCode : ''}</span>
        </span>
      ))}
    </div>
    <p className='text-[11px] text-gray-400'>All active school courses are shared by every class. New subjects added later will be available to existing and new classes.</p>
  </div>
)

export default CoursePicker

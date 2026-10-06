import React, { useMemo, useState } from 'react'
import { BookOpen, Sparkles, X } from 'lucide-react'
import Select from '../../../components/Select'

const panelRadius = { borderRadius: '1.35rem 0.45rem 1.35rem 0.45rem' }
const chipRadius = { borderRadius: '1rem 0.3rem 1rem 0.3rem' }

const getCourseId = (course) =>
  typeof course === 'string' ? course : course?._id || course?.id || ''

const CoursePicker = ({
  selectedIds = [],
  catalog = [],
  onChange,
  loading = false,
  currentClassId = '',
  selectId = 'class-course-select',
}) => {
  const [pending, setPending] = useState('')

  const catalogById = useMemo(() => {
    const map = new Map()
    catalog.forEach((course) => {
      const id = getCourseId(course)
      if (id) map.set(String(id), course)
    })
    return map
  }, [catalog])

  const selectedCourses = useMemo(
    () =>
      selectedIds
        .map((id) => catalogById.get(String(id)))
        .filter(Boolean),
    [selectedIds, catalogById],
  )

  const availableOptions = useMemo(() => {
    const selected = new Set(selectedIds.map(String))

    return [
      {
        value: '',
        label: loading ? 'Loading courses…' : 'Select a course to add',
        description: loading
          ? 'Please wait'
          : 'Choose from existing courses',
      },
      ...catalog
        .filter((course) => !selected.has(String(getCourseId(course))))
        .map((course) => {
          const id = String(getCourseId(course))
          const assignedClass = course.courseClass
          const assignedClassId =
            typeof assignedClass === 'object'
              ? assignedClass?._id || assignedClass?.id
              : assignedClass
          const assignedLabel =
            typeof assignedClass === 'object'
              ? assignedClass?.className || assignedClass?.classCode
              : ''

          let description = [course.courseCode, course.courseType]
            .filter(Boolean)
            .join(' · ')

          if (
            assignedClassId &&
            String(assignedClassId) !== String(currentClassId || '')
          ) {
            description = assignedLabel
              ? `${description || 'Course'} · Currently in ${assignedLabel}`
              : `${description || 'Course'} · Assigned to another class`
          } else if (!description) {
            description = 'Available course'
          }

          return {
            value: id,
            label: course.courseName || 'Untitled course',
            description,
          }
        }),
    ]
  }, [catalog, selectedIds, loading, currentClassId])

  const handleSelect = (event) => {
    const courseId = event.target.value
    if (!courseId) return

    const alreadySelected = selectedIds.some(
      (id) => String(id) === String(courseId),
    )
    if (alreadySelected) {
      setPending('')
      return
    }

    onChange([...selectedIds.map(String), String(courseId)])
    setPending('')
  }

  const removeCourse = (courseId) => {
    onChange(selectedIds.filter((id) => String(id) !== String(courseId)))
  }

  return (
    <div className='form-field border p-3' style={panelRadius}>
      <div className='mb-3 flex flex-wrap gap-2'>
        {selectedCourses.length === 0 ? (
          <div className='flex w-full items-center gap-3 px-1 py-2'>
            <span
              className='grid size-9 shrink-0 place-items-center border border-gray-200/70 bg-gray-50 text-[#20509b] dark:border-white/10 dark:bg-[#152238] dark:text-blue-300'
              style={chipRadius}
            >
              <Sparkles className='size-3.5' strokeWidth={2} />
            </span>
            <p className='text-[12px] text-gray-400'>
              No courses selected — pick courses below.
            </p>
          </div>
        ) : (
          selectedCourses.map((course) => {
            const id = String(getCourseId(course))
            return (
              <span
                key={id}
                className='inline-flex max-w-full items-center gap-1.5 brand-gradient px-2.5 py-1.5 text-[12px] font-semibold text-white shadow-[0_8px_16px_rgba(32,80,155,0.22)]'
                style={chipRadius}
              >
                <span className='truncate'>
                  {course.courseName}
                  {course.courseCode ? (
                    <span className='font-medium text-white/75'>
                      {' '}
                      · {course.courseCode}
                    </span>
                  ) : null}
                </span>
                <button
                  type='button'
                  onClick={() => removeCourse(id)}
                  className='grid size-4 place-items-center rounded-sm text-white/80 transition-colors hover:bg-white/15 hover:text-white'
                  aria-label={`Remove ${course.courseName}`}
                >
                  <X className='size-3' strokeWidth={2.5} />
                </button>
              </span>
            )
          })
        )}
      </div>

      <Select
        id={selectId}
        name='courseToAdd'
        label='Add course'
        placeholder={loading ? 'Loading courses…' : 'Select a course to add'}
        icon={BookOpen}
        value={pending}
        onChange={handleSelect}
        options={availableOptions}
        disabled={loading || availableOptions.length <= 1}
        emptyMessage='No more courses available'
        searchable
      />
      <p className='mt-2 text-[11px] text-gray-400'>
        Select existing courses to assign to this class. You can add more than
        one.
      </p>
    </div>
  )
}

export default CoursePicker

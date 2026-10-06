import React, { useMemo, useState } from 'react'
import { School, Sparkles, X } from 'lucide-react'
import Select from '../../../components/Select'

const panelRadius = { borderRadius: '1.35rem 0.45rem 1.35rem 0.45rem' }
const chipRadius = { borderRadius: '1rem 0.3rem 1rem 0.3rem' }

const getClassId = (classItem) =>
  typeof classItem === 'string' ? classItem : classItem?._id || classItem?.id || ''

const ClassPicker = ({
  selectedIds = [],
  catalog = [],
  onChange,
  loading = false,
  selectId = 'teacher-class-select',
}) => {
  const [pending, setPending] = useState('')

  const catalogById = useMemo(() => {
    const map = new Map()
    catalog.forEach((classItem) => {
      const id = getClassId(classItem)
      if (id) map.set(String(id), classItem)
    })
    return map
  }, [catalog])

  const selectedClasses = useMemo(
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
        label: loading ? 'Loading classes…' : 'Select a class to add',
        description: loading ? 'Please wait' : 'Choose from active classes',
      },
      ...catalog
        .filter((classItem) => !selected.has(String(getClassId(classItem))))
        .map((classItem) => {
          const id = String(getClassId(classItem))
          const description = [
            classItem.classCode,
            classItem.grade != null ? `Grade ${classItem.grade}` : null,
            classItem.academicYear,
          ]
            .filter(Boolean)
            .join(' · ')

          return {
            value: id,
            label: classItem.className || 'Untitled class',
            description: description || 'Active class',
          }
        }),
    ]
  }, [catalog, selectedIds, loading])

  const handleSelect = (event) => {
    const classId = event.target.value
    if (!classId) return

    const alreadySelected = selectedIds.some(
      (id) => String(id) === String(classId),
    )
    if (alreadySelected) {
      setPending('')
      return
    }

    onChange([...selectedIds.map(String), String(classId)])
    setPending('')
  }

  const removeClass = (classId) => {
    onChange(selectedIds.filter((id) => String(id) !== String(classId)))
  }

  return (
    <div className='form-field border p-3' style={panelRadius}>
      <div className='mb-3 flex flex-wrap gap-2'>
        {selectedClasses.length === 0 ? (
          <div className='flex w-full items-center gap-3 px-1 py-2'>
            <span
              className='grid size-9 shrink-0 place-items-center border border-gray-200/70 bg-gray-50 text-[#20509b] dark:border-white/10 dark:bg-[#152238] dark:text-blue-300'
              style={chipRadius}
            >
              <Sparkles className='size-3.5' strokeWidth={2} />
            </span>
            <p className='text-[12px] text-gray-400'>
              No classes selected — assign at least one class below.
            </p>
          </div>
        ) : (
          selectedClasses.map((classItem) => {
            const id = String(getClassId(classItem))
            return (
              <span
                key={id}
                className='inline-flex max-w-full items-center gap-1.5 brand-gradient px-2.5 py-1.5 text-[12px] font-semibold text-white shadow-[0_8px_16px_rgba(32,80,155,0.22)]'
                style={chipRadius}
              >
                <span className='truncate'>
                  {classItem.className}
                  {classItem.classCode ? (
                    <span className='font-medium text-white/75'>
                      {' '}
                      · {classItem.classCode}
                    </span>
                  ) : null}
                </span>
                <button
                  type='button'
                  onClick={() => removeClass(id)}
                  className='grid size-4 place-items-center rounded-sm text-white/80 transition-colors hover:bg-white/15 hover:text-white'
                  aria-label={`Remove ${classItem.className}`}
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
        name='classToAdd'
        label='Add class'
        placeholder={loading ? 'Loading classes…' : 'Select a class to add'}
        icon={School}
        value={pending}
        onChange={handleSelect}
        options={availableOptions}
        disabled={loading || availableOptions.length <= 1}
        emptyMessage='No more classes available'
        searchable
      />
      <p className='mt-2 text-[11px] text-gray-400'>
        Assign at least one class to this teacher. You can add more than one.
      </p>
    </div>
  )
}

export default ClassPicker

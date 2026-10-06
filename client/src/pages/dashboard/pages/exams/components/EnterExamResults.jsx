import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Save } from 'lucide-react'
import useModal from '../../../../../hooks/useModal'
import { saveExamResults } from '../../../../../lib/exam.requests'
import Button from '../../../../../components/Button'

const panelRadius = { borderRadius: '1.35rem 0.45rem 1.35rem 0.45rem' }
const fieldRadius = { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }

const initialsFromName = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

const EnterExamResults = ({ exam, results = [], onSuccess }) => {
  const { close } = useModal()
  const totalMarks = Number(exam?.totalMarks) || 0

  const [rows, setRows] = useState(() =>
    results.map((row) => ({
      studentId: row.studentId,
      name: row.name,
      photo: row.photo,
      isAbsent: Boolean(row.isAbsent),
      marksObtained:
        row.hasResult && !row.isAbsent && row.marksObtained != null
          ? String(row.marksObtained)
          : '',
      remarks: row.remarks || '',
    })),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setRows(
      results.map((row) => ({
        studentId: row.studentId,
        name: row.name,
        photo: row.photo,
        isAbsent: Boolean(row.isAbsent),
        marksObtained:
          row.hasResult && !row.isAbsent && row.marksObtained != null
            ? String(row.marksObtained)
            : '',
        remarks: row.remarks || '',
      })),
    )
  }, [results])

  const filledCount = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.isAbsent ||
          (row.marksObtained !== '' && Number.isFinite(Number(row.marksObtained))),
      ).length,
    [rows],
  )

  const updateRow = (studentId, patch) => {
    setRows((prev) =>
      prev.map((row) =>
        row.studentId === studentId ? { ...row, ...patch } : row,
      ),
    )
    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = []
    for (const row of rows) {
      if (row.isAbsent) {
        payload.push({
          studentId: row.studentId,
          isAbsent: true,
          marksObtained: 0,
          remarks: row.remarks.trim(),
        })
        continue
      }

      if (row.marksObtained === '') {
        // Skip blank rows — only save entered scores
        continue
      }

      const marks = Number(row.marksObtained)
      if (!Number.isFinite(marks) || marks < 0) {
        setError(`Enter a valid score for ${row.name}.`)
        return
      }
      if (marks > totalMarks) {
        setError(`${row.name}'s score cannot exceed ${totalMarks}.`)
        return
      }

      payload.push({
        studentId: row.studentId,
        isAbsent: false,
        marksObtained: marks,
        remarks: row.remarks.trim(),
      })
    }

    if (payload.length === 0) {
      setError('Enter at least one score before saving.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Merge with existing saved results for students not in this payload
      const existingById = new Map(
        results
          .filter((row) => row.hasResult)
          .map((row) => [
            row.studentId,
            {
              studentId: row.studentId,
              isAbsent: row.isAbsent,
              marksObtained: row.isAbsent ? 0 : row.marksObtained,
              grade: row.grade || '',
              remarks: row.remarks || '',
            },
          ]),
      )

      for (const item of payload) {
        existingById.set(item.studentId, item)
      }

      const data = await saveExamResults(exam.id || exam._id, [
        ...existingById.values(),
      ])
      onSuccess?.(data)
      close()
    } catch (err) {
      setError(err.message || 'Failed to save results.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (rows.length === 0) {
    return (
      <div className='py-8 text-center text-[13px] text-gray-500 dark:text-gray-400'>
        No students are in this class yet.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      {error ? (
        <div
          role='alert'
          className='border border-red-200/80 bg-red-50 px-3.5 py-3 text-[13px] text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300'
          style={panelRadius}
        >
          <div className='flex items-start gap-2'>
            <AlertCircle className='mt-0.5 size-4 shrink-0' strokeWidth={2} />
            <p>{error}</p>
          </div>
        </div>
      ) : null}

      <p className='text-[12px] text-gray-500 dark:text-gray-400'>
        Total marks: <span className='font-semibold text-gray-800 dark:text-gray-200'>{totalMarks}</span>
        {' · '}
        Entered {filledCount}/{rows.length}
      </p>

      <ul className='max-h-[50vh] space-y-2 overflow-y-auto pr-1'>
        {rows.map((row) => (
          <li
            key={row.studentId}
            className='border border-gray-100 bg-gray-50/80 p-3 dark:border-white/10 dark:bg-white/[0.03]'
            style={fieldRadius}
          >
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
              <div className='flex min-w-0 flex-1 items-center gap-3'>
                <span
                  className='size-9 shrink-0 overflow-hidden bg-blue-100 text-[11px] font-semibold text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                  style={chipRadius}
                >
                  {row.photo ? (
                    <img
                      src={row.photo}
                      alt=''
                      className='!h-full !w-full object-cover'
                    />
                  ) : (
                    <span className='grid !h-full !w-full place-items-center'>
                      {initialsFromName(row.name)}
                    </span>
                  )}
                </span>
                <span className='min-w-0 truncate text-[13px] font-semibold text-gray-900 dark:text-white'>
                  {row.name}
                </span>
              </div>

              <div className='flex flex-wrap items-center gap-2'>
                <label className='inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400'>
                  <input
                    type='checkbox'
                    checked={row.isAbsent}
                    onChange={(event) =>
                      updateRow(row.studentId, {
                        isAbsent: event.target.checked,
                        marksObtained: event.target.checked
                          ? ''
                          : row.marksObtained,
                      })
                    }
                    disabled={isSubmitting}
                    className='size-3.5 rounded border-gray-300'
                  />
                  Absent
                </label>

                <input
                  type='number'
                  min='0'
                  max={totalMarks}
                  step='0.5'
                  value={row.marksObtained}
                  onChange={(event) =>
                    updateRow(row.studentId, {
                      marksObtained: event.target.value,
                      isAbsent: false,
                    })
                  }
                  disabled={isSubmitting || row.isAbsent}
                  placeholder='Score'
                  className='h-9 w-24 border-0 bg-white px-2.5 text-[13px] font-semibold text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:bg-[#0c1528] dark:text-white'
                  style={chipRadius}
                />
              </div>
            </div>

            <input
              type='text'
              value={row.remarks}
              onChange={(event) =>
                updateRow(row.studentId, { remarks: event.target.value })
              }
              disabled={isSubmitting}
              placeholder='Optional remark'
              maxLength={500}
              className='mt-2 h-8 w-full border-0 bg-white/80 px-2.5 text-[12px] text-gray-700 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 dark:bg-[#0c1528] dark:text-gray-200'
              style={chipRadius}
            />
          </li>
        ))}
      </ul>

      <div className='flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-4 dark:border-white/10'>
        <Button
          type='button'
          variant='secondary'
          size='sm'
          onClick={close}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type='submit' variant='primary' size='sm' disabled={isSubmitting}>
          <Save className='size-3.5' strokeWidth={2} />
          {isSubmitting ? 'Saving…' : 'Save scores'}
        </Button>
      </div>
    </form>
  )
}

export default EnterExamResults

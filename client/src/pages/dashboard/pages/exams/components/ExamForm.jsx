import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  BookOpen,
  Clock,
  FileText,
  GraduationCap,
  Hash,
  MapPin,
  Save,
  Type,
} from 'lucide-react'
import useModal from '../../../../../hooks/useModal'
import {
  EXAM_STATUS_OPTIONS,
  EXAM_TYPE_OPTIONS,
} from '../../../../../lib/exam.requests'
import { getTeacherClasses } from '../../../../../lib/teacher.requests'
import Button from '../../../../../components/Button'
import DatePicker from '../../../components/DatePicker'
import IconInput from '../../../components/IconInput'
import Select from '../../../components/Select'

const DESCRIPTION_MAX = 500
const INSTRUCTIONS_MAX = 5000

const panelRadius = { borderRadius: '1.35rem 0.45rem 1.35rem 0.45rem' }
const textareaRadius = { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }
const fieldRadius = { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }

const pad = (value) => String(value).padStart(2, '0')

const parseTimeToMinutes = (value) => {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(String(value || '').trim())
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

export const emptyExamForm = {
  title: '',
  courseId: '',
  classId: '',
  examType: 'midterm',
  examDate: '',
  startTime: '09:00',
  endTime: '11:00',
  duration: '120',
  venue: '',
  totalMarks: '100',
  passingMarks: '40',
  status: 'scheduled',
  description: '',
  instructions: '',
}

export const examToFormValues = (exam) => {
  if (!exam) return { ...emptyExamForm }

  const date = exam.examDate ? new Date(exam.examDate) : null
  const validDate = date && !Number.isNaN(date.getTime())

  return {
    title: exam.title || '',
    courseId: '',
    classId: String(
      exam.classId || exam.class?._id || exam.class || '',
    ),
    examType: exam.examType || 'midterm',
    examDate: validDate
      ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
      : '',
    startTime: exam.startTime || '09:00',
    endTime: exam.endTime || '11:00',
    duration: String(exam.duration || 120),
    venue: exam.venue || '',
    totalMarks: String(exam.totalMarks ?? 100),
    passingMarks: String(exam.passingMarks ?? 40),
    status: exam.status || 'scheduled',
    description: exam.description || '',
    instructions: exam.instructions || '',
    _subject: exam.subject || '',
  }
}

export const buildExamPayload = (form, courseOptions = []) => {
  const selectedCourse = courseOptions.find(
    (course) => String(course.value) === String(form.courseId),
  )

  return {
    title: form.title.trim(),
    course: form.courseId || undefined,
    subject: selectedCourse?.label || form._subject || undefined,
    class: form.classId,
    examType: form.examType,
    examDate: new Date(`${form.examDate}T12:00:00`).toISOString(),
    startTime: form.startTime,
    endTime: form.endTime,
    duration: Math.round(Number(form.duration)),
    venue: form.venue.trim(),
    totalMarks: Math.round(Number(form.totalMarks)),
    passingMarks: Math.round(Number(form.passingMarks)),
    status: form.status,
    description: form.description.trim().slice(0, DESCRIPTION_MAX),
    instructions: form.instructions.trim().slice(0, INSTRUCTIONS_MAX),
  }
}

const Field = ({
  label,
  id,
  children,
  className = '',
  counter,
  counterDanger = false,
}) => (
  <div className={`min-w-0 ${className}`}>
    <div className='mb-1.5 flex items-baseline justify-between gap-3'>
      <label
        htmlFor={id}
        className='block text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-gray-400'
      >
        {label}
      </label>
      {counter != null ? (
        <span
          className={`shrink-0 text-[11px] font-medium tabular-nums ${
            counterDanger
              ? 'text-red-500 dark:text-red-400'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {counter}
        </span>
      ) : null}
    </div>
    {children}
  </div>
)

const FormError = ({ message }) => {
  if (!message) return null

  return (
    <div
      role='alert'
      className='border border-red-200/80 bg-red-50 px-3.5 py-3 text-[13px] text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300'
      style={panelRadius}
    >
      <div className='flex items-start gap-2'>
        <AlertCircle className='mt-0.5 size-4 shrink-0' strokeWidth={2} />
        <p>{message}</p>
      </div>
    </div>
  )
}

const ExamForm = ({
  initialValues = emptyExamForm,
  submitLabel = 'Save exam',
  submitIcon: SubmitIcon = Save,
  onSubmit,
}) => {
  const { close } = useModal()
  const [form, setForm] = useState(initialValues)
  const [classes, setClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(initialValues)
  }, [initialValues])

  useEffect(() => {
    let cancelled = false

    const loadClasses = async () => {
      setLoadingClasses(true)
      try {
        const data = await getTeacherClasses()
        if (cancelled) return
        setClasses(data.classes || [])
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load your classes.')
        }
      } finally {
        if (!cancelled) setLoadingClasses(false)
      }
    }

    loadClasses()

    return () => {
      cancelled = true
    }
  }, [])

  const classOptions = useMemo(
    () =>
      classes.map((classItem) => ({
        value: String(classItem._id || classItem.id),
        label: classItem.className || classItem.name || 'Untitled class',
        description: classItem.classCode || undefined,
      })),
    [classes],
  )

  const courseOptions = useMemo(() => {
    const selectedClass = classes.find(
      (classItem) => String(classItem._id || classItem.id) === form.classId,
    )
    const courses = (selectedClass?.courses || []).filter(
      (course) =>
        course &&
        (course.courseStatus == null || course.courseStatus === 'Active'),
    )

    return courses.map((course) => ({
      value: String(course._id || course.id),
      label: course.courseName || 'Untitled course',
      description: course.courseCode || undefined,
    }))
  }, [classes, form.classId])

  // When editing, try to match existing subject to a course once classes load
  useEffect(() => {
    if (!form.classId || form.courseId || !form._subject) return
    const match = courseOptions.find(
      (course) =>
        course.label.toLowerCase() === String(form._subject).toLowerCase(),
    )
    if (match) {
      setForm((prev) => ({ ...prev, courseId: match.value }))
    }
  }, [form.classId, form.courseId, form._subject, courseOptions])

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((prev) => {
      if (name === 'classId') {
        return { ...prev, classId: value, courseId: '' }
      }

      if (name === 'startTime' || name === 'endTime') {
        const next = { ...prev, [name]: value }
        const start = parseTimeToMinutes(
          name === 'startTime' ? value : prev.startTime,
        )
        const end = parseTimeToMinutes(
          name === 'endTime' ? value : prev.endTime,
        )
        if (start != null && end != null && end > start) {
          next.duration = String(end - start)
        }
        return next
      }

      return { ...prev, [name]: value }
    })

    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('Please enter an exam title.')
      return
    }
    if (!form.classId) {
      setError('Please select a class.')
      return
    }
    if (!form.courseId && !form._subject) {
      setError('Please select a subject / course.')
      return
    }
    if (!form.examDate) {
      setError('Please choose an exam date.')
      return
    }
    if (!form.startTime || !form.endTime) {
      setError('Please set start and end times.')
      return
    }

    const start = parseTimeToMinutes(form.startTime)
    const end = parseTimeToMinutes(form.endTime)
    if (start == null || end == null) {
      setError('Times must use HH:MM format.')
      return
    }
    if (end <= start) {
      setError('End time must be after start time.')
      return
    }

    const total = Number(form.totalMarks)
    const passing = Number(form.passingMarks)
    if (!Number.isFinite(total) || total < 0) {
      setError('Total marks must be a valid number.')
      return
    }
    if (!Number.isFinite(passing) || passing < 0) {
      setError('Passing marks must be a valid number.')
      return
    }
    if (passing > total) {
      setError('Passing marks cannot exceed total marks.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSubmit?.(buildExamPayload(form, courseOptions))
      close()
    } catch (err) {
      setError(err.message || 'Failed to save exam.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      <FormError message={error} />

      <Field label='Title' id='exam-title'>
        <IconInput
          id='exam-title'
          name='title'
          value={form.title}
          onChange={handleChange}
          placeholder='e.g. Mid-term Mathematics'
          icon={Type}
          maxLength={100}
          required
          disabled={isSubmitting}
        />
      </Field>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <Field label='Class' id='exam-class'>
          <Select
            id='exam-class'
            name='classId'
            value={form.classId}
            onChange={handleChange}
            options={classOptions}
            placeholder={loadingClasses ? 'Loading classes…' : 'Select class'}
            icon={GraduationCap}
            label='Class'
            searchable={classOptions.length > 6}
            disabled={
              isSubmitting || loadingClasses || classOptions.length === 0
            }
            emptyMessage='No classes assigned'
          />
        </Field>

        <Field label='Subject / Course' id='exam-course'>
          <Select
            id='exam-course'
            name='courseId'
            value={form.courseId}
            onChange={handleChange}
            options={courseOptions}
            placeholder={
              !form.classId
                ? 'Select a class first'
                : courseOptions.length === 0
                  ? 'No courses for this class'
                  : 'Select subject / course'
            }
            icon={BookOpen}
            label='Subject / Course'
            searchable={courseOptions.length > 6}
            disabled={
              isSubmitting || !form.classId || courseOptions.length === 0
            }
            emptyMessage='No courses assigned to this class'
          />
        </Field>
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <Field label='Exam type' id='exam-type'>
          <Select
            id='exam-type'
            name='examType'
            value={form.examType}
            onChange={handleChange}
            options={EXAM_TYPE_OPTIONS}
            icon={FileText}
            label='Exam type'
            disabled={isSubmitting}
          />
        </Field>

        <Field label='Status' id='exam-status'>
          <Select
            id='exam-status'
            name='status'
            value={form.status}
            onChange={handleChange}
            options={EXAM_STATUS_OPTIONS}
            icon={FileText}
            label='Status'
            disabled={isSubmitting}
          />
        </Field>
      </div>

      <Field label='Exam date' id='exam-date'>
        <DatePicker
          id='exam-date'
          name='examDate'
          value={form.examDate}
          onChange={handleChange}
          label='Exam date'
          placeholder='Select exam date'
        />
      </Field>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <Field label='Start time' id='exam-start'>
          <IconInput
            id='exam-start'
            name='startTime'
            type='time'
            value={form.startTime}
            onChange={handleChange}
            icon={Clock}
            required
            disabled={isSubmitting}
          />
        </Field>

        <Field label='End time' id='exam-end'>
          <IconInput
            id='exam-end'
            name='endTime'
            type='time'
            value={form.endTime}
            onChange={handleChange}
            icon={Clock}
            required
            disabled={isSubmitting}
          />
        </Field>

        <Field label='Duration (min)' id='exam-duration'>
          <IconInput
            id='exam-duration'
            name='duration'
            type='number'
            min='1'
            max='600'
            value={form.duration}
            onChange={handleChange}
            icon={Clock}
            required
            disabled={isSubmitting}
          />
        </Field>
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <Field label='Venue' id='exam-venue' className='sm:col-span-1'>
          <IconInput
            id='exam-venue'
            name='venue'
            value={form.venue}
            onChange={handleChange}
            placeholder='e.g. Room 12'
            icon={MapPin}
            maxLength={120}
            disabled={isSubmitting}
          />
        </Field>

        <Field label='Total marks' id='exam-total'>
          <IconInput
            id='exam-total'
            name='totalMarks'
            type='number'
            min='0'
            value={form.totalMarks}
            onChange={handleChange}
            icon={Hash}
            required
            disabled={isSubmitting}
          />
        </Field>

        <Field label='Passing marks' id='exam-pass'>
          <IconInput
            id='exam-pass'
            name='passingMarks'
            type='number'
            min='0'
            value={form.passingMarks}
            onChange={handleChange}
            icon={Hash}
            required
            disabled={isSubmitting}
          />
        </Field>
      </div>

      <Field
        label='Description'
        id='exam-description'
        counter={`${form.description.length}/${DESCRIPTION_MAX}`}
        counterDanger={form.description.length > DESCRIPTION_MAX}
      >
        <textarea
          id='exam-description'
          name='description'
          value={form.description}
          onChange={handleChange}
          rows={2}
          maxLength={DESCRIPTION_MAX}
          placeholder='Optional short summary of the exam…'
          disabled={isSubmitting}
          className='w-full resize-y border-0 bg-gray-50 px-3.5 py-3 text-[13px] text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-3 focus:ring-blue-500/20 dark:bg-white/5 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:bg-[#152238]'
          style={textareaRadius}
        />
      </Field>

      <Field
        label='Instructions'
        id='exam-instructions'
        counter={`${form.instructions.length}/${INSTRUCTIONS_MAX}`}
        counterDanger={form.instructions.length > INSTRUCTIONS_MAX}
      >
        <textarea
          id='exam-instructions'
          name='instructions'
          value={form.instructions}
          onChange={handleChange}
          rows={4}
          maxLength={INSTRUCTIONS_MAX}
          placeholder='What students should bring, rules, sections to attempt…'
          disabled={isSubmitting}
          className='w-full resize-y border-0 bg-gray-50 px-3.5 py-3 text-[13px] text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-3 focus:ring-blue-500/20 dark:bg-white/5 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:bg-[#152238]'
          style={textareaRadius}
        />
      </Field>

      <div
        className='flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-4 dark:border-white/10'
        style={fieldRadius}
      >
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
          <SubmitIcon className='size-3.5' strokeWidth={2} />
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default ExamForm

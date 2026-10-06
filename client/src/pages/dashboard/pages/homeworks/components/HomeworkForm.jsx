import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  BookOpen,
  FileText,
  GraduationCap,
  Paperclip,
  Save,
  Type,
  X,
} from 'lucide-react'
import useModal from '../../../../../hooks/useModal'
import { getMaterialFileName } from '../../../../../lib/homework.requests'
import { getTeacherClasses } from '../../../../../lib/teacher.requests'
import Button from '../../../../../components/Button'
import DatePicker from '../../../components/DatePicker'
import IconInput from '../../../components/IconInput'
import Select from '../../../components/Select'

const INSTRUCTIONS_MAX = 5000
const MAX_MATERIALS = 10

const MATERIALS_ACCEPT = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.txt',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
].join(',')

const panelRadius = { borderRadius: '1.35rem 0.45rem 1.35rem 0.45rem' }
const textareaRadius = { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }
const fieldRadius = { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }
const chipRadius = { borderRadius: '0.85rem 0.3rem 0.85rem 0.3rem' }

const pad = (value) => String(value).padStart(2, '0')

export const emptyHomeworkForm = {
  title: '',
  courseId: '',
  classId: '',
  dueDate: '',
  existingMaterials: [],
  materialFiles: [],
  instructions: '',
}

export const homeworkToFormValues = (homework) => {
  if (!homework) return { ...emptyHomeworkForm }

  const due = homework.dueDate ? new Date(homework.dueDate) : null
  const validDate = due && !Number.isNaN(due.getTime())

  return {
    title: homework.title || '',
    courseId: String(
      homework.courseId || homework.course?._id || homework.course || '',
    ),
    classId: String(
      homework.class?._id || homework.class || homework.classId || '',
    ),
    dueDate: validDate
      ? `${due.getFullYear()}-${pad(due.getMonth() + 1)}-${pad(due.getDate())}`
      : '',
    existingMaterials: Array.isArray(homework.materials)
      ? homework.materials.filter(Boolean)
      : [],
    materialFiles: [],
    instructions: homework.instructions || '',
  }
}

export const buildHomeworkPayload = (form) => ({
  title: form.title.trim(),
  course: form.courseId,
  class: form.classId,
  dueDate: new Date(`${form.dueDate}T23:59:59`).toISOString(),
  existingMaterials: form.existingMaterials || [],
  materials: form.materialFiles || [],
  instructions: form.instructions.trim().slice(0, INSTRUCTIONS_MAX),
})

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

const HomeworkForm = ({
  initialValues = emptyHomeworkForm,
  submitLabel = 'Save homework',
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

  const materialCount =
    (form.existingMaterials?.length || 0) + (form.materialFiles?.length || 0)

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((prev) => {
      if (name === 'classId') {
        return { ...prev, classId: value, courseId: '' }
      }
      return { ...prev, [name]: value }
    })

    if (error) setError('')
  }

  const handleMaterialsChange = (event) => {
    const picked = Array.from(event.target.files || [])
    if (!picked.length) return

    setForm((prev) => {
      const remaining =
        MAX_MATERIALS -
        (prev.existingMaterials?.length || 0) -
        (prev.materialFiles?.length || 0)

      if (remaining <= 0) return prev

      return {
        ...prev,
        materialFiles: [
          ...(prev.materialFiles || []),
          ...picked.slice(0, remaining),
        ],
      }
    })

    event.target.value = ''
    if (error) setError('')
  }

  const removeExistingMaterial = (url) => {
    setForm((prev) => ({
      ...prev,
      existingMaterials: (prev.existingMaterials || []).filter(
        (item) => item !== url,
      ),
    }))
    if (error) setError('')
  }

  const removeMaterialFile = (index) => {
    setForm((prev) => ({
      ...prev,
      materialFiles: (prev.materialFiles || []).filter((_, i) => i !== index),
    }))
    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('Please enter a homework title.')
      return
    }
    if (!form.classId) {
      setError('Please select a class.')
      return
    }
    if (!form.courseId) {
      setError('Please select a subject / course.')
      return
    }
    if (!form.dueDate) {
      setError('Please choose a due date.')
      return
    }

    if (materialCount > MAX_MATERIALS) {
      setError(`You can attach up to ${MAX_MATERIALS} files.`)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSubmit?.(buildHomeworkPayload(form))
      close()
    } catch (err) {
      setError(err.message || 'Failed to save homework.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      <FormError message={error} />

      <Field label='Title' id='homework-title'>
        <IconInput
          id='homework-title'
          name='title'
          value={form.title}
          onChange={handleChange}
          placeholder='e.g. Chapter 4 practice questions'
          icon={Type}
          maxLength={100}
          required
          disabled={isSubmitting}
        />
      </Field>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <Field label='Class' id='homework-class'>
          <Select
            id='homework-class'
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

        <Field label='Subject / Course' id='homework-course'>
          <Select
            id='homework-course'
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

      <Field label='Due date' id='homework-due-date'>
        <DatePicker
          id='homework-due-date'
          name='dueDate'
          value={form.dueDate}
          onChange={handleChange}
          label='Due date'
          placeholder='Select due date'
        />
      </Field>

      <Field
        label='Instructions'
        id='homework-instructions'
        counter={`${form.instructions.length} / ${INSTRUCTIONS_MAX}`}
        counterDanger={form.instructions.length >= INSTRUCTIONS_MAX}
      >
        <textarea
          id='homework-instructions'
          name='instructions'
          maxLength={INSTRUCTIONS_MAX}
          rows={4}
          value={form.instructions}
          onChange={handleChange}
          placeholder='What should students do? Include page numbers, questions, or links…'
          disabled={isSubmitting}
          className='form-field w-full resize-y px-3.5 py-3 text-[13px] font-semibold text-gray-900 placeholder:font-normal placeholder:text-gray-400 disabled:opacity-50 dark:text-gray-100'
          style={textareaRadius}
        />
      </Field>

      <Field
        label='Attachments'
        id='homework-materials'
        counter={`${materialCount} / ${MAX_MATERIALS}`}
        counterDanger={materialCount >= MAX_MATERIALS}
      >
        <div className='space-y-2'>
          <label
            htmlFor='homework-materials'
            className={`form-field flex h-11 w-full items-center gap-3 px-3.5 ${
              isSubmitting || materialCount >= MAX_MATERIALS
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer'
            }`}
            style={fieldRadius}
          >
            <span
              className='brand-gradient grid size-8 shrink-0 place-items-center text-white shadow-[0_8px_18px_rgba(32,80,155,0.28)]'
              style={chipRadius}
            >
              <Paperclip className='size-3.5' strokeWidth={2} />
            </span>
            <span className='min-w-0 flex-1 truncate text-[13px] font-normal text-gray-400'>
              Attach worksheets or files (optional)
            </span>
            <input
              id='homework-materials'
              name='materials'
              type='file'
              accept={MATERIALS_ACCEPT}
              multiple
              className='sr-only'
              onChange={handleMaterialsChange}
              disabled={isSubmitting || materialCount >= MAX_MATERIALS}
            />
          </label>

          {materialCount > 0 ? (
            <ul className='space-y-1.5'>
              {(form.existingMaterials || []).map((url) => (
                <li
                  key={url}
                  className='form-field flex items-center gap-2 px-3 py-2'
                  style={fieldRadius}
                >
                  <FileText
                    className='size-3.5 shrink-0 text-gray-400'
                    strokeWidth={1.75}
                  />
                  <a
                    href={url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='min-w-0 flex-1 truncate text-[13px] font-semibold text-gray-800 hover:underline dark:text-gray-100'
                  >
                    {getMaterialFileName(url)}
                  </a>
                  <button
                    type='button'
                    onClick={() => removeExistingMaterial(url)}
                    disabled={isSubmitting}
                    className='grid size-7 shrink-0 place-items-center text-gray-400 transition-colors hover:text-red-500 disabled:opacity-50'
                    aria-label={`Remove ${getMaterialFileName(url)}`}
                  >
                    <X className='size-3.5' strokeWidth={2} />
                  </button>
                </li>
              ))}
              {(form.materialFiles || []).map((file, index) => (
                <li
                  key={`${file.name}-${file.size}-${index}`}
                  className='form-field flex items-center gap-2 px-3 py-2'
                  style={fieldRadius}
                >
                  <FileText
                    className='size-3.5 shrink-0 text-gray-400'
                    strokeWidth={1.75}
                  />
                  <span className='min-w-0 flex-1 truncate text-[13px] font-semibold text-gray-800 dark:text-gray-100'>
                    {file.name}
                  </span>
                  <button
                    type='button'
                    onClick={() => removeMaterialFile(index)}
                    disabled={isSubmitting}
                    className='grid size-7 shrink-0 place-items-center text-gray-400 transition-colors hover:text-red-500 disabled:opacity-50'
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className='size-3.5' strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Field>

      <div className='flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end dark:border-white/8'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={close}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type='submit'
          variant='primary'
          size='sm'
          loading={isSubmitting}
          disabled={isSubmitting || loadingClasses}
        >
          <SubmitIcon className='size-3.5' strokeWidth={2} />
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default HomeworkForm

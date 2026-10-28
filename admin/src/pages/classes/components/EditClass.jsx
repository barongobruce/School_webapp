import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarRange,
  Camera,
  GraduationCap,
  Hash,
  ImageIcon,
  Layers3,
  X,
} from 'lucide-react'
import useModal from '../../../hooks/useModal'
import Button from '../../../components/Button'
import IconInput from '../../../components/IconInput'
import { updateClass } from '../../../lib/class.requests'
import { getCourses } from '../../../lib/course.requests'
import CoursePicker from './CoursePicker'

const panelRadius = { borderRadius: '1.35rem 0.45rem 1.35rem 0.45rem' }
const chipRadius = { borderRadius: '1rem 0.3rem 1rem 0.3rem' }

const labelClass =
  'mb-1.5 block text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-gray-400'

const STEPS = [
  { id: 'identity', label: 'Identity', icon: GraduationCap },
  { id: 'academics', label: 'Academics', icon: CalendarRange },
  { id: 'courses', label: 'Courses', icon: BookOpen },
]

const DESCRIPTION_MAX = 500

const Field = ({
  label,
  id,
  children,
  className = '',
  hint,
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
    {hint ? (
      <p className='mt-1.5 text-[12px] text-gray-500 dark:text-gray-400'>{hint}</p>
    ) : null}
  </div>
)

const FormError = ({ message, onDismiss }) => (
  <div
    role='alert'
    className='form-error relative mb-4 overflow-hidden border border-red-200/80 bg-gradient-to-br from-red-50 via-white to-orange-50/60 dark:border-red-500/25 dark:from-red-950/50 dark:via-[#0c1528] dark:to-orange-950/20'
    style={panelRadius}
  >
    <div
      className='absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-red-500 via-red-400 to-orange-400'
      aria-hidden
    />
    <div className='flex items-start gap-3 px-3.5 py-3 pl-4 sm:px-4 sm:pl-5'>
      <span
        className='mt-0.5 grid size-9 shrink-0 place-items-center bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-[0_10px_22px_rgba(220,38,38,0.28)]'
        style={chipRadius}
      >
        <AlertCircle className='size-4' strokeWidth={2.25} />
      </span>
      <div className='min-w-0 flex-1 pt-0.5'>
        <p className='text-[11px] font-semibold tracking-[0.12em] text-red-500 uppercase dark:text-red-300'>
          Needs attention
        </p>
        <p className='mt-1 text-[13px] leading-relaxed font-medium text-red-800 dark:text-red-100'>
          {message}
        </p>
      </div>
      {onDismiss ? (
        <button
          type='button'
          onClick={onDismiss}
          aria-label='Dismiss error'
          className='grid size-8 shrink-0 place-items-center text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-500/15 dark:hover:text-red-200'
          style={chipRadius}
        >
          <X className='size-3.5' strokeWidth={2.25} />
        </button>
      ) : null}
    </div>
  </div>
)

const StatusToggle = ({ value, onChange }) => (
  <div>
    <p className={labelClass}>Status</p>
    <div className='grid grid-cols-2 gap-2'>
      {[
        { value: true, label: 'Active' },
        { value: false, label: 'Inactive' },
      ].map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.label}
            type='button'
            onClick={() => onChange(option.value)}
            className={`h-11 text-[12px] font-semibold transition-all duration-200 ${
              selected
                ? 'brand-gradient text-white shadow-[0_10px_24px_rgba(32,80,155,0.28)]'
                : 'form-field border text-gray-600 dark:text-gray-300'
            }`}
            style={chipRadius}
            aria-pressed={selected}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  </div>
)

const ProgressRail = ({ step, onJump }) => (
  <nav aria-label='Edit class steps' className='mb-6 min-w-0 overflow-hidden'>
    <ol className='relative flex items-start justify-between gap-1'>
      <div
        className='absolute top-[15px] right-4 left-4 h-[2px] bg-gray-100 dark:bg-white/8'
        aria-hidden
      />
      <div
        className='absolute top-[15px] left-4 h-[2px] brand-gradient transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]'
        style={{
          width:
            step === 0
              ? '0px'
              : `calc(${(step / (STEPS.length - 1)) * 100}% - 2rem)`,
          maxWidth: 'calc(100% - 2rem)',
        }}
        aria-hidden
      />
      {STEPS.map((item, index) => {
        const Icon = item.icon
        const done = index < step
        const active = index === step
        return (
          <li
            key={item.id}
            className='relative z-10 flex min-w-0 flex-1 flex-col items-center'
          >
            <button
              type='button'
              onClick={() => onJump(index)}
              className={`grid size-8 cursor-pointer place-items-center transition-all duration-300 hover:brightness-110 ${
                active || done
                  ? 'brand-gradient text-white shadow-[0_8px_20px_rgba(32,80,155,0.35)]'
                  : 'border border-gray-200/80 bg-white text-gray-400 dark:border-white/10 dark:bg-[#0c1528] dark:text-gray-500'
              }`}
              style={chipRadius}
              aria-current={active ? 'step' : undefined}
              aria-label={item.label}
            >
              <Icon className='size-3.5' strokeWidth={2} />
            </button>
            <span
              className={`mt-2 hidden max-w-full truncate text-[10px] font-semibold tracking-[0.04em] uppercase sm:block ${
                active
                  ? 'text-[#20509b] dark:text-blue-300'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {item.label}
            </span>
          </li>
        )
      })}
    </ol>
  </nav>
)

const CoverUpload = ({ id, preview, inputRef, onChange, onClear }) => (
  <div className='min-w-0'>
    <p className={`${labelClass} mb-2`}>Cover image</p>
    <div
      className='group relative overflow-hidden border border-dashed border-gray-200/80 bg-gradient-to-br from-gray-50/90 via-white to-blue-50/40 dark:border-white/10 dark:from-[#0c1528] dark:via-[#0f1a30] dark:to-[#152848]'
      style={{ borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }}
    >
      {preview ? (
        <div className='flex items-center gap-3 p-2.5'>
          <div
            className='relative h-14 w-24 shrink-0 overflow-hidden'
            style={chipRadius}
          >
            <img
              src={preview}
              alt='Cover preview'
              className='size-full object-cover'
            />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-[13px] font-semibold text-gray-700 dark:text-gray-200'>
              Cover selected
            </p>
            <p className='mt-0.5 text-[11px] text-gray-400'>
              Optional · JPEG, PNG, or WebP
            </p>
          </div>
          <div className='flex shrink-0 items-center gap-1.5'>
            <label
              htmlFor={id}
              className='inline-flex cursor-pointer items-center gap-1.5 border border-gray-200/80 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#152238] dark:text-gray-200 dark:hover:bg-white/5'
              style={chipRadius}
            >
              <Camera className='size-3.5' strokeWidth={2} />
              Replace
            </label>
            <button
              type='button'
              onClick={onClear}
              className='grid size-8 place-items-center text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/15'
              style={chipRadius}
              aria-label='Remove cover image'
            >
              <X className='size-3.5' strokeWidth={2} />
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          className='flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-blue-50/30 dark:hover:bg-white/5'
        >
          <span
            className='grid size-9 shrink-0 place-items-center border border-gray-200/80 bg-white text-[#20509b] shadow-[0_6px_14px_rgba(8,33,78,0.06)] dark:border-white/10 dark:bg-[#152238] dark:text-blue-300'
            style={chipRadius}
          >
            <ImageIcon className='size-4' strokeWidth={1.75} />
          </span>
          <div className='min-w-0 flex-1'>
            <p className='text-[13px] font-semibold text-gray-700 dark:text-gray-200'>
              Add a cover image
            </p>
            <p className='mt-0.5 text-[11px] text-gray-400'>
              Optional · JPEG, PNG, or WebP
            </p>
          </div>
        </label>
      )}
      <input
        ref={inputRef}
        id={id}
        name='coverImage'
        type='file'
        accept='image/*'
        onChange={onChange}
        className='sr-only'
      />
    </div>
  </div>
)

const classToForm = (classItem) => ({
  className: classItem.className ?? '',
  classCode: classItem.classCode ?? '',
  description: classItem.description ?? '',
  grade: classItem.grade?.toString() ?? '',
  academicYear: classItem.academicYear ?? '',
  classTeacher: classItem.classTeacher?._id || classItem.classTeacher || '',
  courses:
    classItem.courses
      ?.map((course) =>
        typeof course === 'string' || typeof course === 'number'
          ? String(course)
          : course?._id || course?.id
            ? String(course._id || course.id)
            : '',
      )
      .filter(Boolean) ?? [],
  coverImage: null,
  existingCoverImage: classItem.coverImage ?? '',
  removeCoverImage: false,
  isActive: classItem.isActive ?? true,
})

const EditClass = ({ classItem, onSuccess }) => {
  const { close } = useModal()
  const coverInputRef = useRef(null)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => classToForm(classItem))
  const [coverPreview, setCoverPreview] = useState('')
  const [courseCatalog, setCourseCatalog] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [stepKey, setStepKey] = useState(0)

  const mergedCourseCatalog = useMemo(() => {
    const map = new Map()

    courseCatalog.forEach((course) => {
      const id = course?._id || course?.id
      if (id) map.set(String(id), course)
    })

    ;(classItem.courses || []).forEach((course) => {
      if (!course || typeof course !== 'object') return
      const id = course._id || course.id
      if (id && !map.has(String(id))) map.set(String(id), course)
    })

    return [...map.values()]
  }, [courseCatalog, classItem.courses])

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview)
    }
  }, [coverPreview])

  useEffect(() => {
    let cancelled = false

    const loadCourses = async () => {
      setLoadingCourses(true)
      try {
        const data = await getCourses({ courseStatus: 'Active' })
        if (!cancelled) setCourseCatalog(data.courses || [])
      } catch {
        if (!cancelled) {
          setError('Failed to load courses.')
          setCourseCatalog([])
        }
      } finally {
        if (!cancelled) setLoadingCourses(false)
      }
    }

    loadCourses()

    return () => {
      cancelled = true
    }
  }, [])

  const displayedCover =
    coverPreview || (!form.removeCoverImage ? form.existingCoverImage : '')

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Cover image must be an image file.')
      event.target.value = ''
      return
    }

    setError('')
    setForm((prev) => ({
      ...prev,
      coverImage: file,
      removeCoverImage: false,
    }))
    setCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const clearCoverImage = () => {
    setForm((prev) => ({
      ...prev,
      coverImage: null,
      removeCoverImage: Boolean(prev.existingCoverImage),
    }))
    setCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return ''
    })
    if (coverInputRef.current) coverInputRef.current.value = ''
  }

  const goToStep = (next) => {
    setError('')
    setStep(next)
    setStepKey((k) => k + 1)
  }

  const validateStep = (index) => {
    if (index === 0) {
      if (!form.className.trim()) return 'Please enter a class name.'
      if (!form.classCode.trim()) return 'Please enter a class code.'
    }
    return ''
  }

  const handleNext = () => {
    const message = validateStep(step)
    if (message) {
      setError(message)
      return
    }
    goToStep(Math.min(step + 1, STEPS.length - 1))
  }

  const handleBack = () => {
    goToStep(Math.max(step - 1, 0))
  }

  const handleSaveChanges = async () => {
    if (step !== STEPS.length - 1 || isSubmitting) return

    const message = validateStep(0)
    if (message) {
      setError(message)
      goToStep(0)
      return
    }

    setError('')
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('className', form.className.trim())
    formData.append('classCode', form.classCode.trim().toUpperCase())
    formData.append('description', form.description.trim())
    formData.append('academicYear', form.academicYear.trim())
    formData.append('isActive', String(form.isActive))
    formData.append('classTeacher', form.classTeacher || '')
    formData.append('courses', JSON.stringify(form.courses))

    if (form.grade !== '') formData.append('grade', String(Number(form.grade)))
    if (form.coverImage) formData.append('coverImage', form.coverImage)
    if (form.removeCoverImage && !form.coverImage) {
      formData.append('removeCoverImage', 'true')
    }

    try {
      const data = await updateClass(classItem._id, formData)
      onSuccess?.(data.class)
      close()
    } catch (err) {
      setError(err.message || 'Failed to update class.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      noValidate
      className='relative w-full min-w-0 overflow-x-hidden'
    >
      <div className='pointer-events-none absolute inset-0 overflow-hidden' aria-hidden>
        <div className='absolute -top-6 right-0 size-40 rounded-full bg-[#3d76c6]/10 blur-3xl dark:bg-[#3d76c6]/15' />
        <div className='absolute top-24 left-0 size-32 rounded-full bg-[#08214e]/8 blur-3xl dark:bg-[#20509b]/20' />
      </div>

      <div className='relative flex w-full min-w-0 flex-col gap-5'>
        <ProgressRail step={step} onJump={goToStep} />

        <div
          className='relative min-w-0 overflow-hidden border border-gray-200/60 bg-gradient-to-br from-white via-white to-blue-50/50 p-4 dark:border-white/8 dark:from-[#0f1a30] dark:via-[#0c1528] dark:to-[#152848]/60 sm:p-5'
          style={panelRadius}
        >
          {error && <FormError message={error} onDismiss={() => setError('')} />}

          <div key={stepKey} className='edit-class-step space-y-4'>
            {step === 0 && (
              <>
                <CoverUpload
                  id='edit-class-coverImage'
                  preview={displayedCover}
                  inputRef={coverInputRef}
                  onChange={handleCoverChange}
                  onClear={clearCoverImage}
                />

                <div className='grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2'>
                  <Field label='Class name' id='edit-class-className'>
                    <IconInput
                      id='edit-class-className'
                      name='className'
                      icon={GraduationCap}
                      value={form.className}
                      onChange={handleChange}
                      placeholder='e.g. Grade 7A'
                    />
                  </Field>
                  <Field label='Class code' id='edit-class-classCode'>
                    <IconInput
                      id='edit-class-classCode'
                      name='classCode'
                      icon={Hash}
                      value={form.classCode}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          classCode: event.target.value.toUpperCase(),
                        }))
                      }
                      placeholder='e.g. G7A'
                    />
                  </Field>
                </div>

                <StatusToggle
                  value={form.isActive}
                  onChange={(isActive) =>
                    setForm((prev) => ({ ...prev, isActive }))
                  }
                />
              </>
            )}

            {step === 1 && (
              <div className='grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2'>
                <Field
                  label='Grade or level'
                  id='edit-class-grade'
                  hint='Optional'
                >
                  <IconInput
                    id='edit-class-grade'
                    name='grade'
                    type='number'
                    icon={Layers3}
                    value={form.grade}
                    onChange={handleChange}
                    placeholder='e.g. 7'
                  />
                </Field>
                <Field label='Academic year' id='edit-class-academicYear'>
                  <IconInput
                    id='edit-class-academicYear'
                    name='academicYear'
                    icon={CalendarRange}
                    value={form.academicYear}
                    onChange={handleChange}
                    placeholder='e.g. 2025/2026'
                  />
                </Field>
                <Field
                  label='Official class teacher'
                  id='edit-class-classTeacher'
                  hint='Choose a teacher already assigned to this class, or choose None to clear the designation.'
                  className='sm:col-span-2'
                >
                  <select
                    id='edit-class-classTeacher'
                    className='form-field w-full rounded-lg px-3 py-2 text-[13px] dark:text-gray-100'
                    value={form.classTeacher}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        classTeacher: event.target.value,
                      }))
                    }
                  >
                    <option value=''>None</option>
                    {(classItem.teachers || []).map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {[
                          teacher.user?.firstName,
                          teacher.user?.lastName,
                        ]
                          .filter(Boolean)
                          .join(' ') ||
                          teacher.email ||
                          teacher._id}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label='Description'
                  id='edit-class-description'
                  className='sm:col-span-2'
                  hint='Optional short summary for teachers and parents.'
                  counter={`${form.description.length} / ${DESCRIPTION_MAX}`}
                  counterDanger={form.description.length >= DESCRIPTION_MAX}
                >
                  <textarea
                    id='edit-class-description'
                    name='description'
                    rows={4}
                    maxLength={DESCRIPTION_MAX}
                    value={form.description}
                    onChange={handleChange}
                    placeholder='Optional short description of the class'
                    className='form-field min-h-[7.5rem] w-full resize-none px-3.5 py-3 text-[13px]'
                    style={{ borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }}
                  />
                </Field>
              </div>
            )}

            {step === 2 && (
              <Field label='Courses' id='edit-class-course-select'>
                <CoursePicker
                  selectId='edit-class-course-select'
                  selectedIds={form.courses}
                  catalog={mergedCourseCatalog}
                  loading={loadingCourses}
                  currentClassId={classItem._id || classItem.id}
                  onChange={(courses) =>
                    setForm((prev) => ({ ...prev, courses }))
                  }
                />
              </Field>
            )}
          </div>
        </div>

        <div className='flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/8'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={step === 0 ? close : handleBack}
            disabled={isSubmitting}
          >
            {step === 0 ? (
              'Cancel'
            ) : (
              <>
                <ArrowLeft className='size-3.5' strokeWidth={2} />
                Back
              </>
            )}
          </Button>

          <div className='flex flex-col-reverse gap-2 sm:flex-row'>
            {step < STEPS.length - 1 ? (
              <Button
                type='button'
                variant='primary'
                size='sm'
                onClick={handleNext}
              >
                Continue
                <ArrowRight className='size-3.5' strokeWidth={2} />
              </Button>
            ) : (
              <Button
                type='button'
                variant='primary'
                size='sm'
                loading={isSubmitting}
                onClick={handleSaveChanges}
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>

        <style>{`
          .edit-class-step {
            animation: editClassIn 320ms cubic-bezier(0.16, 1, 0.3, 1);
          }

          .form-error {
            animation: formErrorIn 280ms cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes editClassIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes formErrorIn {
            from {
              opacity: 0;
              transform: translateY(-6px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
      </div>
    </form>
  )
}

export default EditClass


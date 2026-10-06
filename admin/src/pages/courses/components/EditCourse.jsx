import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  GraduationCap,
  Hash,
  Layers3,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import useModal from '../../../hooks/useModal'
import Button from '../../../components/Button'
import IconInput from '../../../components/IconInput'
import Select from '../../../components/Select'
import { updateCourse } from '../../../lib/course.requests'
import { getClasses } from '../../../lib/class.requests'
import { getTeachers } from '../../../lib/teacher.requests'

const COURSE_TYPES = ['Core', 'Elective', 'Optional']

const panelRadius = { borderRadius: '1.35rem 0.45rem 1.35rem 0.45rem' }
const chipRadius = { borderRadius: '1rem 0.3rem 1rem 0.3rem' }

const labelClass =
  'mb-1.5 block text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-gray-400'

const STEPS = [
  { id: 'identity', label: 'Identity', icon: BookOpen },
  { id: 'details', label: 'Details', icon: Layers3 },
  { id: 'assignment', label: 'Assignment', icon: Users },
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

const ChoiceGroup = ({ label, value, options, onChange }) => (
  <div>
    <p className={labelClass}>{label}</p>
    <div className='grid grid-cols-3 gap-2'>
      {options.map((option) => {
        const selected = value === option
        return (
          <button
            key={option}
            type='button'
            onClick={() => onChange(option)}
            className={`h-11 min-w-0 px-2 text-[12px] font-semibold transition-all duration-200 ${
              selected
                ? 'brand-gradient text-white shadow-[0_10px_24px_rgba(32,80,155,0.28)]'
                : 'form-field border text-gray-600 dark:text-gray-300'
            }`}
            style={chipRadius}
            aria-pressed={selected}
          >
            {option}
          </button>
        )
      })}
    </div>
  </div>
)

const StatusToggle = ({ value, onChange }) => (
  <div>
    <p className={labelClass}>Status</p>
    <div className='grid grid-cols-2 gap-2'>
      {['Active', 'Inactive'].map((option) => {
        const selected = value === option
        return (
          <button
            key={option}
            type='button'
            onClick={() => onChange(option)}
            className={`h-11 text-[12px] font-semibold transition-all duration-200 ${
              selected
                ? 'brand-gradient text-white shadow-[0_10px_24px_rgba(32,80,155,0.28)]'
                : 'form-field border text-gray-600 dark:text-gray-300'
            }`}
            style={chipRadius}
            aria-pressed={selected}
          >
            {option}
          </button>
        )
      })}
    </div>
  </div>
)

const ProgressRail = ({ step, onJump }) => (
  <nav aria-label='Edit course steps' className='mb-6 min-w-0 overflow-hidden'>
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

const getClassId = (course) => {
  if (!course.courseClass) return ''
  if (typeof course.courseClass === 'object') {
    return course.courseClass._id || ''
  }
  return String(course.courseClass)
}

const getTeacherId = (course) => {
  const teachers = course.courseTeachers || []
  if (!teachers.length) return ''
  const first = teachers[0]
  if (typeof first === 'object') return first._id || ''
  return String(first)
}

const courseToForm = (course) => ({
  courseName: course.courseName ?? '',
  courseCode: course.courseCode ?? '',
  courseDescription: course.courseDescription ?? '',
  courseType: course.courseType ?? 'Core',
  courseStatus: course.courseStatus ?? 'Active',
  courseClass: getClassId(course),
  courseTeacher: getTeacherId(course),
})

const EditCourse = ({ course, onSuccess }) => {
  const { close } = useModal()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => courseToForm(course))
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [stepKey, setStepKey] = useState(0)

  const classOptions = useMemo(
    () => [
      {
        value: '',
        label: 'No class assigned',
        description: 'Optional',
      },
      ...classes.map((classItem) => ({
        value: classItem._id,
        label: classItem.className,
        description: classItem.classCode
          ? `Code ${classItem.classCode}`
          : 'Active class',
      })),
    ],
    [classes],
  )

  const teacherOptions = useMemo(
    () => [
      {
        value: '',
        label: 'No teacher assigned',
        description: 'Optional',
      },
      ...teachers.map((teacher) => ({
        value: teacher._id,
        label: [teacher.firstName, teacher.lastName].filter(Boolean).join(' '),
        description: teacher.email || 'Teacher',
      })),
    ],
    [teachers],
  )

  useEffect(() => {
    let cancelled = false

    const loadOptions = async () => {
      try {
        const [classesData, teachersData] = await Promise.all([
          getClasses({ isActive: true }),
          getTeachers(),
        ])
        if (cancelled) return
        setClasses(classesData.classes || [])
        setTeachers(teachersData.teachers || [])
      } catch {
        if (!cancelled) {
          setError('Failed to load classes or teachers.')
        }
      }
    }

    loadOptions()

    return () => {
      cancelled = true
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const goToStep = (next) => {
    setError('')
    setStep(next)
    setStepKey((k) => k + 1)
  }

  const validateStep = (index) => {
    if (index === 0) {
      if (!form.courseName.trim()) return 'Please enter a course name.'
      if (!form.courseCode.trim()) return 'Please enter a course code.'
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

    const payload = {
      courseName: form.courseName.trim(),
      courseCode: form.courseCode.trim().toUpperCase(),
      courseDescription: form.courseDescription.trim(),
      courseType: form.courseType,
      courseStatus: form.courseStatus,
      courseClass: form.courseClass || '',
      courseTeachers: form.courseTeacher ? [form.courseTeacher] : [],
    }

    try {
      const data = await updateCourse(course._id, payload)
      onSuccess?.(data.course)
      close()
    } catch (err) {
      setError(err.message || 'Failed to update course.')
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

          <div key={stepKey} className='edit-course-step space-y-4'>
            {step === 0 && (
              <div className='grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2'>
                <Field label='Course name' id='edit-course-courseName'>
                  <IconInput
                    id='edit-course-courseName'
                    name='courseName'
                    icon={BookOpen}
                    value={form.courseName}
                    onChange={handleChange}
                    placeholder='e.g. Algebra Foundations'
                    maxLength={50}
                  />
                </Field>
                <Field label='Course code' id='edit-course-courseCode'>
                  <IconInput
                    id='edit-course-courseCode'
                    name='courseCode'
                    icon={Hash}
                    value={form.courseCode}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        courseCode: event.target.value.toUpperCase(),
                      }))
                    }
                    placeholder='e.g. MATH-101'
                    maxLength={10}
                  />
                </Field>
                <Field
                  label='Description'
                  id='edit-course-courseDescription'
                  className='sm:col-span-2'
                  hint='Optional short overview of what this course covers.'
                  counter={`${form.courseDescription.length} / ${DESCRIPTION_MAX}`}
                  counterDanger={form.courseDescription.length >= DESCRIPTION_MAX}
                >
                  <textarea
                    id='edit-course-courseDescription'
                    name='courseDescription'
                    rows={4}
                    maxLength={DESCRIPTION_MAX}
                    value={form.courseDescription}
                    onChange={handleChange}
                    placeholder='Brief overview of what this course covers…'
                    className='form-field min-h-[7.5rem] w-full resize-none px-3.5 py-3 text-[13px]'
                    style={{ borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }}
                  />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className='space-y-4'>
                <ChoiceGroup
                  label='Course type'
                  value={form.courseType}
                  options={COURSE_TYPES}
                  onChange={(courseType) =>
                    setForm((prev) => ({ ...prev, courseType }))
                  }
                />
                <StatusToggle
                  value={form.courseStatus}
                  onChange={(courseStatus) =>
                    setForm((prev) => ({ ...prev, courseStatus }))
                  }
                />
                <div
                  className='form-field flex items-start gap-3 border p-3'
                  style={panelRadius}
                >
                  <span
                    className='grid size-9 shrink-0 place-items-center border border-gray-200/70 bg-gray-50 text-[#20509b] dark:border-white/10 dark:bg-[#152238] dark:text-blue-300'
                    style={chipRadius}
                  >
                    <FileText className='size-3.5' strokeWidth={2} />
                  </span>
                  <p className='pt-1 text-[12px] leading-relaxed text-gray-500 dark:text-gray-400'>
                    Core courses are required curriculum. Electives and optional
                    courses can be offered for enrichment.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className='grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2'>
                <Field label='Class' id='edit-course-courseClass'>
                  <Select
                    id='edit-course-courseClass'
                    name='courseClass'
                    placeholder='Select class'
                    searchPlaceholder='Search classes…'
                    icon={GraduationCap}
                    value={form.courseClass}
                    onChange={handleChange}
                    options={classOptions}
                    emptyMessage='No classes available'
                  />
                </Field>
                <Field label='Teacher' id='edit-course-courseTeacher'>
                  <Select
                    id='edit-course-courseTeacher'
                    name='courseTeacher'
                    placeholder='Select teacher'
                    searchPlaceholder='Search teachers…'
                    icon={UserRound}
                    value={form.courseTeacher}
                    onChange={handleChange}
                    options={teacherOptions}
                    emptyMessage='No teachers available'
                  />
                </Field>
              </div>
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
          .edit-course-step {
            animation: editCourseIn 320ms cubic-bezier(0.16, 1, 0.3, 1);
          }

          .form-error {
            animation: formErrorIn 280ms cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes editCourseIn {
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

export default EditCourse

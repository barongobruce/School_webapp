import React, { useEffect, useState } from 'react'
import {
  FileText,
  GraduationCap,
  Search,
  UserRound,
  Wallet,
  X,
} from 'lucide-react'
import useModal from '../../../hooks/useModal'
import Button from '../../../components/Button'
import DatePicker from '../../../components/DatePicker'
import IconInput from '../../../components/IconInput'
import Select from '../../../components/Select'
import { getStudents } from '../../../lib/student.requests'
import { createInvoice } from '../../../lib/payment.requests'

const softRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const panelRadius = { borderRadius: '1.35rem 0.45rem 1.35rem 0.45rem' }
const chipRadius = { borderRadius: '1rem 0.3rem 1rem 0.3rem' }

const inputClass =
  'form-field h-11 w-full max-w-full min-w-0 px-3.5 text-[13px]'

const labelClass =
  'mb-1.5 block text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-gray-400'

const FEE_TYPES = [
  { value: 'Tuition', label: 'Tuition' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Exam', label: 'Exam' },
  { value: 'Activity', label: 'Activity' },
  { value: 'Library', label: 'Library' },
  { value: 'Other', label: 'Other' },
]

const TERMS = [
  { value: 'Term 1', label: 'Term 1' },
  { value: 'Term 2', label: 'Term 2' },
  { value: 'Term 3', label: 'Term 3' },
]

const Field = ({ label, id, children, className = '', required = false }) => (
  <div className={`min-w-0 ${className}`}>
    <label htmlFor={id} className={labelClass}>
      {label}
      {required ? <span className='text-red-500'> *</span> : null}
    </label>
    {children}
  </div>
)

const Section = ({ title, description, children }) => (
  <fieldset className='space-y-3'>
    <legend className='mb-0.5 text-[13px] font-semibold text-gray-900 dark:text-white'>
      {title}
    </legend>
    {description ? (
      <p className='!mt-0 text-[12px] text-gray-500 dark:text-gray-400'>
        {description}
      </p>
    ) : null}
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>{children}</div>
  </fieldset>
)

const formatAmount = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

const mapStudent = (student) => {
  const id = String(student._id || student.id || '')
  const firstName = student.firstName || ''
  const lastName = student.lastName || ''
  const guardian = student.guardian
  const guardianName = guardian
    ? `${guardian.firstName || ''} ${guardian.lastName || ''}`.trim() ||
      guardian.name ||
      ''
    : ''

  return {
    id,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim() || 'Student',
    photo: student.photo || '',
    email: student.email || '',
    classGrade: student.class?.className || student.classGrade || '',
    guardianName,
    hasGuardian: Boolean(guardian && (guardian._id || guardian.id)),
  }
}

const initialForm = {
  feeType: '',
  title: '',
  term: 'Term 1',
  academicYear: String(new Date().getFullYear()),
  amount: '',
  dueDate: '',
  notes: '',
}

const CreateInvoice = ({ onSuccess } = {}) => {
  const { close } = useModal()
  const [form, setForm] = useState(initialForm)
  const [studentSearch, setStudentSearch] = useState('')
  const [studentResults, setStudentResults] = useState([])
  const [isSearchingStudents, setIsSearchingStudents] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const amountLabel = formatAmount(form.amount)

  useEffect(() => {
    if (selectedStudent) {
      setStudentResults([])
      setIsSearchingStudents(false)
      return undefined
    }

    const query = studentSearch.trim()
    if (query.length < 2) {
      setStudentResults([])
      setIsSearchingStudents(false)
      return undefined
    }

    let cancelled = false
    setIsSearchingStudents(true)

    const timer = setTimeout(async () => {
      try {
        const data = await getStudents({ search: query, isActive: true })
        if (cancelled) return
        setStudentResults((data.students || []).slice(0, 8).map(mapStudent))
      } catch {
        if (!cancelled) setStudentResults([])
      } finally {
        if (!cancelled) setIsSearchingStudents(false)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [selectedStudent, studentSearch])

  const selectStudent = (student) => {
    setSelectedStudent(student)
    setStudentSearch('')
    setStudentResults([])
    setError('')
  }

  const clearSelectedStudent = () => {
    setSelectedStudent(null)
    setStudentSearch('')
    setStudentResults([])
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name) => (event) => {
    setForm((prev) => ({ ...prev, [name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!selectedStudent) {
      setError('Select a student to bill.')
      return
    }
    if (!selectedStudent.hasGuardian) {
      setError('This student has no linked guardian. Link a guardian first.')
      return
    }
    if (!form.feeType) {
      setError('Select a fee type.')
      return
    }
    if (!form.title.trim()) {
      setError('Enter an invoice title.')
      return
    }
    if (!form.dueDate) {
      setError('Select a due date.')
      return
    }

    const amount = Number(form.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid amount greater than 0.')
      return
    }

    setIsSubmitting(true)
    try {
      await createInvoice({
        studentId: selectedStudent.id,
        title: form.title.trim(),
        feeType: form.feeType,
        amount,
        currency: 'USD',
        term: form.term,
        academicYear: form.academicYear.trim(),
        dueDate: form.dueDate,
        notes: form.notes.trim(),
      })
      onSuccess?.()
      close()
    } catch (err) {
      setError(err.message || 'Failed to create invoice.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const showResults =
    !selectedStudent &&
    (isSearchingStudents ||
      studentResults.length > 0 ||
      studentSearch.trim().length >= 2)

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
      <Section
        title='Bill to'
        description='Search for the student. The invoice is emailed to their guardian for payment.'
      >
        <div className='relative sm:col-span-2'>
          {selectedStudent ? (
            <div
              className='flex items-start gap-3 border border-[#20509b]/30 bg-blue-50/60 px-3.5 py-3 dark:border-blue-400/25 dark:bg-blue-500/10'
              style={softRadius}
            >
              {selectedStudent.photo ? (
                <img
                  src={selectedStudent.photo}
                  alt=''
                  className='size-12 shrink-0 object-cover'
                  style={chipRadius}
                />
              ) : (
                <span
                  className='grid size-12 shrink-0 place-items-center brand-gradient text-white'
                  style={chipRadius}
                >
                  <UserRound className='size-5' strokeWidth={2} />
                </span>
              )}
              <div className='min-w-0 flex-1'>
                <p className='text-[13px] font-semibold text-gray-900 dark:text-gray-100'>
                  {selectedStudent.name}
                </p>
                <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
                  {[selectedStudent.classGrade, selectedStudent.email]
                    .filter(Boolean)
                    .join(' · ') || 'Student selected'}
                </p>
                {selectedStudent.guardianName ? (
                  <p className='mt-1 text-[11px] text-gray-500 dark:text-gray-400'>
                    Guardian{' '}
                    <span className='font-medium text-gray-800 dark:text-gray-100'>
                      {selectedStudent.guardianName}
                    </span>
                  </p>
                ) : (
                  <p className='mt-1 text-[11px] text-rose-600 dark:text-rose-400'>
                    No guardian linked — invoice cannot be created.
                  </p>
                )}
              </div>
              <button
                type='button'
                onClick={clearSelectedStudent}
                className='grid size-8 shrink-0 place-items-center text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-200'
                aria-label='Clear selected student'
              >
                <X className='size-4' strokeWidth={2} />
              </button>
            </div>
          ) : (
            <>
              <Field label='Student' id='create-invoice-studentSearch' required>
                <IconInput
                  id='create-invoice-studentSearch'
                  name='studentSearch'
                  type='search'
                  icon={Search}
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  placeholder='Search by name, email, or student ID'
                  autoComplete='off'
                />
              </Field>

              {showResults ? (
                <div
                  className='absolute z-20 mt-1 max-h-52 w-full overflow-y-auto border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-[#0c1528]'
                  style={softRadius}
                >
                  {isSearchingStudents ? (
                    <p className='px-3.5 py-3 text-[12px] text-gray-500'>
                      Searching…
                    </p>
                  ) : studentResults.length === 0 ? (
                    <p className='px-3.5 py-3 text-[12px] text-gray-500'>
                      No students found.
                    </p>
                  ) : (
                    studentResults.map((student) => (
                      <button
                        key={student.id}
                        type='button'
                        onClick={() => selectStudent(student)}
                        className='flex w-full items-center gap-3 border-b border-gray-100 px-3.5 py-2.5 text-left transition-colors last:border-b-0 hover:bg-blue-50/80 dark:border-white/8 dark:hover:bg-blue-500/10'
                      >
                        {student.photo ? (
                          <img
                            src={student.photo}
                            alt=''
                            className='size-9 shrink-0 object-cover'
                            style={chipRadius}
                          />
                        ) : (
                          <span
                            className='grid size-9 shrink-0 place-items-center bg-gray-100 text-gray-500 dark:bg-white/10'
                            style={chipRadius}
                          >
                            <UserRound className='size-3.5' />
                          </span>
                        )}
                        <span className='min-w-0'>
                          <span className='block truncate text-[13px] font-medium text-gray-900 dark:text-gray-100'>
                            {student.name}
                          </span>
                          <span className='block truncate text-[11px] text-gray-500 dark:text-gray-400'>
                            {[student.classGrade, student.email]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>
      </Section>

      <Section
        title='Invoice details'
        description='Describe what this charge covers.'
      >
        <Field label='Fee type' id='create-invoice-feeType' required>
          <Select
            id='create-invoice-feeType'
            name='feeType'
            label='Fee type'
            placeholder='Select fee type'
            icon={Wallet}
            value={form.feeType}
            onChange={handleSelectChange('feeType')}
            options={FEE_TYPES}
            searchable={false}
          />
        </Field>

        <Field label='Title' id='create-invoice-title' required>
          <input
            id='create-invoice-title'
            name='title'
            type='text'
            required
            value={form.title}
            onChange={handleChange}
            placeholder='e.g. Term 1 tuition'
            className={inputClass}
            style={softRadius}
          />
        </Field>

        <Field label='Term' id='create-invoice-term'>
          <Select
            id='create-invoice-term'
            name='term'
            label='Term'
            placeholder='Select term'
            icon={GraduationCap}
            value={form.term}
            onChange={handleSelectChange('term')}
            options={TERMS}
            searchable={false}
          />
        </Field>

        <Field label='Academic year' id='create-invoice-academicYear' required>
          <input
            id='create-invoice-academicYear'
            name='academicYear'
            type='text'
            required
            value={form.academicYear}
            onChange={handleChange}
            placeholder='e.g. 2026'
            className={inputClass}
            style={softRadius}
          />
        </Field>
      </Section>

      <Section title='Billing'>
        <Field label='Amount (USD)' id='create-invoice-amount' required>
          <input
            id='create-invoice-amount'
            name='amount'
            type='number'
            min='0'
            step='1'
            required
            value={form.amount}
            onChange={handleChange}
            placeholder='e.g. 1500'
            className={inputClass}
            style={softRadius}
          />
        </Field>

        <Field label='Due date' id='create-invoice-dueDate' required>
          <DatePicker
            id='create-invoice-dueDate'
            name='dueDate'
            value={form.dueDate}
            onChange={handleSelectChange('dueDate')}
            placeholder='Select due date'
          />
        </Field>

        <Field
          label='Notes'
          id='create-invoice-notes'
          className='sm:col-span-2'
        >
          <textarea
            id='create-invoice-notes'
            name='notes'
            rows={3}
            value={form.notes}
            onChange={handleChange}
            placeholder='Optional notes for the guardian or finance office…'
            className={`${inputClass} h-auto resize-y py-3`}
            style={softRadius}
          />
        </Field>
      </Section>

      {(selectedStudent || amountLabel || form.feeType) && (
        <div
          className='flex items-start gap-3 border border-gray-200/80 bg-gradient-to-br from-gray-50 via-white to-blue-50/40 px-3.5 py-3 dark:border-white/10 dark:from-[#101a2e] dark:via-[#0c1528] dark:to-blue-950/20'
          style={panelRadius}
        >
          <span
            className='grid size-9 shrink-0 place-items-center brand-gradient text-white'
            style={softRadius}
          >
            <FileText className='size-4' strokeWidth={1.75} />
          </span>
          <div className='min-w-0 flex-1'>
            <p className='text-[12px] font-semibold text-gray-900 dark:text-gray-100'>
              Invoice preview
            </p>
            <p className='mt-0.5 text-[12px] text-gray-500 dark:text-gray-400'>
              {[
                selectedStudent?.name,
                form.feeType || null,
                form.title.trim() || null,
              ]
                .filter(Boolean)
                .join(' · ') || 'Fill in the details above'}
            </p>
          </div>
          {amountLabel ? (
            <p className='shrink-0 text-[14px] font-semibold tracking-tight text-gray-900 dark:text-white'>
              {amountLabel}
            </p>
          ) : null}
        </div>
      )}

      {error ? (
        <p className='text-[13px] text-rose-600 dark:text-rose-400'>{error}</p>
      ) : null}

      <div className='flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end dark:border-white/8'>
        <Button
          type='button'
          variant='outline'
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
          disabled={!selectedStudent || isSubmitting}
        >
          {isSubmitting ? 'Creating…' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  )
}

export default CreateInvoice

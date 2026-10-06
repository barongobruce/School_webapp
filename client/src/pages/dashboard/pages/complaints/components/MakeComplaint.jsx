import React, { useState } from 'react'
import {
  AlertCircle,
  Camera,
  FileText,
  Signal,
  Tags,
  Type,
  UserRound,
  Users,
} from 'lucide-react'
import useModal from '../../../../../hooks/useModal'
import { createComplaint } from '../../../../../lib/complaint.requests'
import Button from '../../../../../components/Button'
import IconInput from '../../../components/IconInput'
import Select from '../../../components/Select'

const CATEGORIES = [
  { value: 'bullying', label: 'Bullying' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'cyberbullying', label: 'Cyberbullying' },
  { value: 'discrimination', label: 'Discrimination' },
  { value: 'other', label: 'Other' },
]

const SEVERITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const DESCRIPTION_MAX = 500

const fieldRadius = { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }
const chipRadius = { borderRadius: '0.85rem 0.25rem 0.85rem 0.25rem' }
const panelRadius = { borderRadius: '1.35rem 0.45rem 1.35rem 0.45rem' }
const textareaRadius = { borderRadius: '1.1rem 0.35rem 1.1rem 0.35rem' }

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

const initialForm = {
  title: '',
  description: '',
  category: '',
  severity: '',
  reportedParty: '',
  witnesses: '',
  photoEvidence: null,
}

const MakeComplaint = ({ onSuccess }) => {
  const { close } = useModal()
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] || null
    setForm((prev) => ({ ...prev, photoEvidence: file }))
    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('Please enter a title.')
      return
    }
    if (!form.category) {
      setError('Please select a category.')
      return
    }
    if (!form.severity) {
      setError('Please select a severity.')
      return
    }
    if (!form.reportedParty.trim()) {
      setError('Please describe the reported party.')
      return
    }
    if (form.reportedParty.trim().length > 50) {
      setError('Reported party cannot exceed 50 characters.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await createComplaint({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        severity: form.severity,
        reportedParty: form.reportedParty.trim(),
        witnesses: form.witnesses.trim(),
        photoEvidence: form.photoEvidence,
      })
      onSuccess?.()
      close()
    } catch (err) {
      setError(err.message || 'Failed to submit complaint.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      <FormError message={error} />

      <Field label='Title' id='complaint-title'>
        <IconInput
          id='complaint-title'
          name='title'
          value={form.title}
          onChange={handleChange}
          placeholder='Brief summary of the incident'
          icon={Type}
          maxLength={50}
          required
          disabled={isSubmitting}
        />
      </Field>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <Field label='Category' id='complaint-category'>
          <Select
            id='complaint-category'
            name='category'
            value={form.category}
            onChange={handleChange}
            options={CATEGORIES}
            placeholder='Select category'
            icon={Tags}
            label='Category'
            searchable={false}
            disabled={isSubmitting}
          />
        </Field>

        <Field label='Severity' id='complaint-severity'>
          <Select
            id='complaint-severity'
            name='severity'
            value={form.severity}
            onChange={handleChange}
            options={SEVERITIES}
            placeholder='Select severity'
            icon={Signal}
            label='Severity'
            searchable={false}
            disabled={isSubmitting}
          />
        </Field>
      </div>

      <Field label='Reported party' id='complaint-reported-party'>
        <IconInput
          id='complaint-reported-party'
          name='reportedParty'
          value={form.reportedParty}
          onChange={handleChange}
          placeholder='Name, nickname, or description of who was involved'
          icon={UserRound}
          maxLength={50}
          required
          disabled={isSubmitting}
        />
      </Field>

      <Field label='Witnesses' id='complaint-witnesses'>
        <IconInput
          id='complaint-witnesses'
          name='witnesses'
          value={form.witnesses}
          onChange={handleChange}
          placeholder='Comma-separated names or descriptions (optional)'
          icon={Users}
          maxLength={200}
          disabled={isSubmitting}
        />
      </Field>

      <Field label='Photo evidence' id='complaint-photo-evidence'>
        <label
          htmlFor='complaint-photo-evidence'
          className={`form-field flex h-11 w-full items-center gap-3 px-3.5 ${
            isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
          style={fieldRadius}
        >
          <span
            className='grid size-8 shrink-0 place-items-center brand-gradient text-white shadow-[0_8px_18px_rgba(32,80,155,0.28)]'
            style={chipRadius}
          >
            <Camera className='size-3.5' strokeWidth={2} />
          </span>
          <span className='min-w-0 flex-1 truncate text-[13px] font-semibold text-gray-900 dark:text-gray-100'>
            {form.photoEvidence?.name || (
              <span className='font-normal text-gray-400'>
                Upload photo (optional)
              </span>
            )}
          </span>
          <input
            id='complaint-photo-evidence'
            name='photoEvidence'
            type='file'
            accept='image/*'
            className='sr-only'
            onChange={handlePhotoChange}
            disabled={isSubmitting}
          />
        </label>
      </Field>

      <Field
        label='Description'
        id='complaint-description'
        counter={`${form.description.length} / ${DESCRIPTION_MAX}`}
        counterDanger={form.description.length >= DESCRIPTION_MAX}
      >
        <textarea
          id='complaint-description'
          name='description'
          maxLength={DESCRIPTION_MAX}
          rows={4}
          value={form.description}
          onChange={handleChange}
          placeholder='Describe what happened…'
          disabled={isSubmitting}
          className='form-field w-full resize-y px-3.5 py-3 text-[13px] font-semibold text-gray-900 placeholder:font-normal placeholder:text-gray-400 disabled:opacity-50 dark:text-gray-100'
          style={textareaRadius}
        />
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
          disabled={isSubmitting}
        >
          <FileText className='size-3.5' strokeWidth={2} />
          Submit complaint
        </Button>
      </div>
    </form>
  )
}

export default MakeComplaint

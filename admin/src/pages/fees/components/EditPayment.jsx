import React, { useState } from 'react'
import useModal from '../../../hooks/useModal'
import Button from '../../../components/Button'

const softRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }

const inputClass =
  'form-field h-11 w-full max-w-full min-w-0 px-3.5 text-[13px]'

const labelClass =
  'mb-1.5 block text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-gray-400'

const Field = ({ label, id, children, className = '' }) => (
  <div className={`min-w-0 ${className}`}>
    <label htmlFor={id} className={labelClass}>
      {label}
    </label>
    {children}
  </div>
)

const Section = ({ title, children }) => (
  <fieldset className='space-y-3'>
    <legend className='mb-1 text-[13px] font-semibold text-gray-900 dark:text-white'>
      {title}
    </legend>
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>{children}</div>
  </fieldset>
)

const toDateInput = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

const paymentToForm = (payment) => ({
  studentName: payment.student?.name ?? '',
  guardianName: payment.guardian?.name ?? '',
  feeType: payment.feeType ?? '',
  term: payment.term ?? 'Term 1',
  academicYear: payment.academicYear ?? '',
  amount: payment.amount?.toString() ?? '',
  status: payment.status ?? 'Pending',
  dueDate: toDateInput(payment.dueDate),
  notes: payment.notes ?? '',
})

const EditPayment = ({ payment, onSuccess }) => {
  const { close } = useModal()
  const [form, setForm] = useState(() => paymentToForm(payment))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await onSuccess?.({
        term: form.term,
        academicYear: form.academicYear,
        dueDate: form.dueDate || null,
        notes: form.notes,
      })
      close()
    } catch (err) {
      setError(err.message || 'Failed to update payment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
      <Section title='Student & fee'>
        <Field label='Student' id='edit-payment-studentName'>
          <input
            id='edit-payment-studentName'
            name='studentName'
            type='text'
            value={form.studentName}
            disabled
            className={`${inputClass} opacity-70`}
            style={softRadius}
          />
        </Field>
        <Field label='Guardian' id='edit-payment-guardianName'>
          <input
            id='edit-payment-guardianName'
            name='guardianName'
            type='text'
            value={form.guardianName}
            disabled
            className={`${inputClass} opacity-70`}
            style={softRadius}
          />
        </Field>
        <Field label='Fee type' id='edit-payment-feeType'>
          <input
            id='edit-payment-feeType'
            name='feeType'
            type='text'
            value={form.feeType}
            disabled
            className={`${inputClass} opacity-70`}
            style={softRadius}
          />
        </Field>
        <Field label='Amount' id='edit-payment-amount'>
          <input
            id='edit-payment-amount'
            name='amount'
            type='text'
            value={form.amount}
            disabled
            className={`${inputClass} opacity-70`}
            style={softRadius}
          />
        </Field>
        <Field label='Status' id='edit-payment-status'>
          <input
            id='edit-payment-status'
            name='status'
            type='text'
            value={form.status}
            disabled
            className={`${inputClass} opacity-70`}
            style={softRadius}
          />
        </Field>
        <Field label='Term' id='edit-payment-term'>
          <input
            id='edit-payment-term'
            name='term'
            type='text'
            value={form.term}
            onChange={handleChange}
            className={inputClass}
            style={softRadius}
          />
        </Field>
        <Field label='Academic year' id='edit-payment-academicYear'>
          <input
            id='edit-payment-academicYear'
            name='academicYear'
            type='text'
            value={form.academicYear}
            onChange={handleChange}
            className={inputClass}
            style={softRadius}
          />
        </Field>
        <Field label='Due date' id='edit-payment-dueDate'>
          <input
            id='edit-payment-dueDate'
            name='dueDate'
            type='date'
            value={form.dueDate}
            onChange={handleChange}
            className={inputClass}
            style={softRadius}
          />
        </Field>
        <Field label='Notes' id='edit-payment-notes' className='sm:col-span-2'>
          <textarea
            id='edit-payment-notes'
            name='notes'
            rows={3}
            value={form.notes}
            onChange={handleChange}
            className={`${inputClass} h-auto resize-y py-3`}
            style={softRadius}
          />
        </Field>
      </Section>

      <p className='text-[12px] text-gray-500 dark:text-gray-400'>
        Amount and status are managed by Stripe after the invoice is created.
        Use Cancel on the payment page to void an unpaid invoice.
      </p>

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
        <Button type='submit' variant='primary' size='sm' disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}

export default EditPayment

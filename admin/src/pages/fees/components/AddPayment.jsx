import React, { useState } from 'react'
import useModal from '../../../hooks/useModal'
import Button from '../../../components/Button'
import studentsData from '../../../data/students'

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

const studentOptions = studentsData.map((student) => ({
  id: student.id,
  name: `${student.firstName} ${student.lastName}`,
  guardianName: student.parentGuardian?.name ?? '',
}))

const initialForm = {
  studentId: '',
  guardianName: '',
  guardianId: '',
  feeType: '',
  term: 'Term 1',
  academicYear: '2025',
  amount: '',
  amountPaid: '',
  status: 'Pending',
  dueDate: '',
  paidAt: '',
  paymentMethod: '',
  receiptNumber: '',
  notes: '',
}

const AddPayment = () => {
  const { close } = useModal()
  const [form, setForm] = useState(initialForm)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }

      if (name === 'studentId') {
        const student = studentOptions.find((item) => item.id === value)
        if (student) {
          next.guardianName = student.guardianName
        }
      }

      return next
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    close()
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
      <Section title='Student & fee'>
        <Field label='Student' id='add-payment-studentId' className='sm:col-span-2'>
          <select
            id='add-payment-studentId'
            name='studentId'
            required
            value={form.studentId}
            onChange={handleChange}
            className={inputClass}
            style={softRadius}
          >
            <option value='' disabled>
              Select student
            </option>
            {studentOptions.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.id})
              </option>
            ))}
          </select>
        </Field>
        <Field label='Guardian name' id='add-payment-guardianName'>
          <input
            id='add-payment-guardianName'
            name='guardianName'
            type='text'
            required
            value={form.guardianName}
            onChange={handleChange}
            placeholder='e.g. Grace Okello'
            className={inputClass}
            style={softRadius}
          />
        </Field>
        <Field label='Guardian ID' id='add-payment-guardianId'>
          <input
            id='add-payment-guardianId'
            name='guardianId'
            type='text'
            value={form.guardianId}
            onChange={handleChange}
            placeholder='e.g. GUARD-2024-001'
            className={inputClass}
            style={softRadius}
          />
        </Field>
        <Field label='Fee type' id='add-payment-feeType'>
          <select
            id='add-payment-feeType'
            name='feeType'
            required
            value={form.feeType}
            onChange={handleChange}
            className={inputClass}
            style={softRadius}
          >
            <option value='' disabled>
              Select fee type
            </option>
            <option value='Tuition'>Tuition</option>
            <option value='Transport'>Transport</option>
            <option value='Exam'>Exam</option>
            <option value='Activity'>Activity</option>
            <option value='Library'>Library</option>
          </select>
        </Field>
        <Field label='Status' id='add-payment-status'>
          <select
            id='add-payment-status'
            name='status'
            value={form.status}
            onChange={handleChange}
            className={inputClass}
            style={softRadius}
          >
            <option value='Paid'>Paid</option>
            <option value='Partial'>Partial</option>
            <option value='Pending'>Pending</option>
            <option value='Overdue'>Overdue</option>
          </select>
        </Field>
        <Field label='Term' id='add-payment-term'>
          <select
            id='add-payment-term'
            name='term'
            value={form.term}
            onChange={handleChange}
            className={inputClass}
            style={softRadius}
          >
            <option value='Term 1'>Term 1</option>
            <option value='Term 2'>Term 2</option>
            <option value='Term 3'>Term 3</option>
          </select>
        </Field>
        <Field label='Academic year' id='add-payment-academicYear'>
          <input
            id='add-payment-academicYear'
            name='academicYear'
            type='text'
            required
            value={form.academicYear}
            onChange={handleChange}
            placeholder='e.g. 2025'
            className={inputClass}
            style={softRadius}
          />
        </Field>
      </Section>

      <Section title='Amounts & dates'>
        <Field label='Amount (GHC)' id='add-payment-amount'>
          <input
            id='add-payment-amount'
            name='amount'
            type='number'
            min='0'
            step='1000'
            required
            value={form.amount}
            onChange={handleChange}
            placeholder='e.g. 1000000'
            className={inputClass}
            style={softRadius}
          />
        </Field>
        <Field label='Amount paid (GHC)' id='add-payment-amountPaid'>
          <input
            id='add-payment-amountPaid'
            name='amountPaid'
            type='number'
            min='0'
            step='1000'
            value={form.amountPaid}
            onChange={handleChange}
            placeholder='0'
            className={inputClass}
            style={softRadius}
          />
        </Field>
        <Field label='Due date' id='add-payment-dueDate'>
          <input
            id='add-payment-dueDate'
            name='dueDate'
            type='date'
            required
            value={form.dueDate}
            onChange={handleChange}
            className={inputClass}
            style={softRadius}
          />
        </Field>
        <Field label='Paid on' id='add-payment-paidAt'>
          <input
            id='add-payment-paidAt'
            name='paidAt'
            type='date'
            value={form.paidAt}
            onChange={handleChange}
            className={inputClass}
            style={softRadius}
          />
        </Field>
      </Section>

      <Section title='Payment details'>
        <Field label='Payment method' id='add-payment-paymentMethod'>
          <select
            id='add-payment-paymentMethod'
            name='paymentMethod'
            value={form.paymentMethod}
            onChange={handleChange}
            className={inputClass}
            style={softRadius}
          >
            <option value=''>Not yet paid</option>
            <option value='Cash'>Cash</option>
            <option value='Mobile Money'>Mobile Money</option>
            <option value='Bank Transfer'>Bank Transfer</option>
            <option value='Cheque'>Cheque</option>
          </select>
        </Field>
        <Field label='Receipt number' id='add-payment-receiptNumber'>
          <input
            id='add-payment-receiptNumber'
            name='receiptNumber'
            type='text'
            value={form.receiptNumber}
            onChange={handleChange}
            placeholder='e.g. RCP-2025-0142'
            className={inputClass}
            style={softRadius}
          />
        </Field>
        <Field label='Notes' id='add-payment-notes' className='sm:col-span-2'>
          <textarea
            id='add-payment-notes'
            name='notes'
            rows={3}
            value={form.notes}
            onChange={handleChange}
            placeholder='Optional notes about this payment…'
            className={`${inputClass} h-auto resize-y py-3`}
            style={softRadius}
          />
        </Field>
      </Section>

      <div className='flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end dark:border-white/8'>
        <Button type='button' variant='outline' size='sm' onClick={close}>
          Cancel
        </Button>
        <Button type='submit' variant='primary' size='sm'>
          Add Payment
        </Button>
      </div>
    </form>
  )
}

export default AddPayment

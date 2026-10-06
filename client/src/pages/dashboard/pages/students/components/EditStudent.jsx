import React, { useState } from 'react'
import useModal from '../../../../../hooks/useModal'

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors hover:border-gray-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400/20'

const labelClass =
  'mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400'

const Field = ({ label, id, children, className = '' }) => (
  <div className={className}>
    <label htmlFor={id} className={labelClass}>
      {label}
    </label>
    {children}
  </div>
)

const Section = ({ title, children }) => (
  <fieldset className='space-y-3'>
    <legend className='mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100'>
      {title}
    </legend>
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>{children}</div>
  </fieldset>
)

const studentToForm = (student) => ({
  firstName: student.firstName ?? '',
  lastName: student.lastName ?? '',
  gender: student.gender ?? '',
  dateOfBirth: student.dateOfBirth ?? '',
  classGrade: student.classGrade ?? '',
  teacher: student.teacher ?? '',
  phone: student.phone ?? '',
  email: student.email ?? '',
  bloodGroup: student.bloodGroup ?? '',
  emergencyContact: student.emergencyContact ?? '',
  status: student.status ?? 'Active',
  parentName: student.parentGuardian?.name ?? '',
  parentRelationship: student.parentGuardian?.relationship ?? '',
  parentPhone: student.parentGuardian?.phone ?? '',
  parentEmail: student.parentGuardian?.email ?? '',
  street: student.address?.street ?? '',
  city: student.address?.city ?? '',
  district: student.address?.district ?? '',
  country: student.address?.country ?? '',
})

const EditStudent = ({ student }) => {
  const { close } = useModal()
  const [form, setForm] = useState(() => studentToForm(student))

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    close()
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
      <Section title='Personal details'>
        <Field label='First name' id='edit-firstName'>
          <input
            id='edit-firstName'
            name='firstName'
            type='text'
            required
            value={form.firstName}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>
        <Field label='Last name' id='edit-lastName'>
          <input
            id='edit-lastName'
            name='lastName'
            type='text'
            required
            value={form.lastName}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>
        <Field label='Gender' id='edit-gender'>
          <select
            id='edit-gender'
            name='gender'
            required
            value={form.gender}
            onChange={handleChange}
            className={inputClass}
          >
            <option value='' disabled>
              Select gender
            </option>
            <option value='Female'>Female</option>
            <option value='Male'>Male</option>
            <option value='Other'>Other</option>
          </select>
        </Field>
        <Field label='Date of birth' id='edit-dateOfBirth'>
          <input
            id='edit-dateOfBirth'
            name='dateOfBirth'
            type='date'
            required
            value={form.dateOfBirth}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>
        <Field label='Blood group' id='edit-bloodGroup'>
          <select
            id='edit-bloodGroup'
            name='bloodGroup'
            value={form.bloodGroup}
            onChange={handleChange}
            className={inputClass}
          >
            <option value=''>Select blood group</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </Field>
        <Field label='Emergency contact' id='edit-emergencyContact'>
          <input
            id='edit-emergencyContact'
            name='emergencyContact'
            type='tel'
            value={form.emergencyContact}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title='Academic details'>
        <Field label='Class / Grade' id='edit-classGrade'>
          <input
            id='edit-classGrade'
            name='classGrade'
            type='text'
            required
            value={form.classGrade}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>
        <Field label='Class teacher' id='edit-teacher'>
          <input
            id='edit-teacher'
            name='teacher'
            type='text'
            required
            value={form.teacher}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>
        <Field label='Status' id='edit-status'>
          <select
            id='edit-status'
            name='status'
            required
            value={form.status}
            onChange={handleChange}
            className={inputClass}
          >
            <option value='Active'>Active</option>
            <option value='Inactive'>Inactive</option>
            <option value='Suspended'>Suspended</option>
          </select>
        </Field>
      </Section>

      <Section title='Contact'>
        <Field label='Phone' id='edit-phone'>
          <input
            id='edit-phone'
            name='phone'
            type='tel'
            value={form.phone}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>
        <Field label='Email' id='edit-email'>
          <input
            id='edit-email'
            name='email'
            type='email'
            value={form.email}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title='Parent / Guardian'>
        <Field label='Full name' id='edit-parentName'>
          <input
            id='edit-parentName'
            name='parentName'
            type='text'
            required
            value={form.parentName}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>
        <Field label='Relationship' id='edit-parentRelationship'>
          <select
            id='edit-parentRelationship'
            name='parentRelationship'
            required
            value={form.parentRelationship}
            onChange={handleChange}
            className={inputClass}
          >
            <option value='' disabled>
              Select relationship
            </option>
            <option value='Mother'>Mother</option>
            <option value='Father'>Father</option>
            <option value='Guardian'>Guardian</option>
            <option value='Other'>Other</option>
          </select>
        </Field>
        <Field label='Phone' id='edit-parentPhone'>
          <input
            id='edit-parentPhone'
            name='parentPhone'
            type='tel'
            required
            value={form.parentPhone}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>
        <Field label='Email' id='edit-parentEmail'>
          <input
            id='edit-parentEmail'
            name='parentEmail'
            type='email'
            value={form.parentEmail}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title='Address'>
        <Field label='Street' id='edit-street' className='sm:col-span-2'>
          <input
            id='edit-street'
            name='street'
            type='text'
            value={form.street}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>
        <Field label='City' id='edit-city'>
          <input
            id='edit-city'
            name='city'
            type='text'
            value={form.city}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>
        <Field label='District' id='edit-district'>
          <input
            id='edit-district'
            name='district'
            type='text'
            value={form.district}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>
        <Field label='Country' id='edit-country'>
          <input
            id='edit-country'
            name='country'
            type='text'
            value={form.country}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>
      </Section>

      <div className='flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end dark:border-gray-800'>
        <button
          type='button'
          onClick={close}
          className='rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800'
        >
          Cancel
        </button>
        <button
          type='submit'
          className='rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400'
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}

export default EditStudent

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  FileImage,
  GraduationCap,
  Home,
  IdCard,
  Mail,
  MessageCircle,
  Phone,
  PhoneCall,
  Search,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import useModal from '../../../hooks/useModal'
import Button from '../../../components/Button'
import DatePicker from '../../../components/DatePicker'
import IconInput from '../../../components/IconInput'
import Select from '../../../components/Select'
import { getClasses } from '../../../lib/class.requests'
import { getGuardians } from '../../../lib/guardian.requests'
import { addStudent } from '../../../lib/student.requests'
import {
  ID_TYPE_OPTIONS,
  getIdSides,
  needsIdBack,
} from '../../../lib/idTypes'

const GENDERS = ['Female', 'Male', 'Other']
const RELATIONSHIPS = ['Mother', 'Father', 'Guardian', 'Other']

const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(String(value).trim())

const STEPS = [
  { id: 'identity', label: 'Identity', icon: UserRound },
  { id: 'school', label: 'School', icon: GraduationCap },
  { id: 'reach', label: 'Contact', icon: IdCard },
  { id: 'family', label: 'Family', icon: Users },
  { id: 'home', label: 'Address', icon: Home },
]

const softRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const panelRadius = { borderRadius: '1.35rem 0.45rem 1.35rem 0.45rem' }
const chipRadius = { borderRadius: '1rem 0.3rem 1rem 0.3rem' }

const inputClass =
  'form-field h-11 w-full max-w-full min-w-0 rounded-[1.1rem_0.35rem_1.1rem_0.35rem] px-3.5 text-[13px]'

const labelClass =
  'mb-1.5 block text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-gray-400'

const emptyAddress = {
  street: '',
  city: '',
  region: '',
  postalCode: '',
  country: '',
}

const emptyContactInfo = {
  phone: '',
  altPhone: '',
  whatsapp: '',
}

const emptyFiles = {
  photo: null,
  idFront: null,
  idBack: null,
  guardianPhoto: null,
  guardianIdFront: null,
  guardianIdBack: null,
}

const emptyPreviews = {
  photo: '',
  idFront: '',
  idBack: '',
  guardianPhoto: '',
  guardianIdFront: '',
  guardianIdBack: '',
}

const initialForm = {
  firstName: '',
  lastName: '',
  gender: '',
  dateOfBirth: '',
  class: '',
  email: '',
  emergencyContact: '',
  idType: '',
  parentName: '',
  parentRelationship: '',
  parentEmail: '',
  guardianIdType: '',
  contactInfo: { ...emptyContactInfo },
  whatsappSource: '',
  guardianContactInfo: { ...emptyContactInfo },
  guardianWhatsappSource: '',
  studentAddress: { ...emptyAddress },
  guardianAddress: { ...emptyAddress },
  sameAsStudentAddress: false,
}

const Field = ({ label, id, children, className = '', required = false }) => (
  <div className={`min-w-0 ${className}`}>
    <label htmlFor={id} className={labelClass}>
      {label}
      {required ? <span className='text-red-500'> *</span> : null}
    </label>
    {children}
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

const ChoiceGroup = ({ label, value, options, onChange, name }) => (
  <div>
    <p className={labelClass}>{label}</p>
    <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
      {options.map((option) => {
        const selected = value === option
        return (
          <button
            key={option}
            type='button'
            onClick={() =>
              onChange({ target: { name, value: option } })
            }
            className={`h-10 min-w-0 px-2 text-[12px] font-semibold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-3 ${
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

const WhatsAppLink = ({ checked, onChange, disabled = false }) => (
  <button
    type='button'
    disabled={disabled}
    aria-pressed={checked}
    onClick={() =>
      onChange({ target: { checked: !checked } })
    }
    className={`mt-2 inline-flex h-9 items-center gap-2 px-3 text-[12px] font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
      checked
        ? 'brand-gradient text-white shadow-[0_8px_18px_rgba(32,80,155,0.28)]'
        : 'form-field border text-gray-600 dark:text-gray-300'
    }`}
    style={chipRadius}
  >
    <MessageCircle className='size-3.5' strokeWidth={2} />
    {checked ? 'WhatsApp linked' : 'Same as WhatsApp'}
  </button>
)

const UploadTile = ({
  id,
  label,
  hint,
  preview,
  accept = 'image/*',
  onChange,
  tall = false,
  required = false,
}) => (
  <label
    htmlFor={id}
    className='group relative flex cursor-pointer flex-col overflow-hidden border border-dashed border-gray-200/80 bg-gradient-to-br from-gray-50/90 via-white to-blue-50/40 transition-all duration-300 hover:border-[#20509b]/45 hover:shadow-[0_12px_28px_rgba(8,33,78,0.08)] dark:border-white/10 dark:from-[#0c1528] dark:via-[#0f1a30] dark:to-[#152848] dark:hover:border-blue-400/40'
    style={panelRadius}
  >
    <div
      className={`relative flex items-center justify-center overflow-hidden ${
        tall ? 'h-40' : 'h-28'
      }`}
    >
      {preview && preview !== 'pdf' ? (
        <img
          src={preview}
          alt=''
          className='size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]'
        />
      ) : preview === 'pdf' ? (
        <div className='flex flex-col items-center gap-1.5 text-gray-400'>
          <FileImage className='size-7' strokeWidth={1.5} />
          <span className='text-[11px] font-medium tracking-wide'>PDF ready</span>
        </div>
      ) : (
        <div className='flex flex-col items-center gap-2 px-4 text-center'>
          <span
            className='grid size-10 place-items-center border border-gray-200/80 bg-white text-[#20509b] shadow-[0_8px_20px_rgba(8,33,78,0.08)] dark:border-white/10 dark:bg-[#152238] dark:text-blue-300'
            style={chipRadius}
          >
            <Camera className='size-4' strokeWidth={1.75} />
          </span>
          <div>
            <p className='text-[12px] font-semibold text-gray-700 dark:text-gray-200'>
              {label}
              {required ? <span className='text-red-500'> *</span> : null}
            </p>
            <p className='mt-0.5 text-[11px] text-gray-400'>{hint}</p>
          </div>
        </div>
      )}
      {preview && preview !== 'pdf' && (
        <div className='absolute inset-0 flex items-end bg-gradient-to-t from-[#08214e]/75 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
          <span className='text-[11px] font-medium text-white'>Replace photo</span>
        </div>
      )}
    </div>
    <input
      id={id}
      type='file'
      accept={accept}
      onChange={onChange}
      className='sr-only'
    />
  </label>
)

const ProgressRail = ({ step, onJump }) => (
  <nav aria-label='Enrollment steps' className='mb-6 min-w-0 overflow-hidden'>
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
              onClick={() => index < step && onJump(index)}
              disabled={index > step}
              className={`grid size-8 place-items-center transition-all duration-300 ${
                active || done
                  ? 'brand-gradient text-white shadow-[0_8px_20px_rgba(32,80,155,0.35)]'
                  : 'border border-gray-200/80 bg-white text-gray-400 dark:border-white/10 dark:bg-[#0c1528] dark:text-gray-500'
              } ${index < step ? 'cursor-pointer hover:brightness-110' : ''}`}
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

const revokePreviewUrl = (url) => {
  if (url && url !== 'pdf' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

const createPreviewUrl = (file, trackedUrls) => {
  if (!file) return ''
  if (file.type === 'application/pdf') return 'pdf'
  const url = URL.createObjectURL(file)
  trackedUrls.current.add(url)
  return url
}

const AddStudentForm = ({ onSuccess }) => {
  const { close } = useModal()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [files, setFiles] = useState(emptyFiles)
  const [previews, setPreviews] = useState(emptyPreviews)
  const [classes, setClasses] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [stepKey, setStepKey] = useState(0)
  const [guardianSearch, setGuardianSearch] = useState('')
  const [guardianResults, setGuardianResults] = useState([])
  const [isSearchingGuardians, setIsSearchingGuardians] = useState(false)
  const [selectedGuardian, setSelectedGuardian] = useState(null)
  const previewUrlsRef = useRef(new Set())
  const linkingExistingGuardian = Boolean(selectedGuardian)

  const classOptions = useMemo(
    () =>
      classes.map((classItem) => ({
        value: classItem._id,
        label: classItem.className,
        description: classItem.classCode
          ? `Code ${classItem.classCode}`
          : 'Active class',
      })),
    [classes],
  )

  const idTypeOptions = ID_TYPE_OPTIONS

  useEffect(() => {
    let cancelled = false

    const loadOptions = async () => {
      try {
        const classesData = await getClasses({ isActive: true })
        if (cancelled) return
        setClasses(classesData.classes || [])
      } catch {
        if (!cancelled) {
          setError('Failed to load classes.')
        }
      }
    }

    loadOptions()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const trackedUrls = previewUrlsRef.current
    return () => {
      trackedUrls.forEach((url) => revokePreviewUrl(url))
      trackedUrls.clear()
    }
  }, [])

  useEffect(() => {
    if (step !== 3 || selectedGuardian) {
      setGuardianResults([])
      setIsSearchingGuardians(false)
      return undefined
    }

    const query = guardianSearch.trim()
    if (query.length < 2) {
      setGuardianResults([])
      setIsSearchingGuardians(false)
      return undefined
    }

    let cancelled = false
    setIsSearchingGuardians(true)

    const timer = setTimeout(async () => {
      try {
        const data = await getGuardians({ search: query, isActive: true })
        if (!cancelled) {
          setGuardianResults(data.guardians || [])
        }
      } catch {
        if (!cancelled) {
          setGuardianResults([])
        }
      } finally {
        if (!cancelled) setIsSearchingGuardians(false)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [guardianSearch, selectedGuardian, step])

  const replaceTrackedUrl = (previousUrl, nextUrl) => {
    if (previousUrl && previousUrl !== 'pdf' && previousUrl.startsWith('blob:')) {
      revokePreviewUrl(previousUrl)
      previewUrlsRef.current.delete(previousUrl)
    }
    return nextUrl
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const clearIdUploads = (prefix) => {
    const frontKey = `${prefix}Front`
    const backKey = `${prefix}Back`

    setPreviews((prev) => ({
      ...prev,
      [frontKey]: replaceTrackedUrl(prev[frontKey], ''),
      [backKey]: replaceTrackedUrl(prev[backKey], ''),
    }))
    setFiles((prev) => ({
      ...prev,
      [frontKey]: null,
      [backKey]: null,
    }))
  }

  const handleIdTypeChange = (field, filePrefix) => (event) => {
    const { value } = event.target
    clearIdUploads(filePrefix)
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field) => (event) => {
    const file = event.target.files?.[0] || null
    const nextPreview = createPreviewUrl(file, previewUrlsRef)

    setPreviews((prev) => ({
      ...prev,
      [field]: replaceTrackedUrl(prev[field], nextPreview),
    }))

    setFiles((prev) => ({ ...prev, [field]: file }))
  }

  const handleContactChange = (prefix, sourceKey, event) => {
    const { name, value } = event.target
    setForm((prev) => {
      const nextContact = { ...prev[prefix], [name]: value }
      if (prev[sourceKey] === name) {
        nextContact.whatsapp = value
      }
      return { ...prev, [prefix]: nextContact }
    })
  }

  const handleWhatsappSourceChange = (prefix, sourceKey, source) => (event) => {
    const checked = event.target.checked
    setForm((prev) => {
      if (!checked) {
        return { ...prev, [sourceKey]: '' }
      }
      return {
        ...prev,
        [sourceKey]: source,
        [prefix]: {
          ...prev[prefix],
          whatsapp: prev[prefix][source],
        },
      }
    })
  }

  const handleAddressChange = (prefix, event) => {
    const { name, value } = event.target
    setForm((prev) => {
      const nextAddress = { ...prev[prefix], [name]: value }
      if (prefix === 'studentAddress' && prev.sameAsStudentAddress) {
        return {
          ...prev,
          studentAddress: nextAddress,
          guardianAddress: { ...nextAddress },
        }
      }
      return { ...prev, [prefix]: nextAddress }
    })
  }

  const handleSameAddressChange = (event) => {
    const checked = event.target.checked
    setForm((prev) => ({
      ...prev,
      sameAsStudentAddress: checked,
      guardianAddress: checked ? { ...prev.studentAddress } : prev.guardianAddress,
    }))
  }

  const goToStep = (next) => {
    setError('')
    setStep(next)
    setStepKey((k) => k + 1)
  }

  const selectExistingGuardian = (guardian) => {
    setSelectedGuardian(guardian)
    setGuardianSearch('')
    setGuardianResults([])
    setError('')
  }

  const clearSelectedGuardian = () => {
    setSelectedGuardian(null)
    setGuardianSearch('')
    setGuardianResults([])
  }

  const validateStep = (index) => {
    if (index === 0) {
      if (!files.photo) return 'Please upload a student profile photo.'
      if (!form.firstName.trim() || !form.lastName.trim()) {
        return 'Please enter the student’s first and last name.'
      }
      if (!form.gender) return 'Please select a gender.'
      if (!form.dateOfBirth) return 'Please enter the date of birth.'
      if (!form.emergencyContact.trim()) {
        return 'Please provide an emergency contact number.'
      }
    }

    if (index === 1) {
      if (!form.class) return 'Please select a class.'
      if (!form.idType) return 'Please select an ID type.'
      if (!files.idFront) return 'Please upload the ID front document.'
      if (needsIdBack(form.idType) && !files.idBack) {
        return 'Please upload the ID back document.'
      }
    }

    if (index === 2) {
      if (!form.email.trim()) return 'Please enter the student email.'
      if (!isValidEmail(form.email)) {
        return 'Please enter a valid student email.'
      }
    }

    if (index === 3) {
      if (linkingExistingGuardian) return ''

      if (!files.guardianPhoto) {
        return 'Please upload a guardian photo.'
      }
      if (!form.parentName.trim()) return 'Please enter the guardian’s full name.'
      if (!form.parentRelationship) return 'Please select a relationship.'
      if (!form.guardianContactInfo.phone.trim()) {
        return 'Please enter the guardian’s phone number.'
      }
      if (!form.parentEmail.trim()) return 'Please enter the guardian’s email.'
      if (!isValidEmail(form.parentEmail)) {
        return 'Please enter a valid guardian email.'
      }
      if (!form.guardianIdType) return 'Please select a guardian ID type.'
      if (!files.guardianIdFront) {
        return 'Please upload the guardian ID front document.'
      }
      if (needsIdBack(form.guardianIdType) && !files.guardianIdBack) {
        return 'Please upload the guardian ID back document.'
      }
    }

    if (index === 4) {
      const a = form.studentAddress
      if (
        !a.street.trim() ||
        !a.city.trim() ||
        !a.region.trim() ||
        !a.postalCode.trim() ||
        !a.country.trim()
      ) {
        return 'Please complete the student address.'
      }
      if (!linkingExistingGuardian && !form.sameAsStudentAddress) {
        const g = form.guardianAddress
        if (
          !g.street.trim() ||
          !g.city.trim() ||
          !g.region.trim() ||
          !g.postalCode.trim() ||
          !g.country.trim()
        ) {
          return 'Please complete the guardian address.'
        }
      }
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

  const handleEnrollStudent = async () => {
    if (step !== STEPS.length - 1 || isSubmitting) return

    const message = validateStep(step)
    if (message) {
      setError(message)
      return
    }

    setError('')
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('firstName', form.firstName.trim())
    formData.append('lastName', form.lastName.trim())
    formData.append('email', form.email.trim())
    formData.append('dateOfBirth', form.dateOfBirth)
    formData.append('gender', form.gender)
    formData.append('emergencyContact', form.emergencyContact.trim())
    formData.append('idType', form.idType)
    formData.append('class', form.class)
    formData.append('contactInfo', JSON.stringify(form.contactInfo))
    formData.append('studentAddress', JSON.stringify(form.studentAddress))

    if (linkingExistingGuardian) {
      const guardianName = [selectedGuardian.firstName, selectedGuardian.lastName]
        .filter(Boolean)
        .join(' ')
      formData.append('existingGuardianId', selectedGuardian._id)
      formData.append('parentName', guardianName)
      formData.append('parentEmail', selectedGuardian.email || '')
      formData.append('sameAsStudentAddress', 'true')
    } else {
      formData.append('sameAsStudentAddress', String(form.sameAsStudentAddress))
      formData.append('parentName', form.parentName.trim())
      formData.append('parentEmail', form.parentEmail.trim())
      formData.append('guardianIdType', form.guardianIdType)
      formData.append(
        'guardianContactInfo',
        JSON.stringify(form.guardianContactInfo),
      )

      if (!form.sameAsStudentAddress) {
        formData.append('guardianAddress', JSON.stringify(form.guardianAddress))
      }

      if (files.guardianPhoto) formData.append('guardianPhoto', files.guardianPhoto)
      if (files.guardianIdFront) {
        formData.append('guardianIdFront', files.guardianIdFront)
      }
      if (files.guardianIdBack) {
        formData.append('guardianIdBack', files.guardianIdBack)
      }
    }

    if (files.photo) formData.append('photo', files.photo)
    if (files.idFront) formData.append('idFront', files.idFront)
    if (files.idBack) formData.append('idBack', files.idBack)

    try {
      await addStudent(formData)
      onSuccess?.()
      close()
    } catch (err) {
      setError(err.message || 'Failed to add student.')
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
        {error && (
          <FormError message={error} onDismiss={() => setError('')} />
        )}

        <div
          key={stepKey}
          className='add-student-step space-y-4'
        >
          {step === 0 && (
            <>
              <div className='grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-[9.5rem_minmax(0,1fr)]'>
                <UploadTile
                  id='photo'
                  label='Profile photo'
                  hint='Tap to upload'
                  preview={previews.photo}
                  onChange={handleFileChange('photo')}
                  tall
                  required
                />
                <div className='grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2'>
                  <Field label='First name' id='firstName'>
                    <input
                      id='firstName'
                      name='firstName'
                      type='text'
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder='e.g. Amina'
                      className={inputClass}
                      autoFocus
                    />
                  </Field>
                  <Field label='Last name' id='lastName'>
                    <input
                      id='lastName'
                      name='lastName'
                      type='text'
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder='e.g. Okello'
                      className={inputClass}
                    />
                  </Field>
                  <Field label='Date of birth' id='dateOfBirth'>
                    <DatePicker
                      id='dateOfBirth'
                      name='dateOfBirth'
                      label='Date of birth'
                      placeholder='Select date of birth'
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      showAge
                      minYear={new Date().getFullYear() - 25}
                      maxYear={new Date().getFullYear() - 3}
                    />
                  </Field>
                  <Field label='Emergency contact' id='emergencyContact'>
                    <input
                      id='emergencyContact'
                      name='emergencyContact'
                      type='tel'
                      maxLength={20}
                      value={form.emergencyContact}
                      onChange={handleChange}
                      placeholder='+233 ...'
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
              <ChoiceGroup
                label='Gender'
                name='gender'
                value={form.gender}
                options={GENDERS}
                onChange={handleChange}
              />
            </>
          )}

          {step === 1 && (
            <>
              <div className='grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2'>
                <Field label='Class / Grade' id='class'>
                  <Select
                    id='class'
                    name='class'
                    label='Class / Grade'
                    placeholder='Select class'
                    searchPlaceholder='Search classes…'
                    icon={GraduationCap}
                    value={form.class}
                    onChange={handleChange}
                    options={classOptions}
                    emptyMessage='No classes available'
                  />
                </Field>
                <Field label='ID type' id='idType'>
                  <Select
                    id='idType'
                    name='idType'
                    label='ID type'
                    placeholder='Select ID type'
                    icon={IdCard}
                    value={form.idType}
                    onChange={handleIdTypeChange('idType', 'id')}
                    options={idTypeOptions}
                    searchable={false}
                  />
                </Field>
              </div>
              <div>
                <p className={`${labelClass} mb-2`}>ID document</p>
                {form.idType ? (
                  <div
                    className={`grid min-w-0 gap-3 ${
                      needsIdBack(form.idType)
                        ? 'grid-cols-1 sm:grid-cols-2'
                        : 'grid-cols-1'
                    }`}
                  >
                    {getIdSides(form.idType).map(({ key, label, required }) => (
                      <UploadTile
                        key={key}
                        id={`id${key === 'front' ? 'Front' : 'Back'}`}
                        label={label}
                        hint='Clear scan preferred'
                        preview={previews[`id${key === 'front' ? 'Front' : 'Back'}`]}
                        accept='image/*,application/pdf'
                        onChange={handleFileChange(
                          `id${key === 'front' ? 'Front' : 'Back'}`,
                        )}
                        required={required}
                      />
                    ))}
                  </div>
                ) : (
                  <p className='text-[12px] text-gray-400'>
                    Choose an ID type to reveal the required uploads.
                  </p>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <div className='grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2'>
              <Field label='Phone' id='phone'>
                <IconInput
                  id='phone'
                  name='phone'
                  type='tel'
                  icon={Phone}
                  value={form.contactInfo.phone}
                  onChange={(e) =>
                    handleContactChange('contactInfo', 'whatsappSource', e)
                  }
                  placeholder='+233 ...'
                />
                <WhatsAppLink
                  checked={form.whatsappSource === 'phone'}
                  onChange={handleWhatsappSourceChange(
                    'contactInfo',
                    'whatsappSource',
                    'phone',
                  )}
                />
              </Field>

              <Field label='Other phone' id='altPhone'>
                <IconInput
                  id='altPhone'
                  name='altPhone'
                  type='tel'
                  icon={PhoneCall}
                  value={form.contactInfo.altPhone}
                  onChange={(e) =>
                    handleContactChange('contactInfo', 'whatsappSource', e)
                  }
                  placeholder='+233 ...'
                />
                <WhatsAppLink
                  checked={form.whatsappSource === 'altPhone'}
                  onChange={handleWhatsappSourceChange(
                    'contactInfo',
                    'whatsappSource',
                    'altPhone',
                  )}
                />
              </Field>

              {!form.whatsappSource && (
                <Field label='WhatsApp' id='whatsapp' className='sm:col-span-2'>
                  <IconInput
                    id='whatsapp'
                    name='whatsapp'
                    type='text'
                    icon={MessageCircle}
                    value={form.contactInfo.whatsapp}
                    onChange={(e) =>
                      handleContactChange('contactInfo', 'whatsappSource', e)
                    }
                    placeholder='Number or username'
                  />
                </Field>
              )}

              {form.whatsappSource ? (
                <div
                  className='sm:col-span-2 flex items-center gap-3 border border-[#20509b]/20 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/40 px-3.5 py-3 dark:border-blue-400/20 dark:from-blue-500/10 dark:via-[#0c1528] dark:to-blue-500/5'
                  style={softRadius}
                >
                  <span
                    className='grid size-9 shrink-0 place-items-center brand-gradient text-white shadow-[0_8px_18px_rgba(32,80,155,0.28)]'
                    style={chipRadius}
                  >
                    <MessageCircle className='size-3.5' strokeWidth={2} />
                  </span>
                  <div className='min-w-0'>
                    <p className='text-[12px] font-semibold text-gray-800 dark:text-gray-100'>
                      WhatsApp mirrors{' '}
                      {form.whatsappSource === 'phone'
                        ? 'primary phone'
                        : 'other phone'}
                    </p>
                    <p className='mt-0.5 truncate text-[11px] text-gray-500 dark:text-gray-400'>
                      {form.contactInfo.whatsapp ||
                        'Add a phone number above to sync WhatsApp.'}
                    </p>
                  </div>
                </div>
              ) : null}

              <Field label='Email' id='email' className='sm:col-span-2' required>
                <IconInput
                  id='email'
                  name='email'
                  type='email'
                  icon={Mail}
                  value={form.email}
                  onChange={handleChange}
                  placeholder='student@school.edu'
                  autoComplete='email'
                  required
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <>
              {selectedGuardian ? (
                <div
                  className='flex items-start gap-3 border border-[#20509b]/30 bg-blue-50/60 px-3.5 py-3 dark:border-blue-400/25 dark:bg-blue-500/10'
                  style={softRadius}
                >
                  {selectedGuardian.photo ? (
                    <img
                      src={selectedGuardian.photo}
                      alt=''
                      className='size-12 shrink-0 object-cover'
                      style={chipRadius}
                    />
                  ) : (
                    <span
                      className='grid size-12 shrink-0 place-items-center brand-gradient text-white'
                      style={chipRadius}
                    >
                      <Users className='size-5' strokeWidth={2} />
                    </span>
                  )}
                  <div className='min-w-0 flex-1'>
                    <p className='text-[13px] font-semibold text-gray-900 dark:text-gray-100'>
                      {[selectedGuardian.firstName, selectedGuardian.lastName]
                        .filter(Boolean)
                        .join(' ')}
                    </p>
                    <p className='mt-0.5 truncate text-[12px] text-gray-500 dark:text-gray-400'>
                      {selectedGuardian.email}
                    </p>
                    <p className='mt-1 text-[11px] font-medium text-[#20509b] dark:text-blue-300'>
                      Existing guardian selected
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={clearSelectedGuardian}
                    className='grid size-8 shrink-0 place-items-center text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-200'
                    aria-label='Clear selected guardian'
                  >
                    <X className='size-4' strokeWidth={2} />
                  </button>
                </div>
              ) : (
                <>
                  <div className='relative'>
                    <Field
                      label='Search existing guardian'
                      id='guardianSearch'
                      required={false}
                    >
                      <IconInput
                        id='guardianSearch'
                        name='guardianSearch'
                        type='search'
                        icon={Search}
                        value={guardianSearch}
                        onChange={(e) => setGuardianSearch(e.target.value)}
                        placeholder='Search by name or email'
                        autoComplete='off'
                      />
                    </Field>
                    <p className='mt-1.5 text-[11px] text-gray-500 dark:text-gray-400'>
                      Select a match to link an existing guardian, or leave
                      empty and fill in a new one below.
                    </p>

                    {(isSearchingGuardians ||
                      guardianResults.length > 0 ||
                      guardianSearch.trim().length >= 2) && (
                      <div
                        className='absolute z-20 mt-1 max-h-52 w-full overflow-y-auto border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-[#0c1528]'
                        style={softRadius}
                      >
                        {isSearchingGuardians ? (
                          <p className='px-3.5 py-3 text-[12px] text-gray-500'>
                            Searching…
                          </p>
                        ) : guardianResults.length === 0 ? (
                          <p className='px-3.5 py-3 text-[12px] text-gray-500'>
                            No guardians found. Add a new one below.
                          </p>
                        ) : (
                          guardianResults.map((guardian) => {
                            const name = [guardian.firstName, guardian.lastName]
                              .filter(Boolean)
                              .join(' ')
                            return (
                              <button
                                key={guardian._id}
                                type='button'
                                onClick={() => selectExistingGuardian(guardian)}
                                className='flex w-full items-center gap-3 border-b border-gray-100 px-3.5 py-2.5 text-left transition-colors last:border-b-0 hover:bg-blue-50/80 dark:border-white/8 dark:hover:bg-blue-500/10'
                              >
                                {guardian.photo ? (
                                  <img
                                    src={guardian.photo}
                                    alt=''
                                    className='size-9 shrink-0 object-cover'
                                    style={chipRadius}
                                  />
                                ) : (
                                  <span
                                    className='grid size-9 shrink-0 place-items-center bg-gray-100 text-gray-500 dark:bg-white/10'
                                    style={chipRadius}
                                  >
                                    <Users className='size-3.5' />
                                  </span>
                                )}
                                <span className='min-w-0'>
                                  <span className='block truncate text-[13px] font-medium text-gray-900 dark:text-gray-100'>
                                    {name}
                                  </span>
                                  <span className='block truncate text-[11px] text-gray-500 dark:text-gray-400'>
                                    {guardian.email}
                                  </span>
                                </span>
                              </button>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>

                  <div className='grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-[9.5rem_minmax(0,1fr)]'>
                    <div>
                      <p className={`${labelClass} mb-2`}>
                        Guardian photo
                        <span className='text-red-500'> *</span>
                      </p>
                      <UploadTile
                        id='guardianPhoto'
                        label='Guardian photo'
                        hint='Tap to upload'
                        preview={previews.guardianPhoto}
                        onChange={handleFileChange('guardianPhoto')}
                        tall
                        required
                      />
                    </div>
                    <div className='grid min-w-0 grid-cols-1 gap-3'>
                      <Field label='Full name' id='parentName'>
                        <IconInput
                          id='parentName'
                          name='parentName'
                          type='text'
                          icon={Users}
                          value={form.parentName}
                          onChange={handleChange}
                          placeholder='Parent or guardian name'
                          autoComplete='name'
                        />
                      </Field>
                      <ChoiceGroup
                        label='Relationship'
                        name='parentRelationship'
                        value={form.parentRelationship}
                        options={RELATIONSHIPS}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className='grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2'>
                    <Field label='Phone' id='guardianPhone' required>
                      <IconInput
                        id='guardianPhone'
                        name='phone'
                        type='tel'
                        icon={Phone}
                        value={form.guardianContactInfo.phone}
                        onChange={(e) =>
                          handleContactChange(
                            'guardianContactInfo',
                            'guardianWhatsappSource',
                            e,
                          )
                        }
                        placeholder='+233 ...'
                        required
                      />
                      <WhatsAppLink
                        checked={form.guardianWhatsappSource === 'phone'}
                        onChange={handleWhatsappSourceChange(
                          'guardianContactInfo',
                          'guardianWhatsappSource',
                          'phone',
                        )}
                      />
                    </Field>

                    <Field label='Other phone' id='guardianAltPhone'>
                      <IconInput
                        id='guardianAltPhone'
                        name='altPhone'
                        type='tel'
                        icon={PhoneCall}
                        value={form.guardianContactInfo.altPhone}
                        onChange={(e) =>
                          handleContactChange(
                            'guardianContactInfo',
                            'guardianWhatsappSource',
                            e,
                          )
                        }
                        placeholder='+233 ...'
                      />
                      <WhatsAppLink
                        checked={form.guardianWhatsappSource === 'altPhone'}
                        onChange={handleWhatsappSourceChange(
                          'guardianContactInfo',
                          'guardianWhatsappSource',
                          'altPhone',
                        )}
                      />
                    </Field>

                    {!form.guardianWhatsappSource && (
                      <Field
                        label='WhatsApp'
                        id='guardianWhatsapp'
                        className='sm:col-span-2'
                      >
                        <IconInput
                          id='guardianWhatsapp'
                          name='whatsapp'
                          type='text'
                          icon={MessageCircle}
                          value={form.guardianContactInfo.whatsapp}
                          onChange={(e) =>
                            handleContactChange(
                              'guardianContactInfo',
                              'guardianWhatsappSource',
                              e,
                            )
                          }
                          placeholder='Number or username'
                        />
                      </Field>
                    )}

                    {form.guardianWhatsappSource ? (
                      <div
                        className='sm:col-span-2 flex items-center gap-3 border border-[#20509b]/20 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/40 px-3.5 py-3 dark:border-blue-400/20 dark:from-blue-500/10 dark:via-[#0c1528] dark:to-blue-500/5'
                        style={softRadius}
                      >
                        <span
                          className='grid size-9 shrink-0 place-items-center brand-gradient text-white shadow-[0_8px_18px_rgba(32,80,155,0.28)]'
                          style={chipRadius}
                        >
                          <MessageCircle className='size-3.5' strokeWidth={2} />
                        </span>
                        <div className='min-w-0'>
                          <p className='text-[12px] font-semibold text-gray-800 dark:text-gray-100'>
                            WhatsApp mirrors{' '}
                            {form.guardianWhatsappSource === 'phone'
                              ? 'primary phone'
                              : 'other phone'}
                          </p>
                          <p className='mt-0.5 truncate text-[11px] text-gray-500 dark:text-gray-400'>
                            {form.guardianContactInfo.whatsapp ||
                              'Add a phone number above to sync WhatsApp.'}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    <Field
                      label='Email'
                      id='parentEmail'
                      className='sm:col-span-2'
                      required
                    >
                      <IconInput
                        id='parentEmail'
                        name='parentEmail'
                        type='email'
                        icon={Mail}
                        value={form.parentEmail}
                        onChange={handleChange}
                        placeholder='parent@email.com'
                        autoComplete='email'
                        required
                      />
                    </Field>

                    <Field label='Guardian ID type' id='guardianIdType'>
                      <Select
                        id='guardianIdType'
                        name='guardianIdType'
                        label='Guardian ID type'
                        placeholder='Select ID type'
                        icon={IdCard}
                        value={form.guardianIdType}
                        onChange={handleIdTypeChange(
                          'guardianIdType',
                          'guardianId',
                        )}
                        options={idTypeOptions}
                        searchable={false}
                      />
                    </Field>
                  </div>

                  <div>
                    <p className={`${labelClass} mb-2`}>Guardian ID</p>
                    {form.guardianIdType ? (
                      <div
                        className={`grid min-w-0 gap-3 ${
                          needsIdBack(form.guardianIdType)
                            ? 'grid-cols-1 sm:grid-cols-2'
                            : 'grid-cols-1'
                        }`}
                      >
                        {getIdSides(form.guardianIdType).map(
                          ({ key, label, required }) => (
                            <UploadTile
                              key={key}
                              id={`guardianId${key === 'front' ? 'Front' : 'Back'}`}
                              label={label}
                              hint='Clear scan preferred'
                              preview={
                                previews[
                                  `guardianId${key === 'front' ? 'Front' : 'Back'}`
                                ]
                              }
                              accept='image/*,application/pdf'
                              onChange={handleFileChange(
                                `guardianId${key === 'front' ? 'Front' : 'Back'}`,
                              )}
                              required={required}
                            />
                          ),
                        )}
                      </div>
                    ) : (
                      <p className='text-[12px] text-gray-400'>
                        Choose an ID type to reveal the required uploads.
                      </p>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {step === 4 && (
            <>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <Field label='Street' id='studentStreet' className='sm:col-span-2'>
                  <input
                    id='studentStreet'
                    name='street'
                    type='text'
                    maxLength={100}
                    value={form.studentAddress.street}
                    onChange={(e) => handleAddressChange('studentAddress', e)}
                    placeholder='Street address'
                    className={inputClass}
                  />
                </Field>
                <Field label='City' id='studentCity'>
                  <input
                    id='studentCity'
                    name='city'
                    type='text'
                    maxLength={50}
                    value={form.studentAddress.city}
                    onChange={(e) => handleAddressChange('studentAddress', e)}
                    placeholder='City'
                    className={inputClass}
                  />
                </Field>
                <Field label='Region' id='studentRegion'>
                  <input
                    id='studentRegion'
                    name='region'
                    type='text'
                    maxLength={50}
                    value={form.studentAddress.region}
                    onChange={(e) => handleAddressChange('studentAddress', e)}
                    placeholder='Region'
                    className={inputClass}
                  />
                </Field>
                <Field label='Postal code' id='studentPostalCode'>
                  <input
                    id='studentPostalCode'
                    name='postalCode'
                    type='text'
                    maxLength={10}
                    value={form.studentAddress.postalCode}
                    onChange={(e) => handleAddressChange('studentAddress', e)}
                    placeholder='Postal code'
                    className={inputClass}
                  />
                </Field>
                <Field label='Country' id='studentCountry'>
                  <input
                    id='studentCountry'
                    name='country'
                    type='text'
                    maxLength={50}
                    value={form.studentAddress.country}
                    onChange={(e) => handleAddressChange('studentAddress', e)}
                    placeholder='Country'
                    className={inputClass}
                  />
                </Field>
              </div>

              {!linkingExistingGuardian && (
                <>
                  <button
                    type='button'
                    onClick={() =>
                      handleSameAddressChange({
                        target: { checked: !form.sameAsStudentAddress },
                      })
                    }
                    className={`flex w-full items-center gap-3 border px-4 py-3 text-left transition-all duration-200 ${
                      form.sameAsStudentAddress
                        ? 'border-[#20509b]/35 bg-blue-50/70 dark:border-blue-400/30 dark:bg-blue-500/10'
                        : 'form-field border hover:border-gray-300 dark:hover:border-white/25'
                    }`}
                    style={softRadius}
                  >
                    <span
                      className={`grid size-5 shrink-0 place-items-center border text-[10px] font-bold ${
                        form.sameAsStudentAddress
                          ? 'brand-gradient border-transparent text-white'
                          : 'border-gray-300 text-transparent dark:border-gray-600'
                      }`}
                      style={{ borderRadius: '0.45rem 0.15rem 0.45rem 0.15rem' }}
                    >
                      ✓
                    </span>
                    <span>
                      <span className='block text-[13px] font-semibold text-gray-800 dark:text-gray-100'>
                        Same address for guardian
                      </span>
                      <span className='mt-0.5 block text-[12px] text-gray-500 dark:text-gray-400'>
                        Skip re-entering if they live at the same place.
                      </span>
                    </span>
                  </button>

                  {!form.sameAsStudentAddress && (
                    <div className='grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 sm:grid-cols-2 dark:border-white/8'>
                      <p className='sm:col-span-2 text-[12px] font-semibold tracking-[0.06em] text-gray-500 uppercase dark:text-gray-400'>
                        Guardian address
                      </p>
                      <Field
                        label='Street'
                        id='guardianStreet'
                        className='sm:col-span-2'
                      >
                        <input
                          id='guardianStreet'
                          name='street'
                          type='text'
                          maxLength={100}
                          value={form.guardianAddress.street}
                          onChange={(e) =>
                            handleAddressChange('guardianAddress', e)
                          }
                          placeholder='Street address'
                          className={inputClass}
                        />
                      </Field>
                      <Field label='City' id='guardianCity'>
                        <input
                          id='guardianCity'
                          name='city'
                          type='text'
                          maxLength={50}
                          value={form.guardianAddress.city}
                          onChange={(e) =>
                            handleAddressChange('guardianAddress', e)
                          }
                          placeholder='City'
                          className={inputClass}
                        />
                      </Field>
                      <Field label='Region' id='guardianRegion'>
                        <input
                          id='guardianRegion'
                          name='region'
                          type='text'
                          maxLength={50}
                          value={form.guardianAddress.region}
                          onChange={(e) =>
                            handleAddressChange('guardianAddress', e)
                          }
                          placeholder='Region'
                          className={inputClass}
                        />
                      </Field>
                      <Field label='Postal code' id='guardianPostalCode'>
                        <input
                          id='guardianPostalCode'
                          name='postalCode'
                          type='text'
                          maxLength={10}
                          value={form.guardianAddress.postalCode}
                          onChange={(e) =>
                            handleAddressChange('guardianAddress', e)
                          }
                          placeholder='Postal code'
                          className={inputClass}
                        />
                      </Field>
                      <Field label='Country' id='guardianCountry'>
                        <input
                          id='guardianCountry'
                          name='country'
                          type='text'
                          maxLength={50}
                          value={form.guardianAddress.country}
                          onChange={(e) =>
                            handleAddressChange('guardianAddress', e)
                          }
                          placeholder='Country'
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  )}
                </>
              )}
            </>
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
            <Button type='button' variant='primary' size='sm' onClick={handleNext}>
              Continue
              <ArrowRight className='size-3.5' strokeWidth={2} />
            </Button>
          ) : (
            <Button
              type='button'
              variant='primary'
              size='sm'
              loading={isSubmitting}
              onClick={handleEnrollStudent}
            >
              Enroll Student
            </Button>
          )}
        </div>
      </div>

      <style>{`
        .add-student-step {
          animation: addStudentIn 320ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .form-error {
          animation: formErrorIn 280ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes addStudentIn {
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

export default AddStudentForm

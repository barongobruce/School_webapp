import React, { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Camera,
  FileImage,
  Globe2,
  Hash,
  Home,
  IdCard,
  Mail,
  Map,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  Share2,
  UserRound,
  X,
} from 'lucide-react'
import useModal from '../../../hooks/useModal'
import Button from '../../../components/Button'
import IconInput from '../../../components/IconInput'
import Select from '../../../components/Select'
import { addGuardian } from '../../../lib/guardian.requests'
import {
  ID_TYPE_OPTIONS,
  getIdSides,
  needsIdBack,
} from '../../../lib/idTypes'

const STEPS = [
  { id: 'identity', label: 'Identity', icon: UserRound },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'address', label: 'Address', icon: Home },
  { id: 'social', label: 'Social', icon: Share2 },
]

const panelRadius = { borderRadius: '1.35rem 0.45rem 1.35rem 0.45rem' }
const chipRadius = { borderRadius: '1rem 0.3rem 1rem 0.3rem' }

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

const emptySocialMedia = {
  facebook: '',
  twitter: '',
  instagram: '',
  linkedin: '',
  youtube: '',
  website: '',
}

const emptyFiles = {
  photo: null,
  idFront: null,
  idBack: null,
}

const emptyPreviews = {
  photo: '',
  idFront: '',
  idBack: '',
}

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  idType: '',
  isActive: true,
  contactInfo: { ...emptyContactInfo },
  whatsappSource: '',
  address: { ...emptyAddress },
  socialMedia: { ...emptySocialMedia },
}

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

const Field = ({ label, id, children, className = '' }) => (
  <div className={`min-w-0 ${className}`}>
    <label htmlFor={id} className={labelClass}>
      {label}
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

const ChoiceGroup = ({ label, value, options, onChange, name, columns = 2 }) => (
  <div>
    <p className={labelClass}>{label}</p>
    <div
      className={`grid gap-2 ${
        columns === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'
      }`}
    >
      {options.map((option) => {
        const selected = value === option
        return (
          <button
            key={option}
            type='button'
            onClick={() => onChange({ target: { name, value: option } })}
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
    onClick={() => onChange({ target: { checked: !checked } })}
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
      {preview && preview !== 'pdf' ? (
        <div className='absolute inset-0 flex items-end bg-gradient-to-t from-[#08214e]/75 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
          <span className='text-[11px] font-medium text-white'>Replace photo</span>
        </div>
      ) : null}
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
  <nav aria-label='Add guardian steps' className='mb-6 min-w-0 overflow-hidden'>
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

const AddGuardian = ({ onSuccess }) => {
  const { close } = useModal()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [files, setFiles] = useState(emptyFiles)
  const [previews, setPreviews] = useState(emptyPreviews)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [demoEnrollment, setDemoEnrollment] = useState(false)
  const [error, setError] = useState('')
  const [stepKey, setStepKey] = useState(0)
  const previewUrlsRef = useRef(new Set())

  useEffect(() => {
    const trackedUrls = previewUrlsRef.current
    return () => {
      trackedUrls.forEach((url) => revokePreviewUrl(url))
      trackedUrls.clear()
    }
  }, [])

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

  const handleIdTypeChange = (event) => {
    const { value } = event.target
    setPreviews((prev) => ({
      ...prev,
      idFront: replaceTrackedUrl(prev.idFront, ''),
      idBack: replaceTrackedUrl(prev.idBack, ''),
    }))
    setFiles((prev) => ({ ...prev, idFront: null, idBack: null }))
    setForm((prev) => ({ ...prev, idType: value }))
  }

  const handleAddressChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }))
  }

  const handleSocialChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [name]: value },
    }))
  }

  const handleContactChange = (event) => {
    const { name, value } = event.target

    setForm((prev) => {
      const nextContact = { ...prev.contactInfo, [name]: value }
      let nextWhatsappSource = prev.whatsappSource

      if (prev.whatsappSource === name) {
        nextContact.whatsapp = value
      }

      if (name === 'whatsapp') {
        if (value && value === nextContact.phone) nextWhatsappSource = 'phone'
        else if (value && value === nextContact.altPhone) {
          nextWhatsappSource = 'altPhone'
        } else nextWhatsappSource = ''
      }

      return {
        ...prev,
        contactInfo: nextContact,
        whatsappSource: nextWhatsappSource,
      }
    })
  }

  const syncWhatsapp = (source, checked) => {
    setForm((prev) => {
      if (!checked) {
        return {
          ...prev,
          whatsappSource:
            prev.whatsappSource === source ? '' : prev.whatsappSource,
        }
      }

      const value =
        source === 'phone' ? prev.contactInfo.phone : prev.contactInfo.altPhone

      return {
        ...prev,
        whatsappSource: source,
        contactInfo: {
          ...prev.contactInfo,
          whatsapp: value || '',
        },
      }
    })
  }

  const handleFileChange = (key) => (event) => {
    const file = event.target.files?.[0] || null
    const nextPreview = createPreviewUrl(file, previewUrlsRef)

    setPreviews((prev) => ({
      ...prev,
      [key]: replaceTrackedUrl(prev[key], nextPreview),
    }))
    setFiles((prev) => ({ ...prev, [key]: file }))
  }

  const goToStep = (next) => {
    setError('')
    setStep(next)
    setStepKey((key) => key + 1)
  }

  const validateStep = (index) => {
    if (index === 0) {
      if (!form.firstName.trim()) return 'Please enter a first name.'
      if (!form.lastName.trim()) return 'Please enter a last name.'
      if (!form.email.trim()) return 'Please enter an email.'
      if (!form.idType) return 'Please select an ID type.'
      if (!files.idFront) return 'Please upload the ID front document.'
      if (needsIdBack(form.idType) && !files.idBack) {
        return 'Please upload the ID back document.'
      }
    }

    if (index === 1) {
      if (!form.contactInfo.phone.trim()) {
        return 'Please enter a phone number.'
      }
    }

    if (index === 2) {
      const { street, city, region, postalCode, country } = form.address
      if (
        !street.trim() ||
        !city.trim() ||
        !region.trim() ||
        !postalCode.trim() ||
        !country.trim()
      ) {
        return 'Please complete the guardian address.'
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

  const handleJump = (index) => {
    if (index <= step) {
      goToStep(index)
      return
    }

    for (let i = 0; i < index; i += 1) {
      const message = validateStep(i)
      if (message) {
        setError(message)
        goToStep(i)
        return
      }
    }

    goToStep(index)
  }

  const handleCreateGuardian = async () => {
    for (let i = 0; i < STEPS.length; i += 1) {
      const message = validateStep(i)
      if (message) {
        setError(message)
        goToStep(i)
        return
      }
    }

    setError('')
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('firstName', form.firstName.trim())
      formData.append('lastName', form.lastName.trim())
      formData.append('email', form.email.trim())
      formData.append('demoEnrollment', String(demoEnrollment))
      formData.append('idType', form.idType)
      formData.append('isActive', String(form.isActive))
      formData.append('contactInfo', JSON.stringify(form.contactInfo))
      formData.append('address', JSON.stringify(form.address))
      formData.append('socialMedia', JSON.stringify(form.socialMedia))

      if (files.photo) formData.append('photo', files.photo)
      if (files.idFront) formData.append('idFront', files.idFront)
      if (files.idBack) formData.append('idBack', files.idBack)

      const data = await addGuardian(formData)
      onSuccess?.(data.guardian || data)
      close()
    } catch (err) {
      setError(err.message || 'Failed to create guardian.')
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
        <ProgressRail step={step} onJump={handleJump} />

        <div
          className='relative min-w-0 overflow-hidden border border-gray-200/60 bg-gradient-to-br from-white via-white to-blue-50/50 p-4 dark:border-white/8 dark:from-[#0f1a30] dark:via-[#0c1528] dark:to-[#152848]/60 sm:p-5'
          style={panelRadius}
        >
          {error ? <FormError message={error} onDismiss={() => setError('')} /> : null}

          <div key={stepKey} className='add-guardian-step space-y-4'>
            {step === 0 && (
              <>
                <div className='grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-[9.5rem_minmax(0,1fr)]'>
                  <div>
                    <p className={`${labelClass} mb-2`}>Photo</p>
                    <UploadTile
                      id='add-guardian-photo'
                      label='Profile photo'
                      hint='Tap to upload'
                      preview={previews.photo}
                      onChange={handleFileChange('photo')}
                      tall
                    />
                  </div>

                  <div className='grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2'>
                    <Field label='First name' id='add-guardian-firstName'>
                      <IconInput
                        id='add-guardian-firstName'
                        name='firstName'
                        icon={UserRound}
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder='First name'
                        autoComplete='given-name'
                      />
                    </Field>
                    <Field label='Last name' id='add-guardian-lastName'>
                      <IconInput
                        id='add-guardian-lastName'
                        name='lastName'
                        icon={UserRound}
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder='Last name'
                        autoComplete='family-name'
                      />
                    </Field>
                    <Field label='Email' id='add-guardian-email' className='sm:col-span-2'>
                      <IconInput
                        id='add-guardian-email'
                        name='email'
                        type='email'
                        icon={Mail}
                        value={form.email}
                        onChange={handleChange}
                        placeholder='guardian@email.com'
                        autoComplete='email'
                      />
                    </Field>
                  </div>
                </div>

                <Field label='ID type' id='add-guardian-idType'>
                  <Select
                    id='add-guardian-idType'
                    name='idType'
                    label='ID type'
                    placeholder='Select ID type'
                    icon={IdCard}
                    value={form.idType}
                    onChange={handleIdTypeChange}
                    options={ID_TYPE_OPTIONS}
                    searchable={false}
                  />
                </Field>

                <ChoiceGroup
                  label='Status'
                  name='isActive'
                  value={form.isActive ? 'Active' : 'Inactive'}
                  options={['Active', 'Inactive']}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      isActive: event.target.value === 'Active',
                    }))
                  }
                />

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
                          id={`add-guardian-id${
                            key === 'front' ? 'Front' : 'Back'
                          }`}
                          label={label}
                          hint='Image or PDF'
                          preview={
                            previews[`id${key === 'front' ? 'Front' : 'Back'}`]
                          }
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

            {step === 1 && (
              <div className='grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2'>
                <Field label='Phone' id='add-guardian-phone'>
                  <IconInput
                    id='add-guardian-phone'
                    name='phone'
                    type='tel'
                    icon={Phone}
                    value={form.contactInfo.phone}
                    onChange={handleContactChange}
                    placeholder='Primary phone'
                    autoComplete='tel'
                  />
                  <WhatsAppLink
                    checked={form.whatsappSource === 'phone'}
                    disabled={!form.contactInfo.phone.trim()}
                    onChange={(event) =>
                      syncWhatsapp('phone', event.target.checked)
                    }
                  />
                </Field>

                <Field label='Other phone' id='add-guardian-altPhone'>
                  <IconInput
                    id='add-guardian-altPhone'
                    name='altPhone'
                    type='tel'
                    icon={PhoneCall}
                    value={form.contactInfo.altPhone}
                    onChange={handleContactChange}
                    placeholder='Alternate phone'
                  />
                  <WhatsAppLink
                    checked={form.whatsappSource === 'altPhone'}
                    disabled={!form.contactInfo.altPhone.trim()}
                    onChange={(event) =>
                      syncWhatsapp('altPhone', event.target.checked)
                    }
                  />
                </Field>

                <Field label='WhatsApp' id='add-guardian-whatsapp' className='sm:col-span-2'>
                  <IconInput
                    id='add-guardian-whatsapp'
                    name='whatsapp'
                    type='tel'
                    icon={MessageCircle}
                    value={form.contactInfo.whatsapp}
                    onChange={handleContactChange}
                    placeholder='WhatsApp number'
                  />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className='grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2'>
                <Field label='Street' id='add-guardian-street' className='sm:col-span-2'>
                  <IconInput
                    id='add-guardian-street'
                    name='street'
                    icon={MapPin}
                    value={form.address.street}
                    onChange={handleAddressChange}
                    placeholder='Street address'
                    autoComplete='street-address'
                  />
                </Field>
                <Field label='City' id='add-guardian-city'>
                  <IconInput
                    id='add-guardian-city'
                    name='city'
                    icon={Building2}
                    value={form.address.city}
                    onChange={handleAddressChange}
                    placeholder='City'
                    autoComplete='address-level2'
                  />
                </Field>
                <Field label='Region' id='add-guardian-region'>
                  <IconInput
                    id='add-guardian-region'
                    name='region'
                    icon={Map}
                    value={form.address.region}
                    onChange={handleAddressChange}
                    placeholder='Region / state'
                    autoComplete='address-level1'
                  />
                </Field>
                <Field label='Postal code' id='add-guardian-postalCode'>
                  <IconInput
                    id='add-guardian-postalCode'
                    name='postalCode'
                    icon={Hash}
                    value={form.address.postalCode}
                    onChange={handleAddressChange}
                    placeholder='Postal code'
                    autoComplete='postal-code'
                  />
                </Field>
                <Field label='Country' id='add-guardian-country'>
                  <IconInput
                    id='add-guardian-country'
                    name='country'
                    icon={Globe2}
                    value={form.address.country}
                    onChange={handleAddressChange}
                    placeholder='Country'
                    autoComplete='country-name'
                  />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className='grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2'>
                {[
                  ['facebook', 'Facebook'],
                  ['twitter', 'Twitter / X'],
                  ['instagram', 'Instagram'],
                  ['linkedin', 'LinkedIn'],
                  ['youtube', 'YouTube'],
                  ['website', 'Website'],
                ].map(([name, label]) => (
                  <Field key={name} label={label} id={`add-guardian-${name}`}>
                    <IconInput
                      id={`add-guardian-${name}`}
                      name={name}
                      icon={Globe2}
                      value={form.socialMedia[name]}
                      onChange={handleSocialChange}
                      placeholder='https://…'
                    />
                  </Field>
                ))}
                <p className='sm:col-span-2 text-[12px] text-gray-500 dark:text-gray-400'>
                  Social links are optional. {demoEnrollment
                    ? 'Demo accounts use the shared password configured on the API; no email is sent.'
                    : 'A login password will be generated and emailed automatically.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {step === STEPS.length - 1 ? (
          <label className='flex cursor-pointer items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-3 text-[12px] text-gray-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-gray-200'>
            <input type='checkbox' checked={demoEnrollment} onChange={(event) => setDemoEnrollment(event.target.checked)} className='mt-0.5 accent-blue-700' />
            <span>
              <span className='block font-semibold'>Create demo account without email</span>
              <span className='mt-0.5 block text-[11px] text-gray-500 dark:text-gray-400'>
                Uses the shared demo password configured on the API. No credential email will be sent.
              </span>
            </span>
          </label>
        ) : null}

        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={close}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <div className='flex flex-col-reverse gap-2 sm:flex-row'>
            {step > 0 ? (
              <Button
                type='button'
                variant='secondary'
                size='sm'
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ArrowLeft className='size-3.5' strokeWidth={2} />
                Back
              </Button>
            ) : null}

            {step < STEPS.length - 1 ? (
              <Button
                type='button'
                variant='primary'
                size='sm'
                onClick={handleNext}
              >
                Next
                <ArrowRight className='size-3.5' strokeWidth={2} />
              </Button>
            ) : (
              <Button
                type='button'
                variant='primary'
                size='sm'
                loading={isSubmitting}
                onClick={handleCreateGuardian}
              >
                Create Guardian
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}

export default AddGuardian

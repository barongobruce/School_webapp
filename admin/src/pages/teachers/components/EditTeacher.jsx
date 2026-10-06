import React, { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  Building2,
  Camera,
  FileImage,
  Globe2,
  Hash,
  Home,
  IdCard,
  Mail,
  Map as MapIcon,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  School,
  UserRound,
  X,
} from 'lucide-react'
import useModal from '../../../hooks/useModal'
import Button from '../../../components/Button'
import IconInput from '../../../components/IconInput'
import Select from '../../../components/Select'
import { getClasses } from '../../../lib/class.requests'
import { updateTeacher } from '../../../lib/teacher.requests'
import {
  ID_TYPE_OPTIONS,
  getIdSides,
  needsIdBack,
  normalizeIdType,
} from '../../../lib/idTypes'
import ClassPicker from './ClassPicker'

const softRadius = { borderRadius: '0.95rem 0.3rem 0.95rem 0.3rem' }
const panelRadius = { borderRadius: '1.35rem 0.45rem 1.35rem 0.45rem' }
const chipRadius = { borderRadius: '1rem 0.3rem 1rem 0.3rem' }

const labelClass =
  'mb-1.5 block text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase dark:text-gray-400'

const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(String(value).trim())

const STEPS = [
  { id: 'identity', label: 'Identity', icon: UserRound },
  { id: 'credentials', label: 'Credentials', icon: Award },
  { id: 'identity-docs', label: 'ID Docs', icon: IdCard },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'classes', label: 'Classes', icon: School },
  { id: 'address', label: 'Address', icon: Home },
]

const QUALIFICATION_SLOTS = [
  {
    key: 0,
    label: 'Certificate 1',
    placeholder: 'e.g. BSc Education',
    required: true,
  },
  {
    key: 1,
    label: 'Certificate 2',
    placeholder: "e.g. Master's Degree",
    required: false,
  },
  {
    key: 2,
    label: 'Certificate 3',
    placeholder: 'e.g. Teaching Diploma',
    required: false,
  },
]

const isPdfUrl = (url) => url?.toLowerCase().includes('.pdf')

const getPreviewFromDoc = (file, preview, existingUrl) => {
  if (preview) return preview
  if (existingUrl) return isPdfUrl(existingUrl) ? 'pdf' : existingUrl
  return ''
}

const getWhatsappSource = (contact = {}) => {
  if (contact.whatsapp && contact.whatsapp === contact.phone) return 'phone'
  if (contact.whatsapp && contact.whatsapp === contact.altPhone) return 'altPhone'
  return null
}

const padQualifications = (items = []) => {
  const slots = items.map((item) => ({
    title: item.title || '',
    file: null,
    existingDocument: item.document || '',
  }))

  while (slots.length < 3) {
    slots.push({ title: '', file: null, existingDocument: '' })
  }

  return slots.slice(0, 3)
}

const getClassIds = (classes = []) =>
  classes
    .map((classItem) => {
      if (typeof classItem === 'string') return classItem
      return classItem?._id || classItem?.id || ''
    })
    .filter(Boolean)
    .map(String)

const teacherToForm = (teacher) => {
  const user = teacher?.user && typeof teacher.user === 'object' ? teacher.user : null
  const contactInfo = teacher.contactInfo || user?.contactInfo || {}
  const address = teacher.address || user?.address || {}
  const photo = teacher.picture || teacher.photo || user?.photo || ''

  return {
    firstName: teacher.firstName || user?.firstName || '',
    lastName: teacher.lastName || user?.lastName || '',
    email: teacher.email || user?.email || '',
    isActive:
      typeof teacher.isActive === 'boolean'
        ? teacher.isActive
        : typeof user?.isActive === 'boolean'
          ? user.isActive
          : true,
    qualifications: padQualifications(teacher.qualifications),
    picture: null,
    existingPicture: photo,
    identification: {
      type: normalizeIdType(teacher.identification?.type ?? ''),
      files: { front: null, back: null },
      existing: {
        front: teacher.identification?.front ?? '',
        back: teacher.identification?.back ?? '',
      },
    },
    contactInfo: {
      phone: contactInfo.phone ?? '',
      altPhone: contactInfo.altPhone ?? '',
      whatsapp: contactInfo.whatsapp ?? '',
    },
    classes: getClassIds(teacher.classes),
    address: {
      street: address.street ?? '',
      city: address.city ?? '',
      state: address.state ?? '',
      zip: address.zip ?? '',
      country: address.country ?? '',
    },
  }
}

const Field = ({ label, id, children, className = '', hint, required = false }) => (
  <div className={`min-w-0 ${className}`}>
    <label htmlFor={id} className={labelClass}>
      {label}
      {required ? <span className='text-red-500'> *</span> : null}
    </label>
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

const WhatsAppLink = ({ checked, onChange }) => (
  <button
    type='button'
    aria-pressed={checked}
    onClick={() => onChange({ target: { checked: !checked } })}
    className={`mt-2 inline-flex h-9 items-center gap-2 px-3 text-[12px] font-semibold transition-all duration-200 ${
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

const ProgressRail = ({ step, onJump }) => (
  <nav aria-label='Edit teacher steps' className='mb-6 min-w-0 overflow-hidden'>
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

const PhotoUpload = ({
  id,
  preview,
  onChange,
  label = 'Profile photo',
  required = false,
}) => (
  <label
    htmlFor={id}
    className='group relative flex h-40 cursor-pointer flex-col overflow-hidden border border-dashed border-gray-200/80 bg-gradient-to-br from-gray-50/90 via-white to-blue-50/40 transition-all duration-300 hover:border-[#20509b]/45 hover:shadow-[0_12px_28px_rgba(8,33,78,0.08)] dark:border-white/10 dark:from-[#0c1528] dark:via-[#0f1a30] dark:to-[#152848] dark:hover:border-blue-400/40'
    style={panelRadius}
  >
    <div className='relative flex size-full items-center justify-center overflow-hidden'>
      {preview ? (
        <>
          <img
            src={preview}
            alt=''
            className='size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]'
          />
          <div className='absolute inset-0 flex items-end bg-gradient-to-t from-[#08214e]/75 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
            <span className='text-[11px] font-medium text-white'>Replace photo</span>
          </div>
        </>
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
            <p className='mt-0.5 text-[11px] text-gray-400'>Tap to upload</p>
          </div>
        </div>
      )}
    </div>
    <input id={id} type='file' accept='image/*' onChange={onChange} className='sr-only' />
  </label>
)

const DocUploadSlot = ({
  id,
  label,
  required,
  file,
  preview,
  existingUrl,
  onChange,
  onClear,
  titleId,
  titleValue = '',
  titlePlaceholder,
  onTitleChange,
}) => {
  const displayPreview = getPreviewFromDoc(file, preview, existingUrl)
  const hasDocument = Boolean(file || existingUrl)

  return (
    <div
      className='overflow-hidden border border-dashed border-gray-200/80 bg-gradient-to-br from-gray-50/90 via-white to-blue-50/30 p-3 dark:border-white/10 dark:from-[#0c1528] dark:via-[#0f1a30] dark:to-[#152848]/50'
      style={panelRadius}
    >
      <p className='mb-2 text-[12px] font-semibold text-gray-700 dark:text-gray-200'>
        {label}
        {required && !hasDocument && <span className='text-red-500'> *</span>}
      </p>

      {onTitleChange && (
        <IconInput
          id={titleId}
          type='text'
          icon={Award}
          value={titleValue}
          onChange={onTitleChange}
          placeholder={titlePlaceholder}
          className='mb-2'
        />
      )}

      {displayPreview ? (
        <div
          className='form-field relative mb-2 overflow-hidden border'
          style={softRadius}
        >
          {file?.type === 'application/pdf' || displayPreview === 'pdf' ? (
            <div className='flex h-28 flex-col items-center justify-center gap-1 text-gray-500 dark:text-gray-400'>
              <FileImage className='size-6' strokeWidth={1.5} />
              <span className='max-w-full truncate px-2 text-[12px]'>
                {file?.name || 'PDF document'}
              </span>
            </div>
          ) : (
            <img
              src={displayPreview}
              alt={`${label} preview`}
              className='h-28 w-full object-cover'
            />
          )}
          <button
            type='button'
            onClick={onClear}
            className='absolute top-1.5 right-1.5 bg-black/55 p-1 text-white transition-colors hover:bg-black/70'
            style={{ borderRadius: '0.55rem 0.18rem 0.55rem 0.18rem' }}
            aria-label={`Remove ${label}`}
          >
            <X className='size-3.5' strokeWidth={2} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className='form-field mb-2 flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 border transition-colors hover:border-[#20509b]/35 dark:hover:border-blue-400/30'
          style={softRadius}
        >
          <FileImage
            className='size-6 text-gray-300 dark:text-gray-600'
            strokeWidth={1.5}
          />
          <span className='text-[11px] font-medium text-gray-400'>
            Upload image or PDF
          </span>
        </label>
      )}

      <input
        id={id}
        type='file'
        accept='image/*,.pdf'
        onChange={onChange}
        className='sr-only'
      />
      <label
        htmlFor={id}
        className='inline-flex cursor-pointer text-[11px] font-semibold text-[#20509b] hover:underline dark:text-blue-300'
      >
        {displayPreview ? 'Replace file' : 'Choose file'}
      </label>
    </div>
  )
}

const EditTeacher = ({ teacher, onSuccess }) => {
  const { close } = useModal()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => teacherToForm(teacher))
  const [classes, setClasses] = useState(() =>
    (teacher.classes || []).filter(
      (classItem) => classItem && typeof classItem === 'object',
    ),
  )
  const [classesLoading, setClassesLoading] = useState(true)
  const [classesLoadError, setClassesLoadError] = useState('')
  const [picturePreview, setPicturePreview] = useState(
    () => teacher.picture || teacher.photo || teacher.user?.photo || '',
  )
  const [idPreviews, setIdPreviews] = useState({
    front: teacher.identification?.front || '',
    back: teacher.identification?.back || '',
  })
  const [qualificationPreviews, setQualificationPreviews] = useState(() =>
    padQualifications(teacher.qualifications).map((item) =>
      item.existingDocument
        ? isPdfUrl(item.existingDocument)
          ? 'pdf'
          : item.existingDocument
        : '',
    ),
  )
  const [whatsappSource, setWhatsappSource] = useState(() =>
    getWhatsappSource(teacher.contactInfo || teacher.user?.contactInfo),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [stepKey, setStepKey] = useState(0)

  const selectedIdSides = getIdSides(form.identification.type)

  const idTypeOptions = ID_TYPE_OPTIONS

  useEffect(() => {
    return () => {
      if (picturePreview?.startsWith('blob:')) URL.revokeObjectURL(picturePreview)
      Object.values(idPreviews).forEach((url) => {
        if (url && url !== 'pdf' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
      qualificationPreviews.forEach((url) => {
        if (url && url !== 'pdf' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [picturePreview, idPreviews, qualificationPreviews])

  useEffect(() => {
    let cancelled = false

    const mergeAssignedClasses = (catalogList = []) => {
      const catalog = new Map(
        catalogList
          .filter((classItem) => classItem && typeof classItem === 'object')
          .map((classItem) => [
            String(classItem._id || classItem.id),
            classItem,
          ]),
      )

      ;(teacher.classes || []).forEach((classItem) => {
        if (!classItem || typeof classItem !== 'object') return
        const id = String(classItem._id || classItem.id || '')
        if (id && !catalog.has(id)) catalog.set(id, classItem)
      })

      return [...catalog.values()]
    }

    const loadClasses = async () => {
      setClassesLoading(true)
      setClassesLoadError('')
      try {
        const data = await getClasses({ isActive: true })
        if (cancelled) return
        setClasses(mergeAssignedClasses(data?.classes || []))
      } catch (err) {
        if (cancelled) return
        setClasses((prev) => mergeAssignedClasses(prev))
        setClassesLoadError(err.message || 'Failed to load classes.')
      } finally {
        if (!cancelled) setClassesLoading(false)
      }
    }

    loadClasses()

    return () => {
      cancelled = true
    }
    // Load once when the edit modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setForm((prev) => {
        const nextParent = {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        }

        if (
          parent === 'contactInfo' &&
          whatsappSource &&
          (child === 'phone' || child === 'altPhone') &&
          child === whatsappSource
        ) {
          nextParent.whatsapp = value
        }

        return { ...prev, [parent]: nextParent }
      })
      return
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleWhatsappSourceChange = (source) => (event) => {
    const { checked } = event.target

    if (!checked) {
      setWhatsappSource(null)
      setForm((prev) => ({
        ...prev,
        contactInfo: { ...prev.contactInfo, whatsapp: '' },
      }))
      return
    }

    setWhatsappSource(source)
    setForm((prev) => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        whatsapp: prev.contactInfo[source] || '',
      },
    }))
  }

  const handleIdTypeChange = (event) => {
    const type = event.target.value

    setIdPreviews((prev) => {
      Object.values(prev).forEach((url) => {
        if (url && url !== 'pdf' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
      return { front: '', back: '' }
    })

    setForm((prev) => ({
      ...prev,
      identification: {
        type,
        files: { front: null, back: null },
        existing: { front: '', back: '' },
      },
    }))
  }

  const handlePictureChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setForm((prev) => ({ ...prev, picture: file, existingPicture: '' }))
    setPicturePreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const handleIdFileChange = (side) => (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setForm((prev) => ({
      ...prev,
      identification: {
        ...prev.identification,
        files: { ...prev.identification.files, [side]: file },
        existing: { ...prev.identification.existing, [side]: '' },
      },
    }))

    setIdPreviews((prev) => {
      if (prev[side] && prev[side] !== 'pdf' && prev[side].startsWith('blob:')) {
        URL.revokeObjectURL(prev[side])
      }
      return {
        ...prev,
        [side]: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : 'pdf',
      }
    })
  }

  const clearIdFile = (side) => {
    setForm((prev) => ({
      ...prev,
      identification: {
        ...prev.identification,
        files: { ...prev.identification.files, [side]: null },
        existing: { ...prev.identification.existing, [side]: '' },
      },
    }))

    setIdPreviews((prev) => {
      if (prev[side] && prev[side] !== 'pdf' && prev[side].startsWith('blob:')) {
        URL.revokeObjectURL(prev[side])
      }
      return { ...prev, [side]: '' }
    })
  }

  const handleQualificationTitleChange = (index) => (event) => {
    const { value } = event.target
    setForm((prev) => {
      const qualifications = [...prev.qualifications]
      qualifications[index] = { ...qualifications[index], title: value }
      return { ...prev, qualifications }
    })
  }

  const handleQualificationFileChange = (index) => (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setForm((prev) => {
      const qualifications = [...prev.qualifications]
      qualifications[index] = {
        ...qualifications[index],
        file,
        existingDocument: '',
      }
      return { ...prev, qualifications }
    })

    setQualificationPreviews((prev) => {
      const next = [...prev]
      if (next[index] && next[index] !== 'pdf' && next[index].startsWith('blob:')) {
        URL.revokeObjectURL(next[index])
      }
      next[index] = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : 'pdf'
      return next
    })
  }

  const clearQualificationFile = (index) => {
    setForm((prev) => {
      const qualifications = [...prev.qualifications]
      qualifications[index] = { title: '', file: null, existingDocument: '' }
      return { ...prev, qualifications }
    })

    setQualificationPreviews((prev) => {
      const next = [...prev]
      if (next[index] && next[index] !== 'pdf' && next[index].startsWith('blob:')) {
        URL.revokeObjectURL(next[index])
      }
      next[index] = ''
      return next
    })
  }

  const goToStep = (next) => {
    setError('')
    setStep(next)
    setStepKey((k) => k + 1)
  }

  const validateStep = (index) => {
    if (index === 0) {
      if (!form.picture && !form.existingPicture && !picturePreview) {
        return 'Please upload a teacher profile photo.'
      }
      if (!form.firstName.trim() || !form.lastName.trim()) {
        return 'Please enter the teacher’s first and last name.'
      }
      if (!form.email.trim()) return 'Please enter the teacher email.'
      if (!isValidEmail(form.email)) {
        return 'Please enter a valid teacher email.'
      }
    }

    if (index === 1) {
      const kept = form.qualifications.filter(
        (item) => item.file || item.existingDocument,
      )
      if (kept.length < 1) {
        return 'Please keep at least one qualification document.'
      }
    }

    if (index === 2) {
      if (!form.identification.type) {
        return 'Please select an identification type.'
      }
      const hasFront =
        form.identification.files.front || form.identification.existing.front
      const hasBack =
        form.identification.files.back || form.identification.existing.back
      if (!hasFront) return 'Please provide the front ID document.'
      if (needsIdBack(form.identification.type) && !hasBack) {
        return 'Please provide the back ID document.'
      }
    }

    if (index === 4) {
      if (!form.classes.length) {
        return 'Please assign at least one class to this teacher.'
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

  const handleSaveChanges = async () => {
    if (step !== STEPS.length - 1 || isSubmitting) return

    for (let i = 0; i < STEPS.length; i += 1) {
      const stepError = validateStep(i)
      if (stepError) {
        setError(stepError)
        goToStep(i)
        return
      }
    }

    setError('')
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('firstName', form.firstName.trim())
    formData.append('lastName', form.lastName.trim())
    formData.append('email', form.email.trim())
    formData.append('isActive', String(form.isActive))
    formData.append('contactInfo', JSON.stringify(form.contactInfo))
    formData.append('address', JSON.stringify(form.address))
    formData.append('classes', JSON.stringify(form.classes))
    formData.append('identificationType', form.identification.type)
    formData.append(
      'qualificationTitles',
      JSON.stringify(form.qualifications.map((item) => item.title.trim())),
    )
    formData.append(
      'existingQualifications',
      JSON.stringify(
        form.qualifications.map((item) => ({
          title: item.title.trim(),
          document: item.existingDocument || '',
        })),
      ),
    )

    if (form.picture) formData.append('picture', form.picture)

    form.qualifications.forEach((item, index) => {
      if (item.file) formData.append(`qualification${index}`, item.file)
    })

    if (form.identification.files.front) {
      formData.append('idFront', form.identification.files.front)
    }
    if (form.identification.files.back) {
      formData.append('idBack', form.identification.files.back)
    }

    try {
      await updateTeacher(teacher._id, formData)
      onSuccess?.()
      close()
    } catch (err) {
      setError(err.message || 'Failed to update teacher.')
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

          <div key={stepKey} className='edit-teacher-step space-y-4'>
            {step === 0 && (
              <>
                <div className='grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-[9.5rem_minmax(0,1fr)]'>
                  <PhotoUpload
                    id='edit-teacher-picture'
                    preview={picturePreview}
                    onChange={handlePictureChange}
                    required
                  />
                  <div className='grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2'>
                    <Field label='First name' id='edit-teacher-firstName'>
                      <IconInput
                        id='edit-teacher-firstName'
                        name='firstName'
                        icon={UserRound}
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder='e.g. Daniel'
                        autoComplete='given-name'
                      />
                    </Field>
                    <Field label='Last name' id='edit-teacher-lastName'>
                      <IconInput
                        id='edit-teacher-lastName'
                        name='lastName'
                        icon={UserRound}
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder='e.g. Mutebi'
                        autoComplete='family-name'
                      />
                    </Field>
                    <Field
                      label='Email'
                      id='edit-teacher-email'
                      className='sm:col-span-2'
                      required
                    >
                      <IconInput
                        id='edit-teacher-email'
                        name='email'
                        type='email'
                        icon={Mail}
                        value={form.email}
                        onChange={handleChange}
                        placeholder='teacher@school.edu'
                        autoComplete='email'
                        required
                      />
                    </Field>
                  </div>
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
              <>
                <p className='text-[13px] leading-relaxed text-gray-500 dark:text-gray-400'>
                  Replace a certificate only if needed. Existing documents are kept
                  unless you upload a new file.
                </p>
                <div className='grid min-w-0 grid-cols-1 gap-3'>
                  {QUALIFICATION_SLOTS.map(
                    ({ key, label, placeholder, required }) => (
                      <DocUploadSlot
                        key={key}
                        id={`edit-teacher-qualification-file-${key}`}
                        label={label}
                        required={required}
                        file={form.qualifications[key].file}
                        preview={qualificationPreviews[key]}
                        existingUrl={form.qualifications[key].existingDocument}
                        onChange={handleQualificationFileChange(key)}
                        onClear={() => clearQualificationFile(key)}
                        titleId={`edit-teacher-qualification-title-${key}`}
                        titleValue={form.qualifications[key].title}
                        titlePlaceholder={placeholder}
                        onTitleChange={handleQualificationTitleChange(key)}
                      />
                    ),
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <Field label='ID type' id='edit-teacher-id-type'>
                  <Select
                    id='edit-teacher-id-type'
                    name='identification.type'
                    label='ID type'
                    placeholder='Select ID type'
                    icon={IdCard}
                    value={form.identification.type}
                    onChange={handleIdTypeChange}
                    options={idTypeOptions}
                    searchable={false}
                  />
                </Field>

                {form.identification.type ? (
                  <div
                    className={`grid min-w-0 gap-3 ${
                      needsIdBack(form.identification.type)
                        ? 'grid-cols-1 sm:grid-cols-2'
                        : 'grid-cols-1'
                    }`}
                  >
                    {selectedIdSides.map(({ key, label, required }) => (
                      <DocUploadSlot
                        key={key}
                        id={`edit-teacher-id-${key}`}
                        label={label}
                        required={required}
                        file={form.identification.files[key]}
                        preview={idPreviews[key]}
                        existingUrl={form.identification.existing[key]}
                        onChange={handleIdFileChange(key)}
                        onClear={() => clearIdFile(key)}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className='flex items-center gap-3 border border-dashed border-gray-200/80 bg-gray-50/60 px-4 py-6 dark:border-white/10 dark:bg-white/5'
                    style={softRadius}
                  >
                    <span
                      className='grid size-10 shrink-0 place-items-center border border-gray-200/70 bg-white text-[#20509b] dark:border-white/10 dark:bg-[#152238] dark:text-blue-300'
                      style={chipRadius}
                    >
                      <IdCard className='size-4' strokeWidth={1.75} />
                    </span>
                    <p className='text-[13px] text-gray-500 dark:text-gray-400'>
                      Choose an ID type to reveal the required uploads.
                    </p>
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <div className='grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2'>
                <Field label='Phone' id='edit-teacher-phone'>
                  <IconInput
                    id='edit-teacher-phone'
                    name='contactInfo.phone'
                    type='tel'
                    icon={Phone}
                    value={form.contactInfo.phone}
                    onChange={handleChange}
                    placeholder='+233 ...'
                  />
                  <WhatsAppLink
                    checked={whatsappSource === 'phone'}
                    onChange={handleWhatsappSourceChange('phone')}
                  />
                </Field>

                <Field label='Alternate phone' id='edit-teacher-altPhone'>
                  <IconInput
                    id='edit-teacher-altPhone'
                    name='contactInfo.altPhone'
                    type='tel'
                    icon={PhoneCall}
                    value={form.contactInfo.altPhone}
                    onChange={handleChange}
                    placeholder='+233 ...'
                  />
                  <WhatsAppLink
                    checked={whatsappSource === 'altPhone'}
                    onChange={handleWhatsappSourceChange('altPhone')}
                  />
                </Field>

                {!whatsappSource && (
                  <Field
                    label='WhatsApp'
                    id='edit-teacher-whatsapp'
                    className='sm:col-span-2'
                  >
                    <IconInput
                      id='edit-teacher-whatsapp'
                      name='contactInfo.whatsapp'
                      type='tel'
                      icon={MessageCircle}
                      value={form.contactInfo.whatsapp}
                      onChange={handleChange}
                      placeholder='+233 ...'
                    />
                  </Field>
                )}

                {whatsappSource ? (
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
                        {whatsappSource === 'phone'
                          ? 'primary phone'
                          : 'alternate phone'}
                      </p>
                      <p className='mt-0.5 truncate text-[11px] text-gray-500 dark:text-gray-400'>
                        {form.contactInfo.whatsapp ||
                          'Add a phone number above to sync WhatsApp.'}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {step === 4 && (
              <>
                <p className='text-[13px] leading-relaxed text-gray-500 dark:text-gray-400'>
                  Assign the classes this teacher will teach. At least one is
                  required.
                </p>
                {classesLoadError ? (
                  <p className='text-[12px] text-amber-700 dark:text-amber-300'>
                    {classesLoadError} Showing currently assigned classes only.
                  </p>
                ) : null}
                <ClassPicker
                  selectedIds={form.classes}
                  catalog={classes}
                  loading={classesLoading}
                  selectId='edit-teacher-class-select'
                  onChange={(nextIds) =>
                    setForm((prev) => ({ ...prev, classes: nextIds }))
                  }
                />
              </>
            )}

            {step === 5 && (
              <div className='grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2'>
                <Field
                  label='Street'
                  id='edit-teacher-street'
                  className='sm:col-span-2'
                >
                  <IconInput
                    id='edit-teacher-street'
                    name='address.street'
                    icon={MapPin}
                    value={form.address.street}
                    onChange={handleChange}
                    placeholder='Street address'
                  />
                </Field>
                <Field label='City' id='edit-teacher-city'>
                  <IconInput
                    id='edit-teacher-city'
                    name='address.city'
                    icon={Building2}
                    value={form.address.city}
                    onChange={handleChange}
                    placeholder='City'
                  />
                </Field>
                <Field label='State / region' id='edit-teacher-state'>
                  <IconInput
                    id='edit-teacher-state'
                    name='address.state'
                    icon={MapIcon}
                    value={form.address.state}
                    onChange={handleChange}
                    placeholder='State or region'
                  />
                </Field>
                <Field label='ZIP / postal code' id='edit-teacher-zip'>
                  <IconInput
                    id='edit-teacher-zip'
                    name='address.zip'
                    icon={Hash}
                    value={form.address.zip}
                    onChange={handleChange}
                    placeholder='e.g. GA-123-4567'
                  />
                </Field>
                <Field label='Country' id='edit-teacher-country'>
                  <IconInput
                    id='edit-teacher-country'
                    name='address.country'
                    icon={Globe2}
                    value={form.address.country}
                    onChange={handleChange}
                    placeholder='Country'
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
          .edit-teacher-step {
            animation: editTeacherIn 320ms cubic-bezier(0.16, 1, 0.3, 1);
          }

          .form-error {
            animation: formErrorIn 280ms cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes editTeacherIn {
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

export default EditTeacher

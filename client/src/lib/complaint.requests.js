import { api, getErrorMessage } from './api'

const STATUS_LABEL = {
  pending: 'Open',
  in_progress: 'Under Review',
  resolved: 'Resolved',
}

const SEVERITY_LABEL = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

const CATEGORY_LABEL = {
  bullying: 'Bullying',
  harassment: 'Harassment',
  cyberbullying: 'Cyberbullying',
  discrimination: 'Discrimination',
  other: 'Other',
}

const firstEnum = (value) => {
  if (Array.isArray(value)) return value[0] || ''
  return value || ''
}

const normalizeParty = (party) => {
  if (!party) {
    return { id: '', name: 'Unknown', role: 'unknown', photo: '' }
  }

  if (typeof party === 'string') {
    return { id: party, name: 'Unknown', role: 'unknown', photo: '' }
  }

  const firstName = party.firstName || party.user?.firstName || ''
  const lastName = party.lastName || party.user?.lastName || ''
  const nameFromParts = `${firstName} ${lastName}`.trim()

  return {
    id: String(party.id || party._id || ''),
    _id: party._id || party.id,
    name: party.name || nameFromParts || 'Unknown',
    role: party.role || party.user?.role || 'unknown',
    photo: party.photo || party.user?.photo || '',
  }
}

export const normalizeComplaint = (complaint) => {
  if (!complaint || typeof complaint !== 'object') return complaint

  const statusKey = String(firstEnum(complaint.status)).toLowerCase()
  const severityKey = String(firstEnum(complaint.severity)).toLowerCase()
  const categoryKey = String(firstEnum(complaint.category)).toLowerCase()

  const reportedPartyText =
    typeof complaint.reportedParty === 'string'
      ? complaint.reportedParty.trim()
      : Array.isArray(complaint.reportedParty)
        ? complaint.reportedParty
            .map((item) =>
              typeof item === 'string'
                ? item
                : item?.name || item?._id || item?.id || '',
            )
            .filter(Boolean)
            .join(', ')
        : complaint.reportedParty?.name ||
          String(complaint.reportedParty || '').trim()

  const reportedParty = {
    id: '',
    name: reportedPartyText || 'Unknown',
    role: '',
    photo: '',
  }

  const witnessesText =
    typeof complaint.witnesses === 'string'
      ? complaint.witnesses.trim()
      : Array.isArray(complaint.witnesses)
        ? complaint.witnesses
            .map((item) =>
              typeof item === 'string'
                ? item
                : item?.name || item?._id || item?.id || '',
            )
            .filter(Boolean)
            .join(', ')
        : complaint.witnesses?.name ||
          String(complaint.witnesses || '').trim()

  const witnesses = witnessesText
    ? witnessesText
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => ({
          id: '',
          name,
          role: '',
          photo: '',
        }))
    : []

  const reporter = normalizeParty(complaint.reporter)
  const relatedStudents = [reporter]
    .filter((person) => person.role === 'student' && person.id)
    .map((person) => person.id)
    .filter((id, index, list) => list.indexOf(id) === index)

  return {
    ...complaint,
    id: String(complaint._id || complaint.id || ''),
    statusKey,
    status: STATUS_LABEL[statusKey] || complaint.status || 'Open',
    severityKey,
    priority: SEVERITY_LABEL[severityKey] || complaint.priority || 'Medium',
    categoryKey,
    category: CATEGORY_LABEL[categoryKey] || complaint.category || 'Other',
    reporter,
    reportedParty,
    reportedParties: reportedPartyText ? [reportedParty] : [],
    witnesses,
    witnessesText,
    relatedStudents,
    incidentDate: complaint.dateFiled || complaint.incidentDate || complaint.createdAt,
    incidentLocation: complaint.incidentLocation || '—',
    assignedTo: complaint.assignedTo || null,
    resolution: complaint.resolutionNotes || complaint.resolution || '',
    resolvedAt:
      complaint.dateResolved ||
      complaint.resolutionDate ||
      complaint.resolvedAt ||
      null,
    createdAt: complaint.createdAt || complaint.dateFiled,
    updatedAt: complaint.updatedAt || complaint.createdAt || complaint.dateFiled,
    photoEvidence: complaint.photoEvidence || [],
  }
}

export const normalizeComplaints = (complaints = []) =>
  complaints.map((complaint) => normalizeComplaint(complaint))

const appendIfValue = (formData, key, value) => {
  if (value == null) return
  const text = typeof value === 'string' ? value.trim() : value
  if (text === '') return
  formData.append(key, text)
}

const buildComplaintFormData = ({
  title,
  description,
  category,
  severity,
  reportedParty,
  witnesses,
  photoEvidence,
} = {}) => {
  const formData = new FormData()

  appendIfValue(formData, 'title', title)
  appendIfValue(formData, 'description', description ?? '')
  appendIfValue(formData, 'category', category)
  appendIfValue(formData, 'severity', severity)
  appendIfValue(formData, 'reportedParty', reportedParty)
  appendIfValue(formData, 'witnesses', witnesses ?? '')

  if (photoEvidence instanceof File) {
    formData.append('photoEvidence', photoEvidence)
  }

  return formData
}

export const getComplaints = async () => {
  try {
    const { data } = await api.get('/api/user/complaints')
    return {
      ...data,
      complaints: normalizeComplaints(data.complaints || []),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getComplaintById = async (id) => {
  try {
    const { data } = await api.get(`/api/user/complaint/${id}`)
    return {
      ...data,
      complaint: normalizeComplaint(data.complaint),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const createComplaint = async (complaintData) => {
  try {
    const formData = buildComplaintFormData(complaintData)
    const { data } = await api.post('/api/user/complaint', formData)
    return {
      ...data,
      complaint: data.complaint
        ? normalizeComplaint(data.complaint)
        : data.complaint,
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const updateComplaint = async (id, complaintData) => {
  try {
    const formData = buildComplaintFormData(complaintData)
    const { data } = await api.patch(`/api/user/complaint/${id}`, formData)
    return {
      ...data,
      complaint: data.complaint
        ? normalizeComplaint(data.complaint)
        : data.complaint,
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

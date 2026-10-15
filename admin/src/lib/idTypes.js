export const ID_TYPES = ['National ID', 'Passport', "Driver's License", 'Other']

export const ID_TYPE_OPTIONS = ID_TYPES.map((type) => ({
  value: type,
  label: type,
}))

export const needsIdBack = (idType) => Boolean(idType) && idType !== 'Passport'

export const getIdSides = (idType) => {
  if (!idType) return []
  if (idType === 'Passport') {
    return [{ key: 'front', label: 'Passport page', required: true }]
  }
  return [
    { key: 'front', label: 'Front', required: true },
    { key: 'back', label: 'Back', required: true },
  ]
}

/** Map legacy teacher ID type keys onto the canonical AddStudent labels. */
export const normalizeIdType = (value = '') => {
  const raw = String(value).trim()
  if (!raw) return ''
  if (ID_TYPES.includes(raw)) return raw

  const legacy = {
    passport: 'Passport',
    drivers_license: "Driver's License",
    "driver's_license": "Driver's License",
    "driver's license": "Driver's License",
    Kenya_card: 'National ID',
    national_id: 'National ID',
    'national id': 'National ID',
    other: 'Other',
  }

  const key = raw.toLowerCase().replace(/-/g, '_')
  return legacy[key] || raw
}

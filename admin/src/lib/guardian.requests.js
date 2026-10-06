import { api, getErrorMessage } from './api'
import { normalizeGuardian, normalizeGuardians } from './normalizePerson'

export const getGuardians = async ({ search = '', isActive } = {}) => {
  try {
    const params = {}
    if (search) params.search = search
    if (isActive === true || isActive === false) params.isActive = String(isActive)

    const { data } = await api.get('/api/admin/guardians', {
      params: Object.keys(params).length ? params : undefined,
    })

    return {
      ...data,
      guardians: normalizeGuardians(data.guardians || []),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getGuardianById = async (id) => {
  try {
    const { data } = await api.get(`/api/admin/guardians/${id}`)

    return {
      ...data,
      guardian: normalizeGuardian(data.guardian),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const addGuardian = async (formData) => {
  try {
    const { data } = await api.post('/api/admin/guardians', formData)

    return {
      ...data,
      guardian: normalizeGuardian(data.guardian),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const updateGuardian = async (id, formData) => {
  try {
    const { data } = await api.patch(`/api/admin/guardians/${id}`, formData)

    return {
      ...data,
      guardian: normalizeGuardian(data.guardian),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const setGuardianStatus = async (id, isActive) => {
  try {
    const { data } = await api.patch(`/api/admin/guardians/${id}/status`, {
      isActive,
    })

    return {
      ...data,
      guardian: normalizeGuardian(data.guardian),
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

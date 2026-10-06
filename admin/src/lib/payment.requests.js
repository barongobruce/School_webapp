import { api, getErrorMessage } from './api'

export const getPayments = async ({
  search = '',
  status,
  feeType,
  purpose,
  studentId,
  guardianId,
} = {}) => {
  try {
    const params = {}
    if (search) params.search = search
    if (status && status !== 'All') params.status = status
    if (feeType && feeType !== 'All') params.feeType = feeType
    if (purpose) params.purpose = purpose
    if (studentId) params.studentId = studentId
    if (guardianId) params.guardianId = guardianId

    const { data } = await api.get('/api/admin/payments', {
      params: Object.keys(params).length ? params : undefined,
    })

    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getPaymentById = async (id) => {
  try {
    const { data } = await api.get(`/api/admin/payments/${id}`)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const createInvoice = async (payload) => {
  try {
    const { data } = await api.post('/api/admin/payments', payload)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const updatePayment = async (id, payload) => {
  try {
    const { data } = await api.patch(`/api/admin/payments/${id}`, payload)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const cancelPayment = async (id) => {
  try {
    const { data } = await api.post(`/api/admin/payments/${id}/cancel`)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const resendInvoice = async (id) => {
  try {
    const { data } = await api.post(`/api/admin/payments/${id}/resend`)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

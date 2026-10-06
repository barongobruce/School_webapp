import { api, getErrorMessage } from './api'

export const getMyPayments = async ({
  search = '',
  status,
  feeType,
  kind,
} = {}) => {
  try {
    const params = {}
    if (search) params.search = search
    if (status && status !== 'All') params.status = status
    if (feeType && feeType !== 'All') params.feeType = feeType
    if (kind && kind !== 'All') params.kind = kind

    const { data } = await api.get('/api/user/payments', {
      params: Object.keys(params).length ? params : undefined,
    })

    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getMyPaymentById = async (id) => {
  try {
    const { data } = await api.get(`/api/user/payments/${id}`)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const checkoutPayment = async (id) => {
  try {
    const { data } = await api.post(`/api/user/payments/${id}/checkout`)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const confirmCheckoutSession = async (sessionId) => {
  try {
    const { data } = await api.get(
      `/api/user/payments/checkout-session/${sessionId}`,
    )
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

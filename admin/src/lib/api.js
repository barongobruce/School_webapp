import axios from 'axios'
import { getToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Request failed. Please try again.'

export const loginAdmin = async ({ email, password }) => {
  try {
    const { data } = await api.post('/api/admin/login', { email, password })
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const getCurrentAdmin = async () => {
  try {
    const { data } = await api.get('/api/admin/me')
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const changeAdminPassword = async ({
  currentPassword,
  newPassword,
  confirmPassword,
}) => {
  try {
    const { data } = await api.patch('/api/admin/me/password', {
      currentPassword,
      newPassword,
      confirmPassword,
    })
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export const updateAdminPhoto = async (file) => {
  try {
    const formData = new FormData()
    formData.append('photo', file)
    const { data } = await api.patch('/api/admin/me/photo', formData)
    return data
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

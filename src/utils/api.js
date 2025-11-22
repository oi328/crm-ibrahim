import axios from 'axios'

const base = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE
  ? import.meta.env.VITE_API_BASE
  : '/'

export const api = axios.create({
  baseURL: base,
})

api.interceptors.request.use((config) => {
  try {
    const token = window.localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {}
  return config
})
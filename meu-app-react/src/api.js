const configuredUrl = import.meta.env.VITE_API_URL?.trim()
const defaultUrl = import.meta.env.DEV
  ? 'http://localhost:8080'
  : 'https://aprovado-api.onrender.com'

export const API_URL = (configuredUrl || defaultUrl).replace(/\/+$/, '')

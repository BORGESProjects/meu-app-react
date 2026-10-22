import {transportarApi} from './transporteApi'
const configuredUrl = import.meta.env?.VITE_API_URL?.trim()
const defaultUrl = import.meta.env?.DEV && import.meta.env?.VITE_APP_NATIVE !== 'true'
  ? 'http://localhost:8080'
  : 'https://aprovado-api.onrender.com'

export const API_URL = (configuredUrl || defaultUrl).replace(/\/+$/, '')
export const fetchApi = (url,opcoes) => transportarApi(url,opcoes,{
  nativo:import.meta.env?.VITE_APP_NATIVE === 'true' && Boolean(globalThis.__TAURI_INTERNALS__),
})

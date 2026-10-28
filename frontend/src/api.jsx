import axios from 'axios'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080' })
export const getAuth = () => { try { return JSON.parse(localStorage.getItem('ti_auth')) } catch { return null } }
export const setAuth = (auth) => auth ? localStorage.setItem('ti_auth', JSON.stringify(auth)) : localStorage.removeItem('ti_auth')
api.interceptors.request.use((config) => {
  const auth = getAuth()
  if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`
  return config
})
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && !String(error.config?.url).includes('/api/auth/login')) {
    setAuth(null)
    window.location.assign('/login')
  }
  return Promise.reject(error)
})
export const errMsg = (error) => {
  if (error.code === 'ERR_NETWORK' || !error.response && error.request) {
    return `Cannot reach the API at ${api.defaults.baseURL}. Start the backend and try again.`
  }
  if (error.response?.status === 403) return 'You do not have permission for this action.'
  return error.response?.data?.message || error.response?.data?.error || error.message || 'Request failed'
}

import axios from 'axios'
import { router } from 'expo-router'

// localhost only works in browser/simulator.
// For physical device via Expo Go, use your machine's local IP (e.g. http://192.168.1.5:3000/api).
// Run `ipconfig getifaddr en0` on Mac to find your IP.
const BASE_URL = __DEV__
  ? 'http://192.168.124.248:3000/api'
  : 'https://your-production-api.com/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Lazy import to avoid circular dependency (store imports axios, axios imports store)
const getStore = () => require('@store/index').store

api.interceptors.request.use((config) => {
  const token = getStore().getState().auth.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      getStore().dispatch(require('@store/authSlice').logout())
      router.replace('/(auth)/login')
    }
    return Promise.reject(error)
  },
)

export default api

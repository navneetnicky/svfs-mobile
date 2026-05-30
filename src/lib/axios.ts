import axios from 'axios'
import { router } from 'expo-router'

// Use 10.0.2.2 for Android emulator, localhost for iOS simulator and physical device via Expo Go
const BASE_URL = 'http://localhost:3000/api'

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

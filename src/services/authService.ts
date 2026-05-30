import api from '@/src/lib/axios'
import type { LoginCredentials, LoginResponse, SendOtpPayload, VerifyOtpPayload } from '@/src/types/auth'

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials)
    return data
  },

  sendOtp: async (payload: SendOtpPayload): Promise<void> => {
    await api.post('/auth/send-otp', payload)
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/verify-otp', payload)
    return data
  },
}

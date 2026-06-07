export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  branch_id: string | null
  company_id: string | null
  permissions: string[]
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export interface SendOtpPayload {
  phone: string
}

export interface VerifyOtpPayload {
  phone: string
  otp: string
}

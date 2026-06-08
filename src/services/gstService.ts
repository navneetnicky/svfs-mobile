import api from '@lib/axios'

export interface GSTValidationResponse {
  status: number
  gstin: string
  valid: boolean
  company_details?: {
    legal_name: string
    trade_name: string
    company_status: string
    pan: string
    state: string
    registration_date: string
    gst_type: string
  }
}

export const gstService = {
  validate: (gstin: string): Promise<GSTValidationResponse> =>
    api.post<GSTValidationResponse>('/gst/validate', { gstin }).then(r => r.data),
}

import api from '@lib/axios'
import type {
  ChallanRecord, ChallanFormData, ChallanListParams,
  PaginatedChallans, ChallanLRRow, AvailableLRParams,
  ChallanReviewPayload,
} from '@/src/types/challan'

export const challanService = {
  getAll: async (params: ChallanListParams = {}): Promise<PaginatedChallans> => {
    const res = await api.get('/challans', { params: { limit: 15, ...params } })
    return res.data
  },

  getById: async (id: string): Promise<ChallanRecord> => {
    const res = await api.get(`/challans/${id}`)
    return res.data.data ?? res.data
  },

  getAvailableLRs: async (params: AvailableLRParams): Promise<ChallanLRRow[]> => {
    const res = await api.get('/challans/available-lrs', { params })
    return res.data.data ?? res.data
  },

  searchByNo: async (challan_no: string, company_id: string, branch_id?: string): Promise<ChallanRecord> => {
    const res = await api.get('/challans/search', { params: { challan_no, company_id, branch_id } })
    return res.data.data ?? res.data
  },

  create: async (data: ChallanFormData): Promise<ChallanRecord> => {
    const res = await api.post('/challans', data)
    return res.data.data ?? res.data
  },

  update: async (id: string, data: Partial<ChallanFormData>): Promise<ChallanRecord> => {
    const res = await api.put(`/challans/${id}`, data)
    return res.data.data ?? res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/challans/${id}`)
  },

  transfer: async (id: string, to_branch_id: string): Promise<ChallanRecord> => {
    const res = await api.put(`/challans/${id}/transfer`, { to_branch_id })
    return res.data.data ?? res.data
  },

  submitReview: async (id: string, payload: ChallanReviewPayload): Promise<ChallanRecord> => {
    const res = await api.post(`/challans/${id}/review`, payload)
    return res.data.data ?? res.data
  },
}

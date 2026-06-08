import api from '@lib/axios'

export interface BranchRecord {
  id: string
  branch_name: string
  branch_code: string
  company_id: string
}

export interface CreditInfo {
  credit_limit: number | null
  credit_used: number
  credit_remaining: number | null
}

export const branchService = {
  getAll: async (company_id?: string): Promise<BranchRecord[]> => {
    const res = await api.get('/branch', { params: { limit: 100, ...(company_id ? { company_id } : {}) } })
    return res.data.data ?? []
  },

  getCreditInfo: (id: string): Promise<CreditInfo> =>
    api.get(`/branch/${id}/credit`).then(r => r.data),
}

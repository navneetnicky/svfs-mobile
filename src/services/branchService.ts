import api from '@lib/axios'

export interface BranchRecord {
  id: string
  branch_name: string
  branch_code: string
}

export const branchService = {
  getAll: async (): Promise<BranchRecord[]> => {
    const res = await api.get('/branch', { params: { limit: 100 } })
    return res.data.data ?? []
  },
}

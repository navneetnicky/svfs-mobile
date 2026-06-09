import api from '@lib/axios'

export interface ConsignmentRecord {
  id: string
  consignment_name: string
  description?: string | null
  is_active: boolean
}

export const consignmentService = {
  search: async (company_id: string, search: string): Promise<ConsignmentRecord[]> => {
    const res = await api.get('/consignment-master', {
      params: { company_id, search: search || undefined, limit: 10, is_active: true },
    })
    return res.data.data ?? []
  },
}

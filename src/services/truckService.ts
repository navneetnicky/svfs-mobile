import api from '@lib/axios'
import type { TruckRecord } from '@/src/types/challan'

export const truckService = {
  getAll: async (company_id: string): Promise<TruckRecord[]> => {
    const res = await api.get('/truck-master', { params: { company_id, limit: 200 } })
    return res.data.data ?? res.data
  },
}

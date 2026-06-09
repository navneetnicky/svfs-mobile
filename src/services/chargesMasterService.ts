import api from '@lib/axios'

export interface ChargesRecord {
  id: string
  charge_type: string
  default_charges: number | string
  use_for: 'booking' | 'delivery'
  is_active: boolean
  branch_id?: string | null
}

export const chargesMasterService = {
  getFlat: (company_id: string, use_for?: 'booking' | 'delivery', branch_id?: string): Promise<ChargesRecord[]> =>
    api.get('/charges-master/flat', { params: { company_id, use_for, branch_id } }).then(r => r.data),
}

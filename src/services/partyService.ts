import api from '@lib/axios'

export interface PartyContact {
  phone?: string
  email?: string
}

export interface PartyAddress {
  id: number
  address_type: string
  address: string
  place_id: string | null
}

export interface PartyRecord {
  id: string
  legal_name: string
  gst_number: string | null
  contacts: PartyContact[]
  partyAddresses: PartyAddress[]
}

export const partyService = {
  search: async (company_id: string, search: string): Promise<PartyRecord[]> => {
    const res = await api.get('/party-master', {
      params: { company_id, search: search || undefined, limit: 8, sort_by: 'legal_name', sort_dir: 'asc' },
    })
    return res.data.data ?? []
  },
}

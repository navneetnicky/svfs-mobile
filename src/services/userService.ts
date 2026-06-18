import api from '@lib/axios'

export interface DriverRecord {
  id: string
  name: string
}

export const userService = {
  getDrivers: async (company_id: string): Promise<DriverRecord[]> => {
    const res = await api.get('/user-master', {
      params: { role_name: 'driver', company_id, limit: 500 },
    })
    const rows: any[] = res.data.data ?? res.data
    return rows.map(u => ({
      id: u.id,
      name: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim(),
    })).filter(u => u.name)
  },
}

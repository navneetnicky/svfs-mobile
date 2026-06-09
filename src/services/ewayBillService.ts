import api from '@lib/axios'

export interface EwayBillDetails {
  ewbNo: string
  docNo: string
  docDate: string
  validUpto: string
  totalValue: number
  fromTrdName: string
  toTrdName: string
  fromGstin: string
  toGstin: string
  [key: string]: unknown
}

export const ewayBillService = {
  get: (ewbNo: string): Promise<{ data?: EwayBillDetails }> =>
    api.get('/eway-bill/get', { params: { ewbNo } }).then(r => r.data),
}

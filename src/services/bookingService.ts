import api from '@lib/axios'
import type { BookingRecord, BookingFormData, BookingListParams } from '@/src/types/booking'

interface BookingListResponse {
  data: BookingRecord[]
  total: number
  page: number
  limit: number
}

export const bookingService = {
  getAll: async (params: BookingListParams = {}): Promise<BookingListResponse> => {
    const res = await api.get('/bookings', { params: { limit: 20, ...params } })
    return res.data
  },

  getById: async (id: string): Promise<BookingRecord> => {
    const res = await api.get(`/bookings/${id}`)
    return res.data.data ?? res.data
  },

  create: async (data: BookingFormData): Promise<BookingRecord> => {
    const res = await api.post('/bookings', data)
    return res.data.data ?? res.data
  },

  update: async (id: string, data: Partial<BookingFormData>): Promise<BookingRecord> => {
    const res = await api.put(`/bookings/${id}`, data)
    return res.data.data ?? res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/bookings/${id}`)
  },
}

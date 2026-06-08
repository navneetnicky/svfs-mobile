export type BookingType = 'PAID' | 'TO_PAY' | 'TBB' | 'FOC'
export type BookingStatus = 'CREATED' | 'IN_TRANSIT' | 'RECEIVED_AT_BRANCH' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
export type GstPaidBy = 'SENDER' | 'RECEIVER' | 'AGENT'

// Normalize old lowercase API values to current uppercase enum
export function normalizeStatus(s?: string | null): BookingStatus {
  if (!s) return 'CREATED'
  const up = s.toUpperCase()
  if (up === 'BOOKED') return 'CREATED'
  return up as BookingStatus
}

export interface BookingItem {
  id?: number
  pkg_count?: number
  description?: string
  unit: string
  actual_weight?: number
  charged_weight?: number
  rate?: number
  total?: number
}

export interface BookingRecord {
  id: string
  lr_number: string
  booked_at: string
  in_transit_at?: string | null
  received_at_branch_at?: string | null
  out_for_delivery_at?: string | null
  delivered_at?: string | null
  booking_type: BookingType
  status: BookingStatus
  to_city: string
  sender_name: string
  sender_mobile?: string
  sender_address?: string
  receiver_name: string
  receiver_mobile?: string
  receiver_address?: string
  items: BookingItem[]
  freight: number
  labour_charge: number
  delivery_charge: number
  agent_charge: number
  taxi_charge: number
  bilty_charge: number
  cod: number
  grand_total: number
  gst_paid_by?: string
  remarks?: string
  company_id: string
  branch_id: string
  created_at: string
  updated_at: string
}

export interface BookingFormData {
  booking_type: BookingType
  to_city: string
  to_location_master_id?: number | null
  sender_name: string
  sender_mobile?: string
  sender_address?: string
  receiver_name: string
  receiver_mobile?: string
  receiver_address?: string
  items: { pkg_count?: number; description?: string; unit: string; actual_weight?: number; charged_weight?: number; rate?: number; total?: number }[]
  freight: number
  labour_charge: number
  delivery_charge: number
  agent_charge: number
  taxi_charge: number
  bilty_charge: number
  cod: number
  grand_total: number
  gst_paid_by?: string
  remarks?: string
  company_id: string
  branch_id: string
}

export interface BookingListParams {
  page?: number
  limit?: number
  company_id?: string
  branch_id?: string
  search?: string
  start_date?: string
  end_date?: string
}

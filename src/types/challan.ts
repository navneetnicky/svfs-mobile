export type ChallanStatus = 'dispatched' | 'received'
export type ReviewStatus  = 'received' | 'shortage' | 'damaged'

// ─── Truck ────────────────────────────────────────────────────────────────────

export interface TruckRecord {
  id:             string
  truck_number:   string
  truck_type?:    string | null
  ownership_type: string          // 'self' | 'market'
  owner_name?:    string | null
  owner_mobile?:  string | null
}

// ─── Branch (minimal shape used in challan relations) ─────────────────────────

export interface ChallanBranch {
  id:          string
  branch_name: string
  branch_code: string
  phone?:      string | null
}

// ─── LR rows returned by /challans/available-lrs ─────────────────────────────

export interface ChallanLRRow {
  id:            string
  lr_number:     string
  sender:        string
  receiver:      string
  to_city:       string
  to_branch_id?: string | null
  pkgs:          number
  weight:        number
  freight:       number
}

// ─── LR attached to a challan ─────────────────────────────────────────────────

export interface ChallanLRReview {
  id:              number
  status:          ReviewStatus
  received_pkgs?:  number | null
  received_weight?: number | null
}

export interface ChallanLRRecord {
  id:         number
  challan_id: string
  booking_id: string
  booking: {
    id:            string
    lr_number:     string
    sender_name:   string
    receiver_name: string
    to_city:       string
    grand_total:   string | number
    items: {
      pkg_count?:      number | null
      actual_weight?:  string | number | null
      charged_weight?: string | number | null
    }[]
  }
  review?: ChallanLRReview | null
}

// ─── Main Challan entity ──────────────────────────────────────────────────────

export interface ChallanRecord {
  id:          string
  company_id:  string
  challan_no:  string
  status:      ChallanStatus

  from_branch_id:               string
  to_branch_id?:                string | null
  to_location_master_id?:       number | null
  crossing_branch_id?:          string | null
  crossing_location_master_id?: number | null

  truck_id:       string
  driver_name:    string
  driver_mobile?: string | null
  driver_licence?: string | null
  departure_at?:  string | null
  remarks?:       string | null

  created_at: string
  updated_at: string

  from_branch?:   ChallanBranch | null
  to_branch?:     ChallanBranch | null
  crossing_branch?: ChallanBranch | null
  to_location_master?: { id: number; address: string } | null
  truck?:         TruckRecord | null
  creator?:       { id: string; first_name?: string | null; last_name?: string | null } | null

  lrs: ChallanLRRecord[]
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface ChallanFormData {
  company_id:    string
  from_branch_id: string

  to_branch_id?:               string | null
  to_location_master_id?:      number | null
  crossing_branch_id?:         string | null
  crossing_location_master_id?: number | null

  truck_id:       string
  driver_name:    string
  driver_mobile?: string | null
  driver_licence?: string | null
  departure_at?:  string | null
  remarks?:       string | null

  booking_ids: string[]
}

export interface ReviewLRPayload {
  challan_lr_id:    number
  status:           ReviewStatus
  received_pkgs?:   number | null
  received_weight?: number | null
}

export interface ChallanReviewPayload {
  lrs:       ReviewLRPayload[]
  branch_id?: string | null
}

// ─── List ─────────────────────────────────────────────────────────────────────

export interface ChallanListParams {
  page?:         number
  limit?:        number
  company_id?:   string
  branch_id?:    string
  to_branch_id?: string
  status?:       ChallanStatus
  search?:       string
  start_date?:   string
  end_date?:     string
}

export interface PaginatedChallans {
  data:       ChallanRecord[]
  total:      number
  page:       number
  limit:      number
  totalPages: number
}

// ─── Available-LR params ──────────────────────────────────────────────────────

export interface AvailableLRParams {
  company_id:          string
  branch_id?:          string
  to_branch_id?:       string
  exclude_challan_id?: string
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppSelector } from '@store/hooks'
import { bookingService } from '@services/bookingService'
import type { BookingFormData, BookingListParams } from '@/src/types/booking'

export function useBookingList(params: Omit<BookingListParams, 'company_id' | 'branch_id'> = {}) {
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)

  return useQuery({
    queryKey: ['bookings', activeBranch?.id, params],
    queryFn: () =>
      bookingService.getAll({
        ...params,
        company_id: activeBranch?.company_id,
        branch_id: activeBranch?.id,
      }),
    enabled: !!activeBranch,
    staleTime: 2 * 60 * 1000,
  })
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingService.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)

  return useMutation({
    mutationFn: (data: Omit<BookingFormData, 'company_id' | 'branch_id'>) =>
      bookingService.create({
        ...data,
        company_id: activeBranch!.company_id,
        branch_id: activeBranch!.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export function useDeleteBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bookingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

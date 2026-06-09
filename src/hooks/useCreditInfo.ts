import { useQuery } from '@tanstack/react-query'
import { branchService } from '@services/branchService'

export function useCreditInfo(branchId?: string | null) {
  return useQuery({
    queryKey: ['credit-info', branchId],
    queryFn: () => branchService.getCreditInfo(branchId!),
    enabled: !!branchId,
    staleTime: 60_000,
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppSelector } from '@store/hooks'
import { challanService } from '@services/challanService'
import type {
  ChallanListParams, ChallanFormData,
  ChallanReviewPayload, AvailableLRParams,
} from '@/src/types/challan'

export function useChallanList(params: Omit<ChallanListParams, 'company_id'> = {}) {
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)

  return useQuery({
    queryKey: ['challans', activeBranch?.id, params],
    queryFn: () =>
      challanService.getAll({
        ...params,
        company_id: activeBranch?.company_id,
      }),
    enabled: !!activeBranch,
    staleTime: 0,
  })
}

export function useChallan(id: string) {
  return useQuery({
    queryKey: ['challans', id],
    queryFn: () => challanService.getById(id),
    enabled: !!id,
    staleTime: 0,
  })
}

export function useAvailableLRs(params: Omit<AvailableLRParams, 'company_id'> = {}) {
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)

  return useQuery({
    queryKey: ['challan-available-lrs', activeBranch?.id, params],
    queryFn: () =>
      challanService.getAvailableLRs({
        ...params,
        company_id: activeBranch!.company_id,
        branch_id: activeBranch!.id,
      }),
    enabled: !!activeBranch,
    staleTime: 0,
  })
}

export function useCreateChallan() {
  const queryClient = useQueryClient()
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)

  return useMutation({
    mutationFn: (data: Omit<ChallanFormData, 'company_id' | 'from_branch_id'>) =>
      challanService.create({
        ...data,
        company_id:     activeBranch!.company_id,
        from_branch_id: activeBranch!.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challans'] })
      queryClient.invalidateQueries({ queryKey: ['challan-available-lrs'] })
    },
  })
}

export function useUpdateChallan(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<ChallanFormData>) => challanService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challans'] })
    },
  })
}

export function useDeleteChallan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => challanService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challans'] })
    },
  })
}

export function useReviewChallan(id: string) {
  const queryClient = useQueryClient()
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)

  return useMutation({
    mutationFn: (payload: Omit<ChallanReviewPayload, 'branch_id'>) =>
      challanService.submitReview(id, {
        ...payload,
        branch_id: activeBranch?.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challans'] })
    },
  })
}

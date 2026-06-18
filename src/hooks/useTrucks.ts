import { useQuery } from '@tanstack/react-query'
import { useAppSelector } from '@store/hooks'
import { truckService } from '@services/truckService'

export function useTrucks() {
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)

  return useQuery({
    queryKey: ['trucks', activeBranch?.company_id],
    queryFn: () => truckService.getAll(activeBranch!.company_id),
    enabled: !!activeBranch?.company_id,
    staleTime: 5 * 60 * 1000,
  })
}

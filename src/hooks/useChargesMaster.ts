import { useQuery } from '@tanstack/react-query'
import { chargesMasterService } from '@services/chargesMasterService'
import { useAppSelector } from '@/src/store/hooks'

export function useChargesMaster() {
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)
  const companyId = activeBranch?.company_id

  return useQuery({
    queryKey: ['charges-master', companyId, activeBranch?.id],
    queryFn: () => chargesMasterService.getFlat(companyId!, 'booking', activeBranch?.id),
    enabled: !!companyId,
    staleTime: 5 * 60_000,
  })
}

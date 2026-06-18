import { useQuery } from '@tanstack/react-query'
import { useAppSelector } from '@store/hooks'
import { userService } from '@services/userService'

export function useDrivers() {
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)

  return useQuery({
    queryKey: ['drivers', activeBranch?.company_id],
    queryFn: () => userService.getDrivers(activeBranch!.company_id),
    enabled: !!activeBranch?.company_id,
    staleTime: 5 * 60 * 1000,
  })
}

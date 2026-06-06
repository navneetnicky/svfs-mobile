import { useQuery } from '@tanstack/react-query'
import api from '@lib/axios'
import { useAppSelector } from '@store/hooks'

interface FlatCity {
  id: number
  name: string
  stateId: number
  state: string
  cityId: number
  city: string
}

export function useCities() {
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)

  return useQuery({
    queryKey: ['cities', activeBranch?.company_id],
    queryFn: async (): Promise<FlatCity[]> => {
      const res = await api.get('/location/master/flat', {
        params: { company_id: activeBranch!.company_id },
      })
      return res.data ?? []
    },
    enabled: !!activeBranch?.company_id,
    staleTime: 10 * 60 * 1000,
  })
}

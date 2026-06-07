import { useQuery } from '@tanstack/react-query'
import api from '@lib/axios'
import { useAppSelector } from '@store/hooks'

export interface LocationMasterRecord {
  id:        number
  location:  string
  placeId:   string
  latitude?:  number | null
  longitude?: number | null
  pincode?:   string | null
  isActive:  boolean
}

export function useCities() {
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)

  return useQuery({
    queryKey: ['location-master', activeBranch?.company_id],
    queryFn: async (): Promise<LocationMasterRecord[]> => {
      const res = await api.get('/location/master', {
        params: { company_id: activeBranch!.company_id },
      })
      return (res.data ?? []).filter((l: LocationMasterRecord) => l.isActive)
    },
    enabled: !!activeBranch?.company_id,
    staleTime: 10 * 60 * 1000,
  })
}

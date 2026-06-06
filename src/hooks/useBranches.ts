import { useEffect } from 'react'
import { Platform } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import * as SecureStore from 'expo-secure-store'
import { branchService } from '@services/branchService'
import { setWorkspace } from '@store/workspaceSlice'
import { useAppDispatch, useAppSelector } from '@store/hooks'

export function useBranches() {
  const dispatch  = useAppDispatch()
  const authUser  = useAppSelector(s => s.auth.user)

  const query = useQuery({
    queryKey: ['branches'],
    queryFn: branchService.getAll,
    enabled: !!authUser,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (!query.data?.length) return

    async function resolve() {
      let activeBranchId: string | null = null

      if (authUser?.branch_id) {
        // Regular employee — always pinned to their assigned branch
        activeBranchId = authUser.branch_id
      } else {
        // Admin — restore last selection from storage
        activeBranchId = Platform.OS === 'web'
          ? localStorage.getItem('activeBranchId')
          : await SecureStore.getItemAsync('activeBranchId')
      }

      dispatch(setWorkspace({ branches: query.data!, activeBranchId }))
    }

    resolve()
  }, [query.data])

  return query
}

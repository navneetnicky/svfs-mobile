import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { authService } from '@services/authService'
import { setCredentials } from '@store/authSlice'
import { useAppDispatch } from '@store/hooks'
import type { LoginCredentials } from '@/src/types/auth'

export function useLogin() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      dispatch(setCredentials(data))
      router.replace('/(app)')
    },
  })
}

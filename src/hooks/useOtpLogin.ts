import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { authService } from '@services/authService'
import { setCredentials } from '@store/authSlice'
import { useAppDispatch } from '@store/hooks'

export function useSendOtp() {
  return useMutation({
    mutationFn: (phone: string) => authService.sendOtp({ phone }),
  })
}

export function useVerifyOtp() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      authService.verifyOtp({ phone, otp }),
    onSuccess: (data) => {
      dispatch(setCredentials(data))
      router.replace('/(tabs)')
    },
  })
}

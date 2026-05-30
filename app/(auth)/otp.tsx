import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSendOtp, useVerifyOtp } from '@hooks/useOtpLogin'

type OtpStep = 'phone' | 'otp'

export default function OtpLoginScreen() {
  const [step, setStep] = useState<OtpStep>('phone')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtp, setShowOtp] = useState(false)

  const router = useRouter()
  const { mutate: sendOtp, isPending: isSendingOtp, error: sendOtpError } = useSendOtp()
  const { mutate: verifyOtp, isPending: isVerifyingOtp, error: verifyOtpError } = useVerifyOtp()

  const handleSendOtp = () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setPhoneError('Enter a valid 10-digit mobile number')
      return
    }
    setPhoneError('')
    sendOtp(phone, { onSuccess: () => setStep('otp') })
  }

  const handleVerifyOtp = () => verifyOtp({ phone, otp })

  const handleBackToPhone = () => {
    setStep('phone')
    setOtp('')
    setShowOtp(false)
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-black"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Phone Step ── */}
        {step === 'phone' && (
          <View>
            <TouchableOpacity
              onPress={() => router.back()}
              className="mb-6 flex-row items-center gap-x-1.5"
            >
              <Ionicons name="arrow-back" size={16} color="#71717a" />
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">Back to login</Text>
            </TouchableOpacity>

            <View className="mb-8">
              <Text className="text-2xl font-bold text-black dark:text-white">Login with OTP</Text>
              <Text className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                Enter your mobile number and we'll send you a one-time password.
              </Text>
            </View>

            <View className="gap-y-4">
              <View className="gap-y-1.5">
                <Text className="text-sm font-medium text-black dark:text-white">
                  Mobile Number
                </Text>
                <TextInput
                  className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3.5 text-sm text-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor="#71717a"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(v) => {
                    setPhone(v.replace(/\D/g, '').slice(0, 10))
                    setPhoneError('')
                  }}
                  onSubmitEditing={handleSendOtp}
                />
                {phoneError ? (
                  <Text className="text-xs text-red-500">{phoneError}</Text>
                ) : null}
                {sendOtpError ? (
                  <Text className="text-xs text-red-500">
                    {(sendOtpError as any)?.response?.data?.message ?? sendOtpError.message}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={handleSendOtp}
                disabled={isSendingOtp}
                className="items-center rounded-xl bg-blue-600 py-4 disabled:opacity-60"
                activeOpacity={0.8}
              >
                {isSendingOtp ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-sm font-semibold text-white">Send OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── OTP Step ── */}
        {step === 'otp' && (
          <View>
            <TouchableOpacity
              onPress={handleBackToPhone}
              className="mb-6 flex-row items-center gap-x-1.5"
            >
              <Ionicons name="arrow-back" size={16} color="#71717a" />
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">Change number</Text>
            </TouchableOpacity>

            <View className="mb-8">
              <Text className="text-2xl font-bold text-black dark:text-white">Enter OTP</Text>
              <Text className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                A one-time password was sent to{' '}
                <Text className="font-medium text-black dark:text-white">+91 {phone}</Text>.
              </Text>
            </View>

            <View className="gap-y-4">
              <View className="gap-y-1.5">
                <Text className="text-sm font-medium text-black dark:text-white">
                  One-Time Password
                </Text>
                <View className="relative">
                  <TextInput
                    className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3.5 pr-12 text-sm text-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    placeholder="Enter OTP"
                    placeholderTextColor="#71717a"
                    keyboardType="number-pad"
                    secureTextEntry={!showOtp}
                    value={otp}
                    onChangeText={(v) => setOtp(v.replace(/\D/g, ''))}
                    onSubmitEditing={() => otp.length > 0 && handleVerifyOtp()}
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={() => setShowOtp(!showOtp)}
                    className="absolute right-3 top-3.5"
                  >
                    <Ionicons
                      name={showOtp ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#71717a"
                    />
                  </TouchableOpacity>
                </View>
                {verifyOtpError ? (
                  <Text className="text-xs text-red-500">
                    {(verifyOtpError as any)?.response?.data?.message ?? verifyOtpError.message}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={handleVerifyOtp}
                disabled={isVerifyingOtp || otp.length === 0}
                className="items-center rounded-xl bg-blue-600 py-4 disabled:opacity-60"
                activeOpacity={0.8}
              >
                {isVerifyingOtp ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-sm font-semibold text-white">Verify OTP</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSendOtp}
                disabled={isSendingOtp}
                className="items-center py-2 disabled:opacity-50"
              >
                <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                  {isSendingOtp ? 'Resending...' : "Didn't receive it? Resend OTP"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

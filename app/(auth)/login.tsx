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
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useLogin } from '@hooks/useLogin'
import { loginSchema, type LoginFormData } from '@/src/lib/schemas'

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { mutate: login, isPending, error } = useLogin()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (data: LoginFormData) => login(data)

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-black"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mb-8 items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <MaterialCommunityIcons name="truck-delivery-outline" size={34} color="white" />
          </View>
          <Text className="text-2xl font-bold text-black dark:text-white">
            Login to your account
          </Text>
          <Text className="mt-1.5 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Enter your credentials to access SVFS.
          </Text>
        </View>

        {/* Form */}
        <View className="gap-y-4">

          {/* Email */}
          <View className="gap-y-1.5">
            <Text className="text-sm font-medium text-black dark:text-white">Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3.5 text-sm text-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  placeholder="m@example.com"
                  placeholderTextColor="#71717a"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.email && (
              <Text className="text-xs text-red-500">{errors.email.message}</Text>
            )}
          </View>

          {/* Password */}
          <View className="gap-y-1.5">
            <Text className="text-sm font-medium text-black dark:text-white">Password</Text>
            <View className="relative">
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3.5 pr-12 text-sm text-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    placeholder="••••••••"
                    placeholderTextColor="#71717a"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5"
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#71717a"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text className="text-xs text-red-500">{errors.password.message}</Text>
            )}
          </View>

          {/* API Error */}
          {error && (
            <Text className="text-center text-sm text-red-500">
              {(error as any)?.response?.data?.message ?? error.message}
            </Text>
          )}

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            className="mt-2 items-center rounded-xl bg-blue-600 py-4 disabled:opacity-60"
            activeOpacity={0.8}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-sm font-semibold text-white">Login</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="my-1 flex-row items-center gap-x-3">
            <View className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <Text className="text-xs text-zinc-400 dark:text-zinc-500">Or continue with</Text>
            <View className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </View>

          {/* OTP Login Button */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/otp')}
            className="flex-row items-center justify-center gap-x-2 rounded-xl border border-zinc-200 bg-white py-4 dark:border-zinc-800 dark:bg-zinc-900"
            activeOpacity={0.8}
          >
            <Ionicons name="phone-portrait-outline" size={18} color="#3b82f6" />
            <Text className="text-sm font-medium text-black dark:text-white">Login with OTP</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

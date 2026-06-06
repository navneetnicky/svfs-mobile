import { View, Text, TouchableOpacity } from 'react-native'
import { Stack, useRouter, usePathname } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function NotFoundScreen() {
  const router   = useRouter()
  const pathname = usePathname()

  // Extract a readable page name from the path
  const pageName = pathname
    .split('/')
    .filter(Boolean)
    .pop()
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase()) ?? 'This page'

  return (
    <>
      <Stack.Screen options={{ title: 'Coming Soon' }} />
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-950 px-6">
        <View className="items-center gap-y-4">
          <View className="h-20 w-20 rounded-2xl bg-amber-100 dark:bg-amber-950 items-center justify-center">
            <MaterialCommunityIcons name="hammer-wrench" size={40} color="#d97706" />
          </View>

          <View className="items-center gap-y-1.5">
            <Text className="text-xl font-black text-zinc-900 dark:text-white">
              Work in Progress
            </Text>
            <Text className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
              <Text className="font-semibold text-zinc-700 dark:text-zinc-300">{pageName}</Text>
              {' '}is not available yet.{'\n'}We're building it — check back soon.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.replace('/(app)')}
            className="mt-2 flex-row items-center gap-x-2 bg-blue-600 px-6 py-3 rounded-xl"
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="view-dashboard-outline" size={18} color="white" />
            <Text className="text-sm font-semibold text-white">Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}

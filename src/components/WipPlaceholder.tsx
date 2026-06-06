import { View, Text } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export function WipPlaceholder({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-y-4 px-8">
      <View className="h-20 w-20 rounded-3xl bg-amber-50 dark:bg-amber-950 items-center justify-center">
        <MaterialCommunityIcons name="hammer-wrench" size={36} color="#d97706" />
      </View>
      <View className="items-center gap-y-1.5">
        <Text className="text-base font-bold text-zinc-800 dark:text-white">{label}</Text>
        <Text className="text-sm text-zinc-400 dark:text-zinc-500 text-center leading-5">
          This screen is under construction.{'\n'}Check back soon.
        </Text>
      </View>
    </View>
  )
}

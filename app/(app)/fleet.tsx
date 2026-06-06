import { useState } from 'react'
import { View, Text } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { TopTabBar } from '@/src/components/TopTabBar'
import { WipPlaceholder } from '@/src/components/WipPlaceholder'

const TABS = ['Diesel Entry', 'Toll Entry', 'Truck Expense'] as const
type Tab = typeof TABS[number]

export default function FleetScreen() {
  const [active, setActive] = useState<Tab>('Diesel Entry')

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">

      {/* Header */}
      <View className="bg-white dark:bg-zinc-950 px-4 pt-14 pb-3 flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
        <View>
          <Text className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Section</Text>
          <Text className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">Fleet Management</Text>
        </View>
        <View className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950 items-center justify-center">
          <MaterialCommunityIcons name="truck-outline" size={20} color="#d97706" />
        </View>
      </View>

      {/* Top tab bar */}
      <TopTabBar tabs={[...TABS]} active={active} onSelect={t => setActive(t as Tab)} />

      {/* Content */}
      <WipPlaceholder label={active} />

    </View>
  )
}

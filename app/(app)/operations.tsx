import { useState } from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { TopTabBar } from '@/src/components/TopTabBar'
import { WipPlaceholder } from '@/src/components/WipPlaceholder'

const TABS = ['Invoice Register', 'Quotation', 'City Wise', 'Letter Head', 'Income Book', 'Expense Book'] as const
type Tab = typeof TABS[number]

export default function OperationsScreen() {
  const [active, setActive] = useState<Tab>('Invoice Register')

  return (
    <View className="flex-1 bg-zinc-50">
      <View className="bg-white px-4 pt-14 pb-3 flex-row items-center justify-between border-b border-zinc-100">
        <View>
          <Text className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Section</Text>
          <Text className="text-xl font-black text-zinc-900 mt-0.5">Operations</Text>
        </View>
        <View className="h-9 w-9 rounded-xl bg-pink-50 items-center justify-center">
          <Ionicons name="briefcase-outline" size={20} color="#db2777" />
        </View>
      </View>
      <TopTabBar tabs={[...TABS]} active={active} onSelect={t => setActive(t as Tab)} />
      <WipPlaceholder label={active} />
    </View>
  )
}

import { useRef, useEffect } from 'react'
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'

type Props = {
  tabs: string[]
  active: string
  onSelect: (tab: string) => void
}

export function TopTabBar({ tabs, active, onSelect }: Props) {
  const scrollRef = useRef<ScrollView>(null)
  const activeIndex = tabs.indexOf(active)

  useEffect(() => {
    if (scrollRef.current && activeIndex > 1) {
      scrollRef.current.scrollTo({ x: activeIndex * 100, animated: true })
    }
  }, [activeIndex])

  // ≤4 tabs: distribute evenly across full width (no scroll needed)
  if (tabs.length <= 4) {
    return (
      <View className="flex-row bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map(tab => {
          const isActive = tab === active
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => onSelect(tab)}
              activeOpacity={0.7}
              className="flex-1 items-center py-3"
              style={{ borderBottomWidth: 2, borderBottomColor: isActive ? '#2563eb' : 'transparent' }}
            >
              <Text
                className={`text-xs font-semibold ${isActive ? 'text-blue-600' : 'text-zinc-500 dark:text-zinc-400'}`}
                numberOfLines={1}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }

  // >4 tabs: horizontal scroll with underline indicator
  return (
    <View className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: 'row' }}
      >
        {tabs.map(tab => {
          const isActive = tab === active
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => onSelect(tab)}
              activeOpacity={0.7}
              className="items-center px-4 py-3"
              style={{ borderBottomWidth: 2, borderBottomColor: isActive ? '#2563eb' : 'transparent' }}
            >
              <Text
                className={`text-xs font-semibold ${isActive ? 'text-blue-600' : 'text-zinc-500 dark:text-zinc-400'}`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

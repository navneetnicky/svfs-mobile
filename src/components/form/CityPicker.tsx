import { useState, useMemo } from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useCities } from '@hooks/useCities'
import { Autocomplete } from './Autocomplete'
import { colors, typography } from '@/src/theme'

type Props = {
  value: string
  onSelect: (name: string, id: number) => void
  required?: boolean
}

export function CityPicker({ value, onSelect, required }: Props) {
  const [query, setQuery] = useState('')
  const { data: cities = [], isLoading } = useCities()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cities.slice(0, 50)
    return cities.filter(c => c.location.toLowerCase().includes(q)).slice(0, 50)
  }, [cities, query])

  return (
    <Autocomplete
      label="To City"
      value={value}
      required={required}
      icon="location-outline"
      placeholder="Search destination city..."
      searchPlaceholder="Search destination city..."
      emptyText="No cities found"
      items={filtered}
      keyExtractor={item => String(item.id)}
      loading={isLoading && cities.length === 0}
      onQueryChange={setQuery}
      onSelect={item => onSelect(item.location, item.id)}
      renderItem={item => (
        <View style={{
          paddingHorizontal: 16, paddingVertical: 13,
          borderBottomWidth: 1, borderBottomColor: colors.border,
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: item.location === value ? colors.primaryLight : undefined,
        }}>
          <Text style={{
            flex: 1, fontSize: typography.size.base, color: colors.foreground,
            fontWeight: item.location === value ? typography.weight.bold : typography.weight.normal,
          }}>
            {item.location}
          </Text>
          {item.location === value && (
            <Ionicons name="checkmark" size={16} color={colors.primary} />
          )}
        </View>
      )}
    />
  )
}

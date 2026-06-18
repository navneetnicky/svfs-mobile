import { useState, useMemo } from 'react'
import { View, Text } from 'react-native'
import { useDrivers } from '@hooks/useDrivers'
import { Autocomplete } from './Autocomplete'
import { colors, typography } from '@/src/theme'

type Props = {
  value: string
  onChange: (name: string) => void
  required?: boolean
}

export function DriverCombobox({ value, onChange, required }: Props) {
  const [query, setQuery] = useState('')
  const { data: drivers = [], isLoading } = useDrivers()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return drivers.slice(0, 50)
    return drivers.filter(d => d.name.toLowerCase().includes(q)).slice(0, 50)
  }, [drivers, query])

  return (
    <Autocomplete
      label="Driver Name"
      value={value}
      required={required}
      icon="person-outline"
      placeholder="Full name"
      searchPlaceholder="Search driver..."
      emptyText="No drivers found"
      items={filtered}
      keyExtractor={d => d.id}
      loading={isLoading && drivers.length === 0}
      onQueryChange={q => { setQuery(q); onChange(q) }}
      onClose={q => onChange(q)}
      onSelect={d => { onChange(d.name); setQuery('') }}
      renderItem={driver => (
        <View style={{
          paddingHorizontal: 16, paddingVertical: 12,
          borderBottomWidth: 1, borderBottomColor: colors.border,
          backgroundColor: driver.name === value ? colors.primaryLight : undefined,
        }}>
          <Text style={{
            fontSize: typography.size.base,
            fontWeight: typography.weight.medium,
            color: colors.foreground,
          }}>
            {driver.name}
          </Text>
        </View>
      )}
    />
  )
}

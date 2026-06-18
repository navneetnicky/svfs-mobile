import { useState, useMemo } from 'react'
import { View, Text } from 'react-native'
import { useTrucks } from '@hooks/useTrucks'
import { Autocomplete } from './Autocomplete'
import type { TruckRecord } from '@/src/types/challan'
import { colors, typography } from '@/src/theme'

type Props = {
  value: string
  onSelect: (truck: TruckRecord) => void
  required?: boolean
}

export function TruckPicker({ value, onSelect, required }: Props) {
  const [query, setQuery] = useState('')
  const { data: trucks = [], isLoading } = useTrucks()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return trucks.slice(0, 60)
    return trucks.filter(t =>
      t.truck_number.toLowerCase().includes(q) ||
      (t.truck_type ?? '').toLowerCase().includes(q)
    ).slice(0, 60)
  }, [trucks, query])

  return (
    <Autocomplete
      label="Truck"
      value={value}
      required={required}
      icon="truck-outline"
      placeholder="Select truck..."
      searchPlaceholder="Search truck number..."
      emptyText="No trucks found"
      items={filtered}
      keyExtractor={t => t.id}
      loading={isLoading && trucks.length === 0}
      onQueryChange={setQuery}
      onSelect={onSelect}
      renderItem={truck => (
        <View style={{
          paddingHorizontal: 16, paddingVertical: 12,
          borderBottomWidth: 1, borderBottomColor: colors.border,
          flexDirection: 'row', alignItems: 'center', gap: 10,
          backgroundColor: truck.truck_number === value ? colors.primaryLight : undefined,
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: typography.size.base, fontWeight: typography.weight.semibold,
              color: colors.foreground,
            }}>
              {truck.truck_number}
            </Text>
            {truck.truck_type && (
              <Text style={{ fontSize: typography.size.xs, color: colors.subtleFg, marginTop: 1 }}>
                {truck.truck_type} · {truck.ownership_type === 'self' ? 'Own' : 'Market'}
              </Text>
            )}
          </View>
          {truck.truck_number === value && (
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
          )}
        </View>
      )}
    />
  )
}

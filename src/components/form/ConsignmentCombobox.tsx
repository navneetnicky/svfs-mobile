import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useConsignmentSearch } from '@hooks/useConsignmentSearch'
import type { ConsignmentRecord } from '@services/consignmentService'
import { colors, radius, typography } from '@/src/theme'

type Props = {
  value: string          // display name
  onSelect: (record: ConsignmentRecord) => void
  onChange: (name: string) => void
}

export function ConsignmentCombobox({ value, onSelect, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const { setQuery, results, loading } = useConsignmentSearch()

  useEffect(() => { setQuery(value) }, [value])

  function handleSelect(record: ConsignmentRecord) {
    onSelect(record)
    setOpen(false)
  }

  return (
    <View style={{ marginBottom: 12, zIndex: open ? 999 : 1 }}>
      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.mutedFg }}>
          Consignment
        </Text>
      </View>

      <View style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: 12,
        borderWidth: 1, borderColor: open ? colors.primary : colors.border,
      }}>
        <Ionicons name="cube-outline" size={15} color={colors.subtleFg} style={{ marginRight: 6 }} />
        <TextInput
          value={value}
          onChangeText={v => { onChange(v); setQuery(v); setOpen(true) }}
          onFocus={() => { setOpen(true); setQuery(value) }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Search consignment..."
          placeholderTextColor={colors.subtleFg}
          style={{ flex: 1, paddingVertical: 11, fontSize: typography.size.base, color: colors.foreground }}
        />
        {loading
          ? <ActivityIndicator size="small" color={colors.primary} />
          : <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={15} color={colors.subtleFg} />
        }
      </View>

      {open && results.length > 0 && (
        <View style={{
          position: 'absolute', top: 68, left: 0, right: 0,
          backgroundColor: colors.card, borderRadius: radius.lg,
          borderWidth: 1, borderColor: colors.border,
          maxHeight: 180, overflow: 'hidden', zIndex: 200, elevation: 10,
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
        }}>
          <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled showsVerticalScrollIndicator style={{ flex: 1 }}>
            {results.map((record, index) => (
              <TouchableOpacity
                key={record.id}
                onPress={() => handleSelect(record)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 10,
                  borderBottomWidth: index < results.length - 1 ? 1 : 0,
                  borderBottomColor: colors.muted,
                }}
              >
                <Text style={{ fontSize: typography.size.base, fontWeight: typography.weight.semibold, color: colors.foreground }}>
                  {record.consignment_name}
                </Text>
                {record.description && (
                  <Text style={{ fontSize: typography.size.xs, color: colors.subtleFg, marginTop: 1 }}>
                    {record.description}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

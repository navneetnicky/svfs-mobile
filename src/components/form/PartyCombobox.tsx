import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { usePartySearch } from '@hooks/usePartySearch'
import type { PartyRecord } from '@services/partyService'
import { colors, radius, typography } from '@/src/theme'

type Props = {
  label: string
  value: string
  onChange: (name: string) => void
  onSelect: (party: PartyRecord) => void
  required?: boolean
}

export function PartyCombobox({ label, value, onChange, onSelect, required }: Props) {
  const [open, setOpen] = useState(false)
  const { query, setQuery, results, loading } = usePartySearch()

  // Keep query in sync when typing
  useEffect(() => { setQuery(value) }, [value])

  function handleSelect(party: PartyRecord) {
    onSelect(party)
    setOpen(false)
  }

  return (
    <View style={{ marginBottom: 12, zIndex: 100 }}>
      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.mutedFg }}>
          {label}
        </Text>
        {required && <Text style={{ color: colors.destructive, marginLeft: 2 }}>*</Text>}
      </View>

      <View style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: 12,
        borderWidth: 1, borderColor: open ? colors.primary : colors.border,
      }}>
        <Ionicons name="person-outline" size={15} color={colors.subtleFg} style={{ marginRight: 6 }} />
        <TextInput
          value={value}
          onChangeText={v => { onChange(v); setQuery(v); setOpen(true) }}
          onFocus={() => { setOpen(true); setQuery(value) }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={`Search or type ${label.toLowerCase()}...`}
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
          maxHeight: 200, zIndex: 200, elevation: 10,
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
        }}>
          <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {results.map((party, index) => (
              <TouchableOpacity
                key={party.id}
                onPress={() => handleSelect(party)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 10,
                  borderBottomWidth: index < results.length - 1 ? 1 : 0,
                  borderBottomColor: colors.muted,
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                }}
              >
                <View style={{
                  width: 30, height: 30, borderRadius: 15,
                  backgroundColor: colors.primaryLight,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.primary }}>
                    {party.legal_name[0]?.toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: typography.size.base, fontWeight: typography.weight.semibold, color: colors.foreground }} numberOfLines={1}>
                    {party.legal_name}
                  </Text>
                  {party.contacts?.[0]?.phone && (
                    <Text style={{ fontSize: typography.size.xs, color: colors.subtleFg }}>{party.contacts[0].phone}</Text>
                  )}
                </View>
                {party.gst_number && (
                  <Text style={{ fontSize: 9, color: colors.mutedFg, fontFamily: 'monospace' }} numberOfLines={1}>
                    {party.gst_number}
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

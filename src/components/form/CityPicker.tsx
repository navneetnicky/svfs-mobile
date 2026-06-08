import { useState, useMemo } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useCities } from '@hooks/useCities'
import { colors, radius, typography } from '@/src/theme'

type Props = {
  value: string
  onSelect: (name: string, id: number) => void
  required?: boolean
}

export function CityPicker({ value, onSelect, required }: Props) {
  const [open,   setOpen]   = useState(false)
  const [search, setSearch] = useState('')
  const { data: cities = [], isLoading } = useCities()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return cities.slice(0, 50)
    return cities.filter(c => c.location.toLowerCase().includes(q)).slice(0, 50)
  }, [cities, search])

  function handleSelect(name: string, id: number) {
    onSelect(name, id)
    setOpen(false)
    setSearch('')
  }

  return (
    <View style={{ marginBottom: 12, zIndex: 100 }}>
      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.mutedFg }}>
          To City
        </Text>
        {required && <Text style={{ color: colors.destructive, marginLeft: 2 }}>*</Text>}
      </View>

      <View style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.card, borderRadius: radius.lg,
        paddingHorizontal: 12,
        borderWidth: 1, borderColor: open ? colors.primary : colors.border,
      }}>
        <Ionicons name="location-outline" size={15} color={colors.subtleFg} style={{ marginRight: 6 }} />
        <TextInput
          value={open ? search : value}
          onChangeText={v => { setSearch(v); if (!open) setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => { setOpen(false); setSearch('') }, 150)}
          placeholder="Search destination city..."
          placeholderTextColor={colors.subtleFg}
          style={{ flex: 1, paddingVertical: 11, fontSize: typography.size.base, color: colors.foreground }}
        />
        {open && search.length > 0
          ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={16} color={colors.subtleFg} /></TouchableOpacity>
          : <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={15} color={colors.subtleFg} />
        }
      </View>

      {open && (
        <View style={{
          position: 'absolute', top: 68, left: 0, right: 0,
          backgroundColor: colors.card, borderRadius: radius.lg,
          borderWidth: 1, borderColor: colors.border,
          maxHeight: 220, zIndex: 200, elevation: 10,
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
        }}>
          {isLoading ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : filtered.length === 0 ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <Text style={{ color: colors.subtleFg, fontSize: typography.size.sm }}>No cities found</Text>
            </View>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {filtered.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleSelect(item.location, item.id)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 11,
                    borderBottomWidth: index < filtered.length - 1 ? 1 : 0,
                    borderBottomColor: colors.muted,
                    backgroundColor: item.location === value ? colors.primaryLight : colors.card,
                    flexDirection: 'row', alignItems: 'center',
                  }}
                >
                  <Text style={{
                    fontSize: typography.size.base, color: colors.foreground, flex: 1,
                    fontWeight: item.location === value ? typography.weight.bold : typography.weight.normal,
                  }}>
                    {item.location}
                  </Text>
                  {item.location === value && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  )
}

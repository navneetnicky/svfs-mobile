import { View, Text } from 'react-native'
import { usePartySearch } from '@hooks/usePartySearch'
import type { PartyRecord } from '@services/partyService'
import { Autocomplete } from './Autocomplete'
import { colors, typography } from '@/src/theme'

type Props = {
  label: string
  value: string
  onChange: (name: string) => void
  onSelect: (party: PartyRecord) => void
  required?: boolean
}

export function PartyCombobox({ label, value, onChange, onSelect, required }: Props) {
  const { setQuery, results, loading } = usePartySearch()

  function handleQueryChange(q: string) {
    onChange(q)
    setQuery(q)
  }

  function handleSelect(party: PartyRecord) {
    onSelect(party)
  }

  return (
    <Autocomplete
      label={label}
      value={value}
      required={required}
      icon="person-outline"
      placeholder={`Search or type ${label.toLowerCase()}...`}
      searchPlaceholder={`Search ${label.toLowerCase()}...`}
      emptyText="No parties found"
      items={results}
      keyExtractor={party => party.id}
      loading={loading}
      onQueryChange={handleQueryChange}
      onClose={q => onChange(q)}
      onSelect={handleSelect}
      renderItem={party => (
        <View style={{
          paddingHorizontal: 16, paddingVertical: 10,
          borderBottomWidth: 1, borderBottomColor: colors.border,
          flexDirection: 'row', alignItems: 'center', gap: 10,
        }}>
          <View style={{
            width: 34, height: 34, borderRadius: 17,
            backgroundColor: colors.primaryMuted,
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
            {party.locationMaster?.address ? (
              <Text style={{ fontSize: typography.size.xs, color: colors.subtleFg }} numberOfLines={1}>
                {party.locationMaster.address}
              </Text>
            ) : party.contacts?.[0]?.phone ? (
              <Text style={{ fontSize: typography.size.xs, color: colors.subtleFg }}>
                {party.contacts[0].phone}
              </Text>
            ) : null}
          </View>
          {party.gst_number && (
            <Text style={{ fontSize: 9, color: colors.mutedFg, fontFamily: 'monospace' }} numberOfLines={1}>
              {party.gst_number}
            </Text>
          )}
        </View>
      )}
    />
  )
}

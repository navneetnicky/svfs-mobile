import { View, Text } from 'react-native'
import { useConsignmentSearch } from '@hooks/useConsignmentSearch'
import type { ConsignmentRecord } from '@services/consignmentService'
import { Autocomplete } from './Autocomplete'
import { colors, typography } from '@/src/theme'

type Props = {
  value: string
  onSelect: (record: ConsignmentRecord) => void
  onChange: (name: string) => void
}

export function ConsignmentCombobox({ value, onSelect, onChange }: Props) {
  const { setQuery, results, loading } = useConsignmentSearch()

  function handleQueryChange(q: string) {
    onChange(q)
    setQuery(q)
  }

  return (
    <Autocomplete
      label="Consignment"
      value={value}
      icon="cube-outline"
      placeholder="Search consignment..."
      searchPlaceholder="Search consignment..."
      emptyText="No consignments found"
      items={results}
      keyExtractor={record => record.id}
      loading={loading}
      onQueryChange={handleQueryChange}
      onClose={q => onChange(q)}
      onSelect={onSelect}
      renderItem={record => (
        <View style={{
          paddingHorizontal: 16, paddingVertical: 12,
          borderBottomWidth: 1, borderBottomColor: colors.border,
        }}>
          <Text style={{ fontSize: typography.size.base, fontWeight: typography.weight.semibold, color: colors.foreground }}>
            {record.consignment_name}
          </Text>
          {record.description && (
            <Text style={{ fontSize: typography.size.xs, color: colors.subtleFg, marginTop: 2 }}>
              {record.description}
            </Text>
          )}
        </View>
      )}
    />
  )
}

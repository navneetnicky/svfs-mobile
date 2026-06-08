import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius, typography } from '@/src/theme'
import { FormField } from './FormField'

export interface ReceiverExtra {
  address: string
  document_note: string
}

export function emptyReceiverExtra(): ReceiverExtra {
  return { address: '', document_note: '' }
}

type Tab = 'address' | 'document'

const TABS: { id: Tab; label: string }[] = [
  { id: 'address',  label: 'Address' },
  { id: 'document', label: 'Document' },
]

type Props = {
  value: ReceiverExtra
  onChange: (v: ReceiverExtra) => void
}

export function ReceiverSection({ value, onChange }: Props) {
  const [tab, setTab] = useState<Tab>('address')

  return (
    <View>
      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {TABS.map(t => {
            const active = tab === t.id
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTab(t.id)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 7,
                  borderRadius: radius.full,
                  backgroundColor: active ? colors.primary : colors.background,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                }}
              >
                <Text style={{
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.semibold,
                  color: active ? '#fff' : colors.mutedFg,
                }}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      {tab === 'address' && (
        <FormField
          label="Receiver Address"
          value={value.address}
          onChangeText={v => onChange({ ...value, address: v })}
          placeholder="Full delivery address..."
          multiline
        />
      )}

      {tab === 'document' && (
        <View style={{
          borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
          borderStyle: 'dashed', padding: 24, alignItems: 'center', gap: 10,
        }}>
          <Ionicons name="document-attach-outline" size={32} color={colors.subtleFg} />
          <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.mutedFg }}>
            Attach Documents
          </Text>
          <Text style={{ fontSize: typography.size.xs, color: colors.subtleFg, textAlign: 'center' }}>
            Document upload will be available in a future update.
          </Text>
        </View>
      )}
    </View>
  )
}

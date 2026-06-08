import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius, typography } from '@/src/theme'
import { FormField } from './FormField'
import { SegmentControl } from './SegmentControl'
import type { PartyAddress } from '@/src/services/partyService'

export interface ReceiverExtra {
  address: string
  address_type: string
  document_note: string
}

export function emptyReceiverExtra(): ReceiverExtra {
  return { address: '', address_type: 'HOME', document_note: '' }
}

type Tab = 'address' | 'document'

const TABS: { id: Tab; label: string }[] = [
  { id: 'address',  label: 'Address' },
  { id: 'document', label: 'Document' },
]

type Props = {
  value: ReceiverExtra
  onChange: (v: ReceiverExtra) => void
  savedAddresses?: PartyAddress[]
}

export function ReceiverSection({ value, onChange, savedAddresses }: Props) {
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
        <View>
          <SegmentControl
            label="Address Type"
            options={[
              { value: 'HOME',      label: 'Home' },
              { value: 'OFFICE',    label: 'Office' },
              { value: 'WAREHOUSE', label: 'Warehouse' },
            ]}
            value={value.address_type}
            onChange={v => onChange({ ...value, address_type: v })}
          />
          {savedAddresses && savedAddresses.length > 0 ? (
            <View>
              <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.mutedFg, marginBottom: 8 }}>
                Saved Addresses
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {savedAddresses.map(addr => {
                  const selected = value.address === addr.address
                  return (
                    <TouchableOpacity
                      key={addr.id}
                      onPress={() => onChange({ ...value, address: addr.address, address_type: addr.address_type || value.address_type })}
                      style={{
                        paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full,
                        backgroundColor: selected ? colors.primary : colors.background,
                        borderWidth: 1, borderColor: selected ? colors.primary : colors.border,
                      }}
                    >
                      <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: selected ? '#fff' : colors.mutedFg }}>
                        {addr.address_type}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
              {value.address ? (
                <Text style={{ fontSize: typography.size.sm, color: colors.foreground, padding: 10, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background }}>
                  {value.address}
                </Text>
              ) : null}
            </View>
          ) : (
            <FormField
              label="Receiver Address"
              value={value.address}
              onChangeText={v => onChange({ ...value, address: v })}
              placeholder="Full delivery address..."
              multiline
            />
          )}
        </View>
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

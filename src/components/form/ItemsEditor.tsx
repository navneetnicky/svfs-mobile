import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius, typography } from '@/src/theme'
import { ConsignmentCombobox } from './ConsignmentCombobox'

export interface ItemDraft {
  pkg_count: string
  consignment_id: string
  consignment_name: string
  description: string
  unit: string
  actual_weight: string
  charged_weight: string
  rate: string
}

export const UNITS = ['PKT', 'BOX', 'KG', 'LTR', 'PCS'] as const
const COUNT_UNITS = ['PKT', 'BOX', 'PCS']

export function emptyItem(): ItemDraft {
  return {
    pkg_count: '', consignment_id: '', consignment_name: '',
    description: '', unit: 'PKT', actual_weight: '', charged_weight: '', rate: '',
  }
}

function calcTotal(item: ItemDraft): number {
  const rate = parseFloat(item.rate || '0')
  if (COUNT_UNITS.includes(item.unit)) {
    return (parseFloat(item.pkg_count || '0')) * rate
  }
  return (parseFloat(item.charged_weight || item.actual_weight || '0')) * rate
}

function inp(value: string, onChangeText: (v: string) => void, placeholder: string, numeric?: boolean) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.subtleFg}
      keyboardType={numeric ? 'numeric' : 'default'}
      style={{
        backgroundColor: colors.background, borderRadius: radius.md,
        paddingHorizontal: 8, paddingVertical: 7,
        fontSize: typography.size.sm, color: colors.foreground,
        borderWidth: 1, borderColor: colors.border,
      }}
    />
  )
}

type Props = {
  items: ItemDraft[]
  onChange: (items: ItemDraft[]) => void
}

export function ItemsEditor({ items, onChange }: Props) {
  function update(i: number, field: keyof ItemDraft, v: string) {
    onChange(items.map((item, idx) => idx === i ? { ...item, [field]: v } : item))
  }

  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i))
  }

  return (
    <View>
      {items.map((item, i) => {
        const isCountUnit = COUNT_UNITS.includes(item.unit)
        const total = calcTotal(item)
        return (
          <View key={i} style={{
            backgroundColor: colors.background, borderRadius: radius.lg,
            padding: 12, marginBottom: 10,
            borderWidth: 1, borderColor: colors.border,
          }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: typography.size.base, fontWeight: typography.weight.bold, color: colors.foreground }}>
                Item {i + 1}
              </Text>
              {items.length > 1 && (
                <TouchableOpacity onPress={() => remove(i)}>
                  <Ionicons name="trash-outline" size={16} color={colors.destructive} />
                </TouchableOpacity>
              )}
            </View>

            {/* Consignment combobox */}
            <ConsignmentCombobox
              value={item.consignment_name}
              onChange={v => update(i, 'consignment_name', v)}
              onSelect={record => {
                onChange(items.map((it, idx) => idx === i
                  ? { ...it, consignment_id: record.id, consignment_name: record.consignment_name }
                  : it
                ))
              }}
            />

            {/* Row 1: Pkg Count + Description */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <View style={{ width: 72 }}>
                <Text style={{ fontSize: typography.size.xs, color: colors.subtleFg, marginBottom: 3 }}>Pkg Count</Text>
                {inp(item.pkg_count, v => update(i, 'pkg_count', v), '0', true)}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: typography.size.xs, color: colors.subtleFg, marginBottom: 3 }}>Description</Text>
                {inp(item.description, v => update(i, 'description', v), 'Goods description')}
              </View>
            </View>

            {/* Row 2: Unit selector */}
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: typography.size.xs, color: colors.subtleFg, marginBottom: 4 }}>Unit</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {UNITS.map(u => {
                    const active = item.unit === u
                    return (
                      <TouchableOpacity
                        key={u}
                        onPress={() => update(i, 'unit', u)}
                        style={{
                          paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full,
                          backgroundColor: active ? colors.primary : colors.card,
                          borderWidth: 1, borderColor: active ? colors.primary : colors.border,
                        }}
                      >
                        <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: active ? '#fff' : colors.mutedFg }}>{u}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Row 3: Weight fields (disabled for count units) + Rate */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: typography.size.xs, color: isCountUnit ? colors.border : colors.subtleFg, marginBottom: 3 }}>Act. Weight</Text>
                <TextInput
                  value={item.actual_weight}
                  onChangeText={v => update(i, 'actual_weight', v)}
                  placeholder="0"
                  placeholderTextColor={colors.subtleFg}
                  keyboardType="numeric"
                  editable={!isCountUnit}
                  style={{
                    backgroundColor: isCountUnit ? colors.muted : colors.background,
                    borderRadius: radius.md, paddingHorizontal: 8, paddingVertical: 7,
                    fontSize: typography.size.sm, color: isCountUnit ? colors.subtleFg : colors.foreground,
                    borderWidth: 1, borderColor: colors.border,
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: typography.size.xs, color: isCountUnit ? colors.border : colors.subtleFg, marginBottom: 3 }}>Ch. Weight</Text>
                <TextInput
                  value={item.charged_weight}
                  onChangeText={v => update(i, 'charged_weight', v)}
                  placeholder="0"
                  placeholderTextColor={colors.subtleFg}
                  keyboardType="numeric"
                  editable={!isCountUnit}
                  style={{
                    backgroundColor: isCountUnit ? colors.muted : colors.background,
                    borderRadius: radius.md, paddingHorizontal: 8, paddingVertical: 7,
                    fontSize: typography.size.sm, color: isCountUnit ? colors.subtleFg : colors.foreground,
                    borderWidth: 1, borderColor: colors.border,
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: typography.size.xs, color: colors.subtleFg, marginBottom: 3 }}>Rate</Text>
                {inp(item.rate, v => update(i, 'rate', v), '0', true)}
              </View>
            </View>

            {/* Total */}
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: typography.size.sm, color: colors.primary, fontWeight: typography.weight.bold }}>
                ₹ {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        )
      })}

      <TouchableOpacity
        onPress={() => onChange([...items, emptyItem()])}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 }}
      >
        <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
        <Text style={{ color: colors.primary, fontWeight: typography.weight.semibold, fontSize: typography.size.sm }}>Add Item</Text>
      </TouchableOpacity>
    </View>
  )
}

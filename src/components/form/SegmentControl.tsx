import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { colors, radius, typography } from '@/src/theme'

type ActiveColors = { bg: string; border: string; text: string }

type Props<T extends string> = {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  required?: boolean
  colorMap?: Partial<Record<T, ActiveColors>>
}

export function SegmentControl<T extends string>({ label, options, value, onChange, required, colorMap }: Props<T>) {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.mutedFg }}>
          {label}
        </Text>
        {required && <Text style={{ color: colors.destructive, marginLeft: 2, fontSize: typography.size.sm }}>*</Text>}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {options.map(opt => {
            const active = value === opt.value
            const custom = colorMap?.[opt.value]
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => onChange(opt.value)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: radius.full,
                  backgroundColor: active ? (custom?.bg ?? colors.primary) : colors.card,
                  borderWidth: 1,
                  borderColor: active ? (custom?.border ?? colors.primary) : colors.border,
                }}
              >
                <Text style={{
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.semibold,
                  color: active ? (custom?.text ?? '#fff') : colors.mutedFg,
                }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}

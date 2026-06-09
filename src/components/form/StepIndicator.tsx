import { View, Text, TouchableOpacity } from 'react-native'
import { colors, typography } from '@/src/theme'

type Props = {
  steps: string[]
  current: number   // 0-based
  onPress?: (i: number) => void
}

export function StepIndicator({ steps, current, onPress }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
      {steps.map((label, i) => {
        const done   = i < current
        const active = i === current
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              {i > 0 && (
                <View style={{ flex: 1, height: 2, backgroundColor: (done || active) ? colors.primary : colors.border }} />
              )}
              <TouchableOpacity
                onPress={() => done && onPress?.(i)}
                style={{
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: active ? colors.primary : done ? colors.primary : colors.card,
                  borderWidth: active || done ? 0 : 1,
                  borderColor: colors.border,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text style={{
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.bold,
                  color: active || done ? '#fff' : colors.subtleFg,
                }}>
                  {done ? '✓' : String(i + 1)}
                </Text>
              </TouchableOpacity>
              {i < steps.length - 1 && (
                <View style={{ flex: 1, height: 2, backgroundColor: done ? colors.primary : colors.border }} />
              )}
            </View>
            <Text style={{
              fontSize: 9,
              fontWeight: active ? typography.weight.bold : typography.weight.medium,
              color: active ? colors.primary : done ? colors.mutedFg : colors.subtleFg,
              marginTop: 4,
              textAlign: 'center',
            }} numberOfLines={1}>
              {label}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

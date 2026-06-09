import { View, Text, TextInput, type TextInputProps } from 'react-native'
import { colors, radius, typography } from '@/src/theme'

type Props = Omit<TextInputProps, 'style'> & {
  label: string
  required?: boolean
  hint?: string
}

export function FormField({ label, required, hint, multiline, ...inputProps }: Props) {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.mutedFg }}>
          {label}
        </Text>
        {required && <Text style={{ color: colors.destructive, marginLeft: 2, fontSize: typography.size.sm }}>*</Text>}
      </View>
      {hint && (
        <Text style={{ fontSize: typography.size.xs, color: colors.subtleFg, marginBottom: 4 }}>{hint}</Text>
      )}
      <TextInput
        placeholderTextColor={colors.subtleFg}
        multiline={multiline}
        {...inputProps}
        style={{
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          paddingHorizontal: 12,
          paddingVertical: multiline ? 10 : 11,
          fontSize: typography.size.base,
          color: colors.foreground,
          borderWidth: 1,
          borderColor: colors.border,
          minHeight: multiline ? 80 : undefined,
          textAlignVertical: multiline ? 'top' : undefined,
        }}
      />
    </View>
  )
}

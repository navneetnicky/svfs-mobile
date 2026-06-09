import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius, typography } from '@/src/theme'
import { ewayBillService, type EwayBillDetails } from '@/src/services/ewayBillService'

type Status = 'idle' | 'loading' | 'valid' | 'invalid'

type Props = {
  value: string
  onChangeText: (v: string) => void
  onValidated?: (details: EwayBillDetails) => void
}

export function EwayBillField({ value, onChangeText, onValidated }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [validUpto, setValidUpto] = useState('')

  function handleChange(v: string) {
    onChangeText(v.replace(/\D/g, '').slice(0, 12))
    setStatus('idle')
    setValidUpto('')
  }

  async function validate() {
    if (value.length < 12) return
    setStatus('loading')
    try {
      const res = await ewayBillService.get(value.trim())
      if (res.data) {
        setStatus('valid')
        setValidUpto(res.data.validUpto ?? '')
        onValidated?.(res.data)
      } else {
        setStatus('invalid')
      }
    } catch {
      setStatus('invalid')
    }
  }

  const canValidate = value.length === 12

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.mutedFg, marginBottom: 4 }}>
        E-Way Bill No.
      </Text>

      <View style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.card, borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: status === 'valid' ? colors.success : status === 'invalid' ? colors.destructive : colors.border,
        paddingHorizontal: 12,
      }}>
        <TextInput
          value={value}
          onChangeText={handleChange}
          placeholder="12-digit EWB number"
          placeholderTextColor={colors.subtleFg}
          keyboardType="numeric"
          maxLength={12}
          style={{ flex: 1, paddingVertical: 11, fontSize: typography.size.base, color: colors.foreground }}
        />

        {status === 'loading' ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />
        ) : status === 'valid' ? (
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
        ) : status === 'invalid' ? (
          <Ionicons name="close-circle" size={18} color={colors.destructive} />
        ) : (
          <TouchableOpacity
            onPress={validate}
            disabled={!canValidate}
            style={{
              paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.md,
              backgroundColor: canValidate ? colors.primaryLight : colors.muted,
            }}
          >
            <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: canValidate ? colors.primary : colors.subtleFg }}>
              Validate
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {status === 'valid' && validUpto ? (
        <Text style={{ fontSize: typography.size.xs, color: colors.success, marginTop: 4, marginLeft: 2 }}>
          ✓ Valid upto {validUpto}
        </Text>
      ) : status === 'invalid' ? (
        <Text style={{ fontSize: typography.size.xs, color: colors.destructive, marginTop: 4, marginLeft: 2 }}>
          EWB not found or invalid
        </Text>
      ) : null}
    </View>
  )
}

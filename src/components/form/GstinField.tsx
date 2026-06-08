import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius, typography } from '@/src/theme'
import { gstService } from '@/src/services/gstService'

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/

type Status = 'idle' | 'loading' | 'valid' | 'invalid'

type Props = {
  label?: string
  value: string
  onChangeText: (v: string) => void
  required?: boolean
}

export function GstinField({ label = 'GSTIN', value, onChangeText, required }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [companyName, setCompanyName] = useState('')

  const canVerify = GSTIN_REGEX.test(value.toUpperCase())

  function handleChange(v: string) {
    onChangeText(v.toUpperCase().slice(0, 15))
    setStatus('idle')
    setCompanyName('')
  }

  async function verify() {
    if (!canVerify) return
    setStatus('loading')
    try {
      const res = await gstService.validate(value.toUpperCase())
      if (res.valid) {
        setStatus('valid')
        setCompanyName(res.company_details?.legal_name ?? '')
      } else {
        setStatus('invalid')
        setCompanyName('')
      }
    } catch {
      setStatus('invalid')
      setCompanyName('')
    }
  }

  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.mutedFg }}>
          {label}
        </Text>
        {required && <Text style={{ color: colors.destructive, marginLeft: 2 }}>*</Text>}
      </View>

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
          placeholder="e.g. 22AAAAA0000A1Z5"
          placeholderTextColor={colors.subtleFg}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={15}
          style={{ flex: 1, paddingVertical: 11, fontSize: typography.size.base, color: colors.foreground, fontFamily: 'monospace' }}
        />

        {status === 'loading' ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />
        ) : status === 'valid' ? (
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
        ) : status === 'invalid' ? (
          <Ionicons name="close-circle" size={18} color={colors.destructive} />
        ) : (
          <TouchableOpacity
            onPress={verify}
            disabled={!canVerify}
            style={{
              paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.md,
              backgroundColor: canVerify ? colors.primaryLight : colors.muted,
            }}
          >
            <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: canVerify ? colors.primary : colors.subtleFg }}>
              Verify
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {status === 'valid' && companyName ? (
        <Text style={{ fontSize: typography.size.xs, color: colors.success, marginTop: 4, marginLeft: 2 }}>
          ✓ {companyName}
        </Text>
      ) : status === 'invalid' ? (
        <Text style={{ fontSize: typography.size.xs, color: colors.destructive, marginTop: 4, marginLeft: 2 }}>
          Invalid GSTIN
        </Text>
      ) : null}
    </View>
  )
}

import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius, typography, shadow } from '@/src/theme'
import type { BookingType } from '@/src/types/booking'

const BAR_COLORS: Record<BookingType, { bg: string; border: string; accent: string; text: string }> = {
  PAID:   { bg: '#d1fae5', border: '#6ee7b7', accent: '#059669', text: '#047857' },
  TO_PAY: { bg: '#fef3c7', border: '#fcd34d', accent: '#d97706', text: '#b45309' },
  TBB:    { bg: '#dbeafe', border: '#93c5fd', accent: '#2563eb', text: '#1d4ed8' },
  FOC:    { bg: '#e2e8f0', border: '#cbd5e1', accent: '#64748b', text: '#475569' },
}

const PAY_MODES = ['Cash', 'Paytm', 'Online', 'Credit'] as const

export type { BookingType }

type Props = {
  bookingType: BookingType
  grandTotal: number
  gstPaidBy: string
  onGstToggle: (val: string) => void
  remarks: string
  onRemarksChange: (v: string) => void
  payMode: string
  onPayModeChange: (v: string) => void
  isLastStep: boolean
  showBack: boolean
  isPending: boolean
  onBack: () => void
  onContinue: () => void
}

export function BookingFooterBar({
  bookingType, grandTotal,
  gstPaidBy, onGstToggle,
  remarks, onRemarksChange,
  payMode, onPayModeChange,
  isLastStep, showBack, isPending,
  onBack, onContinue,
}: Props) {
  const { bottom: bottomInset } = useSafeAreaInsets()
  const bar = BAR_COLORS[bookingType]
  const isLocked = bookingType === 'TBB' || bookingType === 'FOC'
  const gstSecondLabel = bookingType === 'TO_PAY' ? 'Receiver' : bookingType === 'TBB' ? 'Party' : 'Sender'

  return (
    <View style={{
      backgroundColor: bar.bg,
      borderTopWidth: 1.5, borderTopColor: bar.border,
      paddingHorizontal: 14, paddingTop: 10,
      paddingBottom: bottomInset + 8,
      shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 6,
    }}>

      {/* Row 1: GST pills + Payment Mode */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>

        {/* GST Paid By */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: bar.text, opacity: 0.8 }}>
            GST
          </Text>
          <TouchableOpacity
            onPress={() => onGstToggle('Exempt')}
            style={{
              paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full,
              borderWidth: 1,
              backgroundColor: gstPaidBy === 'Exempt' ? '#334155' : 'transparent',
              borderColor: gstPaidBy === 'Exempt' ? '#334155' : bar.border,
              opacity: isLocked ? 0.7 : 1,
            }}
          >
            <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: gstPaidBy === 'Exempt' ? '#fff' : bar.text }}>
              Exempt{isLocked ? ' (locked)' : ''}
            </Text>
          </TouchableOpacity>

          {!isLocked && (
            <TouchableOpacity
              onPress={() => onGstToggle(gstSecondLabel)}
              style={{
                paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full,
                borderWidth: 1,
                backgroundColor: gstPaidBy === gstSecondLabel ? bar.accent : 'transparent',
                borderColor: gstPaidBy === gstSecondLabel ? bar.accent : bar.border,
              }}
            >
              <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: gstPaidBy === gstSecondLabel ? '#fff' : bar.text }}>
                {gstSecondLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Payment Mode — PAID only */}
        {bookingType === 'PAID' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: bar.text, opacity: 0.8 }}>
              Pay
            </Text>
            {PAY_MODES.map(mode => (
              <TouchableOpacity
                key={mode}
                onPress={() => onPayModeChange(mode)}
                style={{
                  paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full,
                  borderWidth: 1,
                  backgroundColor: payMode === mode ? bar.accent : 'transparent',
                  borderColor: payMode === mode ? bar.accent : bar.border,
                }}
              >
                <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: payMode === mode ? '#fff' : bar.text }}>
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Row 2: Remarks */}
      <TextInput
        value={remarks}
        onChangeText={onRemarksChange}
        placeholder="Special instructions…"
        placeholderTextColor={bar.text + '80'}
        style={{
          fontSize: typography.size.sm, color: bar.text,
          paddingVertical: 7, paddingHorizontal: 10,
          borderRadius: radius.lg, marginBottom: 10,
          borderWidth: 1, borderColor: bar.border,
          backgroundColor: 'rgba(255,255,255,0.5)',
        }}
      />

      {/* Row 3: Grand Total + Back + Continue */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{
          flex: 1, paddingVertical: 8, paddingHorizontal: 10,
          borderRadius: radius.lg, borderWidth: 1, borderColor: bar.border,
          backgroundColor: 'rgba(255,255,255,0.6)',
        }}>
          <Text style={{ fontSize: 9, fontWeight: typography.weight.medium, color: bar.text, opacity: 0.7 }}>GRAND TOTAL</Text>
          <Text style={{ fontSize: typography.size.base, fontWeight: typography.weight.extrabold, color: bar.accent }}>
            ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        {showBack && (
          <TouchableOpacity
            onPress={onBack}
            style={{
              paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.xl,
              borderWidth: 1, borderColor: bar.border,
              backgroundColor: 'rgba(255,255,255,0.5)',
            }}
          >
            <Text style={{ fontWeight: typography.weight.semibold, color: bar.text, fontSize: typography.size.sm }}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={onContinue}
          disabled={isPending}
          style={{
            paddingVertical: 10, paddingHorizontal: 18, borderRadius: radius.xl,
            backgroundColor: bar.accent,
            flexDirection: 'row', alignItems: 'center', gap: 6,
            ...shadow.colored(bar.accent),
          }}
        >
          {isPending
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name={isLastStep ? 'checkmark-circle' : 'arrow-forward'} size={16} color="#fff" />
          }
          <Text style={{ color: '#fff', fontWeight: typography.weight.bold, fontSize: typography.size.sm }}>
            {isLastStep ? 'Create' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  )
}

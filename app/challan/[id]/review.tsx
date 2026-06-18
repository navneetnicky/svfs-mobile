import { useState, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useChallan, useReviewChallan } from '@hooks/useChallans'
import type { ReviewStatus, ChallanLRRecord } from '@/src/types/challan'
import { colors, radius, typography } from '@/src/theme'

type LRDraft = {
  challan_lr_id:   number
  status?:         ReviewStatus
  received_pkgs?:  string
  received_weight?: string
}

const STATUS_OPTIONS: { value: ReviewStatus; label: string; icon: string; color: string; bg: string }[] = [
  { value: 'received', label: 'Received',  icon: 'checkmark-circle', color: '#065f46', bg: '#d1fae5' },
  { value: 'shortage', label: 'Shortage',  icon: 'warning',          color: '#92400e', bg: '#fef3c7' },
  { value: 'damaged',  label: 'Damaged',   icon: 'close-circle',     color: '#991b1b', bg: '#fee2e2' },
]

function StatusChip({ option, selected, onPress }: {
  option: typeof STATUS_OPTIONS[0]
  selected: boolean
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 6,
        borderRadius: radius.full,
        borderWidth: 1.5,
        borderColor: selected ? option.color : colors.border,
        backgroundColor: selected ? option.bg : 'transparent',
      }}
    >
      <Ionicons
        name={option.icon as any}
        size={13}
        color={selected ? option.color : colors.subtleFg}
      />
      <Text style={{
        fontSize: typography.size.xs,
        fontWeight: typography.weight.semibold,
        color: selected ? option.color : colors.subtleFg,
      }}>
        {option.label}
      </Text>
    </TouchableOpacity>
  )
}

function LRReviewRow({ lr, draft, onChange }: {
  lr: ChallanLRRecord
  draft: LRDraft
  onChange: (d: Partial<LRDraft>) => void
}) {
  const pkgs = lr.booking.items[0]?.pkg_count ?? 0
  const weight = Number(lr.booking.items[0]?.actual_weight ?? 0)

  return (
    <View style={{
      backgroundColor: colors.card, borderRadius: radius.xl,
      borderWidth: 1, borderColor: colors.border,
      marginBottom: 10, overflow: 'hidden',
    }}>
      {/* LR info */}
      <View style={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.primary, fontFamily: 'monospace' }}>
            {lr.booking.lr_number}
          </Text>
          <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.foreground }}>
            ₹{Number(lr.booking.grand_total || 0).toLocaleString('en-IN')}
          </Text>
        </View>
        <Text style={{ fontSize: typography.size.sm, color: colors.foreground }} numberOfLines={1}>
          {lr.booking.sender_name} <Text style={{ color: colors.subtleFg }}>→</Text> {lr.booking.receiver_name}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
          <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg }}>{lr.booking.to_city}</Text>
          <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg }}>{pkgs} pkgs · {weight} kg</Text>
        </View>
      </View>

      {/* Status picker */}
      <View style={{
        flexDirection: 'row', gap: 8, flexWrap: 'wrap',
        paddingHorizontal: 14, paddingBottom: 14,
      }}>
        {STATUS_OPTIONS.map(opt => (
          <StatusChip
            key={opt.value}
            option={opt}
            selected={draft.status === opt.value}
            onPress={() => onChange({ status: opt.value })}
          />
        ))}
      </View>

      {/* Shortage details */}
      {draft.status === 'shortage' && (
        <View style={{
          borderTopWidth: 1, borderTopColor: colors.border,
          padding: 14, gap: 10,
          backgroundColor: '#fffbeb',
        }}>
          <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.bold, color: '#92400e', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Shortage Details
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg, marginBottom: 4 }}>Received Pkgs</Text>
              <TextInput
                value={draft.received_pkgs ?? ''}
                onChangeText={v => onChange({ received_pkgs: v })}
                keyboardType="numeric"
                placeholder={String(pkgs)}
                placeholderTextColor={colors.subtleFg}
                style={{
                  backgroundColor: colors.card, borderRadius: radius.lg,
                  borderWidth: 1, borderColor: colors.border,
                  paddingHorizontal: 12, paddingVertical: 9,
                  fontSize: typography.size.sm, color: colors.foreground,
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg, marginBottom: 4 }}>Received Weight (kg)</Text>
              <TextInput
                value={draft.received_weight ?? ''}
                onChangeText={v => onChange({ received_weight: v })}
                keyboardType="numeric"
                placeholder={String(weight)}
                placeholderTextColor={colors.subtleFg}
                style={{
                  backgroundColor: colors.card, borderRadius: radius.lg,
                  borderWidth: 1, borderColor: colors.border,
                  paddingHorizontal: 12, paddingVertical: 9,
                  fontSize: typography.size.sm, color: colors.foreground,
                }}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default function ChallanReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: challan, isLoading, error } = useChallan(id)
  const { mutate: submitReview, isPending } = useReviewChallan(id)

  const [drafts, setDrafts] = useState<Record<number, LRDraft>>({})

  function getDraft(lr: ChallanLRRecord): LRDraft {
    return drafts[lr.id] ?? { challan_lr_id: lr.id }
  }

  function updateDraft(lrId: number, update: Partial<LRDraft>) {
    setDrafts(prev => ({
      ...prev,
      [lrId]: { ...prev[lrId], challan_lr_id: lrId, ...update },
    }))
  }

  const counts = useMemo(() => {
    if (!challan) return { received: 0, shortage: 0, damaged: 0, pending: 0 }
    let received = 0, shortage = 0, damaged = 0, pending = 0
    for (const lr of challan.lrs) {
      const s = drafts[lr.id]?.status
      if      (s === 'received') received++
      else if (s === 'shortage') shortage++
      else if (s === 'damaged')  damaged++
      else                       pending++
    }
    return { received, shortage, damaged, pending }
  }, [challan, drafts])

  function handleSubmit() {
    if (!challan || counts.pending > 0) return

    const lrs = challan.lrs.map(lr => {
      const d = getDraft(lr)
      return {
        challan_lr_id:   lr.id,
        status:          d.status!,
        received_pkgs:   d.received_pkgs ? Number(d.received_pkgs) : undefined,
        received_weight: d.received_weight ? Number(d.received_weight) : undefined,
      }
    })

    submitReview({ lrs }, {
      onSuccess: () => {
        Alert.alert('Done', 'Challan received successfully.', [
          { text: 'OK', onPress: () => router.back() },
        ])
      },
      onError: () => {
        Alert.alert('Error', 'Failed to submit review. Please try again.')
      },
    })
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (error || !challan) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.background }}>
        <Text style={{ color: colors.destructive, textAlign: 'center', marginBottom: 16 }}>Failed to load challan.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary, fontWeight: typography.weight.semibold }}>Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const toLabel = challan.to_branch?.branch_name ?? challan.to_location_master?.address ?? '—'
  const allDone = counts.pending === 0

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>

        {/* Header */}
        <View style={{
          backgroundColor: colors.card,
          paddingTop: 12, paddingBottom: 12, paddingHorizontal: 16,
          borderBottomWidth: 1, borderBottomColor: colors.border,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: typography.size.xl, fontWeight: typography.weight.extrabold, color: colors.foreground }}>
                Receive Challan
              </Text>
              <Text style={{ fontSize: typography.size.sm, color: colors.mutedFg, fontFamily: 'monospace' }}>
                {challan.challan_no}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 34 }}>
            <Text style={{ fontSize: typography.size.sm, color: colors.mutedFg }}>{challan.from_branch?.branch_name ?? '—'}</Text>
            <Ionicons name="arrow-forward" size={12} color={colors.subtleFg} />
            <Text style={{ fontSize: typography.size.sm, color: colors.foreground, fontWeight: typography.weight.semibold }}>{toLabel}</Text>
          </View>
        </View>

        {/* Summary strip */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: colors.card,
          borderBottomWidth: 1, borderBottomColor: colors.border,
        }}>
          {[
            { label: 'Received', value: counts.received, color: '#065f46', bg: counts.received > 0 ? '#d1fae5' : undefined },
            { label: 'Shortage', value: counts.shortage, color: '#92400e', bg: counts.shortage > 0 ? '#fef3c7' : undefined },
            { label: 'Damaged',  value: counts.damaged,  color: '#991b1b', bg: counts.damaged  > 0 ? '#fee2e2' : undefined },
            { label: 'Pending',  value: counts.pending,  color: counts.pending > 0 ? colors.primary : colors.mutedFg, bg: undefined },
          ].map((item, i) => (
            <View key={item.label} style={{
              flex: 1, alignItems: 'center', paddingVertical: 10,
              borderLeftWidth: i > 0 ? 1 : 0, borderLeftColor: colors.border,
              backgroundColor: item.bg,
            }}>
              <Text style={{ fontSize: typography.size.lg, fontWeight: typography.weight.extrabold, color: item.color }}>
                {item.value}
              </Text>
              <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg, marginTop: 1 }}>{item.label}</Text>
            </View>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {challan.lrs.map(lr => (
            <LRReviewRow
              key={lr.id}
              lr={lr}
              draft={getDraft(lr)}
              onChange={update => updateDraft(lr.id, update)}
            />
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={{
          backgroundColor: colors.card,
          borderTopWidth: 1, borderTopColor: colors.border,
          padding: 16,
        }}>
          {!allDone && (
            <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg, textAlign: 'center', marginBottom: 10 }}>
              {counts.pending} LR{counts.pending !== 1 ? 's' : ''} still pending — mark all to submit
            </Text>
          )}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!allDone || isPending}
            style={{
              backgroundColor: (!allDone || isPending) ? colors.border : colors.primary,
              borderRadius: radius.lg, paddingVertical: 14,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            activeOpacity={0.8}
          >
            {isPending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="checkmark-done-outline" size={18} color="#fff" />
            }
            <Text style={{ color: '#fff', fontSize: typography.size.base, fontWeight: typography.weight.bold }}>
              {isPending ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import type { ChallanRecord } from '@/src/types/challan'
import { ChallanStatusBadge } from './ChallanStatusBadge'
import { useDeleteChallan } from '@hooks/useChallans'
import { colors, radius, typography } from '@/src/theme'

type Props = { challan: ChallanRecord }

export function ChallanCard({ challan }: Props) {
  const router = useRouter()
  const { mutate: deleteChallan } = useDeleteChallan()

  const totalPkgs = challan.lrs.reduce((sum, lr) =>
    sum + (lr.booking.items[0]?.pkg_count ?? 0), 0)

  const totalFreight = challan.lrs.reduce((sum, lr) =>
    sum + Number(lr.booking.grand_total || 0), 0)

  const toLabel = challan.to_branch?.branch_name
    ?? challan.to_location_master?.address
    ?? '—'

  const canEdit = challan.status === 'dispatched'

  function confirmDelete() {
    Alert.alert(
      'Delete Challan',
      `Delete ${challan.challan_no}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteChallan(challan.id) },
      ]
    )
  }

  return (
    <View style={{
      backgroundColor: colors.card, borderRadius: radius.xl,
      borderWidth: 1, borderColor: colors.border,
      marginBottom: 10, overflow: 'hidden',
    }}>
      {/* Header row */}
      <TouchableOpacity
        onPress={() => router.push(`/challan/${challan.id}`)}
        activeOpacity={0.8}
        style={{ padding: 14 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{
              fontSize: typography.size.base, fontWeight: typography.weight.extrabold,
              color: colors.foreground, letterSpacing: 0.3, fontFamily: 'monospace',
            }}>
              {challan.challan_no}
            </Text>
            <ChallanStatusBadge status={challan.status} />
          </View>
          <Text style={{
            fontSize: typography.size.sm, fontWeight: typography.weight.bold,
            color: colors.primary,
          }}>
            ₹{totalFreight.toLocaleString('en-IN')}
          </Text>
        </View>

        {/* Truck & Driver */}
        <View style={{ flexDirection: 'row', gap: 14, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="car-outline" size={13} color={colors.subtleFg} />
            <Text style={{ fontSize: typography.size.sm, color: colors.foreground, fontWeight: typography.weight.medium }}>
              {challan.truck?.truck_number ?? '—'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="person-outline" size={13} color={colors.subtleFg} />
            <Text style={{ fontSize: typography.size.sm, color: colors.mutedFg }}>
              {challan.driver_name}
            </Text>
          </View>
        </View>

        {/* Route */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Text style={{ fontSize: typography.size.sm, color: colors.mutedFg }} numberOfLines={1}>
            {challan.from_branch?.branch_name ?? '—'}
          </Text>
          <Ionicons name="arrow-forward" size={12} color={colors.subtleFg} />
          <Text style={{ fontSize: typography.size.sm, color: colors.foreground, fontWeight: typography.weight.medium }} numberOfLines={1}>
            {toLabel}
          </Text>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.muted, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Ionicons name="document-text-outline" size={11} color={colors.mutedFg} />
            <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg, fontWeight: typography.weight.medium }}>
              {challan.lrs.length} LR{challan.lrs.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.muted, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Ionicons name="cube-outline" size={11} color={colors.mutedFg} />
            <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg, fontWeight: typography.weight.medium }}>
              {totalPkgs} pkgs
            </Text>
          </View>
          {challan.departure_at && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.muted, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Ionicons name="time-outline" size={11} color={colors.mutedFg} />
              <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg, fontWeight: typography.weight.medium }}>
                {new Date(challan.departure_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Action bar */}
      {canEdit && (
        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border }}>
          <TouchableOpacity
            onPress={() => router.push(`/challan/${challan.id}`)}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons name="eye-outline" size={14} color={colors.primary} />
            <Text style={{ fontSize: typography.size.xs, color: colors.primary, fontWeight: typography.weight.semibold }}>View</Text>
          </TouchableOpacity>
          <View style={{ width: 1, backgroundColor: colors.border }} />
          <TouchableOpacity
            onPress={() => router.push(`/challan/${challan.id}/edit`)}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil-outline" size={14} color={colors.mutedFg} />
            <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg, fontWeight: typography.weight.semibold }}>Edit</Text>
          </TouchableOpacity>
          <View style={{ width: 1, backgroundColor: colors.border }} />
          <TouchableOpacity
            onPress={confirmDelete}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={14} color={colors.destructive} />
            <Text style={{ fontSize: typography.size.xs, color: colors.destructive, fontWeight: typography.weight.semibold }}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

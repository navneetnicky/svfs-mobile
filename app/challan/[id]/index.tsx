import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { useChallan, useDeleteChallan } from '@hooks/useChallans'
import { useAppSelector } from '@/src/store/hooks'
import { ChallanStatusBadge } from '@/src/components/challan/ChallanStatusBadge'
import { useRefreshControl } from '@hooks/useRefreshControl'
import { colors, radius, typography } from '@/src/theme'

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Text style={{ fontSize: typography.size.sm, color: colors.mutedFg, flex: 1 }}>{label}</Text>
      <Text style={{ fontSize: typography.size.sm, color: colors.foreground, fontWeight: typography.weight.medium, flex: 2, textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{
      backgroundColor: colors.card, borderRadius: radius.xl,
      borderWidth: 1, borderColor: colors.border,
      marginBottom: 12, overflow: 'hidden',
    }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.subtleFg, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          {title}
        </Text>
      </View>
      <View style={{ padding: 16 }}>{children}</View>
    </View>
  )
}

export default function ChallanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: challan, isLoading, isRefetching, error, refetch } = useChallan(id)
  const { mutate: deleteChallan } = useDeleteChallan()
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)
  const refreshControl = useRefreshControl(isRefetching, refetch)

  const dispatched  = challan?.status === 'dispatched'
  const canEdit     = dispatched && challan?.from_branch_id === activeBranch?.id
  const canReceive  = dispatched && challan?.to_branch_id === activeBranch?.id
  const canTransfer = dispatched && challan?.from_branch_id === activeBranch?.id

  function confirmDelete() {
    Alert.alert(
      'Delete Challan',
      `Delete ${challan?.challan_no}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: () => deleteChallan(id, { onSuccess: () => router.back() }),
        },
      ]
    )
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

  const totalPkgs    = challan.lrs.reduce((s, lr) => s + (lr.booking.items[0]?.pkg_count ?? 0), 0)
  const totalFreight = challan.lrs.reduce((s, lr) => s + Number(lr.booking.grand_total || 0), 0)
  const toLabel      = challan.to_branch?.branch_name ?? challan.to_location_master?.address ?? '—'

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header */}
      <View style={{
        backgroundColor: colors.card,
        paddingTop: 12, paddingBottom: 12, paddingHorizontal: 16,
        borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={{ fontSize: typography.size.xl, fontWeight: typography.weight.extrabold, color: colors.foreground, flex: 1 }}>
            {challan.challan_no}
          </Text>
          <ChallanStatusBadge status={challan.status} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingLeft: 34 }}>
          <Text style={{ fontSize: typography.size.sm, color: colors.mutedFg, flex: 1 }}>{challan.from_branch?.branch_name ?? '—'}</Text>
          <Ionicons name="arrow-forward" size={12} color={colors.subtleFg} style={{ marginTop: 2 }} />
          <Text style={{ fontSize: typography.size.sm, color: colors.foreground, fontWeight: typography.weight.semibold, flex: 1, textAlign: 'right' }}>{toLabel}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {/* Summary strip */}
        <View style={{
          flexDirection: 'row', backgroundColor: colors.card,
          borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border,
          marginBottom: 12, overflow: 'hidden',
        }}>
          {[
            { label: 'LRs',    value: String(challan.lrs.length) },
            { label: 'Pkgs',   value: String(totalPkgs) },
            { label: 'Freight', value: `₹${totalFreight.toLocaleString('en-IN')}` },
          ].map((item, i) => (
            <View key={item.label} style={{
              flex: 1, alignItems: 'center', paddingVertical: 12,
              borderLeftWidth: i > 0 ? 1 : 0, borderLeftColor: colors.border,
            }}>
              <Text style={{ fontSize: typography.size.lg, fontWeight: typography.weight.extrabold, color: colors.primary }}>
                {item.value}
              </Text>
              <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg, marginTop: 2 }}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Truck */}
        <Card title="Truck">
          <InfoRow label="Vehicle No."  value={challan.truck?.truck_number} />
          <InfoRow label="Type"         value={challan.truck?.truck_type} />
          <InfoRow label="Ownership"    value={challan.truck?.ownership_type === 'self' ? 'Own' : 'Market'} />
          <InfoRow label="Owner"        value={challan.truck?.owner_name} />
        </Card>

        {/* Driver */}
        <Card title="Driver">
          <InfoRow label="Name"    value={challan.driver_name} />
          <InfoRow label="Mobile"  value={challan.driver_mobile} />
          <InfoRow label="Licence" value={challan.driver_licence} />
        </Card>

        {/* Route */}
        <Card title="Route & Timing">
          <InfoRow label="From"      value={challan.from_branch?.branch_name} />
          <InfoRow label="To"        value={toLabel} />
          <InfoRow label="Departure" value={
            challan.departure_at
              ? new Date(challan.departure_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })
              : undefined
          } />
          <InfoRow label="Remarks"   value={challan.remarks} />
        </Card>

        {/* LR Manifest */}
        <Card title={`LR Manifest (${challan.lrs.length})`}>
          {challan.lrs.map((lr, i) => (
            <View key={lr.id} style={{
              paddingVertical: 10,
              borderBottomWidth: i < challan.lrs.length - 1 ? 1 : 0,
              borderBottomColor: colors.border,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.primary, fontFamily: 'monospace' }}>
                    {lr.booking.lr_number}
                  </Text>
                  <TouchableOpacity
                    onPress={() => Clipboard.setStringAsync(lr.booking.lr_number)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="copy-outline" size={13} color={colors.subtleFg} />
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.foreground }}>
                  ₹{Number(lr.booking.grand_total || 0).toLocaleString('en-IN')}
                </Text>
              </View>
              <Text style={{ fontSize: typography.size.sm, color: colors.foreground }} numberOfLines={1}>
                {lr.booking.sender_name} <Text style={{ color: colors.subtleFg }}>→</Text> {lr.booking.receiver_name}
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
                <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg }}>{lr.booking.to_city}</Text>
                <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg }}>
                  {lr.booking.items[0]?.pkg_count ?? 0} pkgs
                </Text>
                {lr.review && (
                  <View style={{
                    backgroundColor: lr.review.status === 'received' ? '#d1fae5' : '#fee2e2',
                    borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 1,
                  }}>
                    <Text style={{
                      fontSize: 9, fontWeight: typography.weight.semibold,
                      color: lr.review.status === 'received' ? '#065f46' : colors.destructive,
                      textTransform: 'capitalize',
                    }}>
                      {lr.review.status}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>

      {/* Action bar */}
      {(canEdit || canReceive || canTransfer) && (
        <View style={{
          backgroundColor: colors.card,
          borderTopWidth: 1, borderTopColor: colors.border,
          padding: 16, flexDirection: 'row', gap: 10,
        }}>
          {canEdit && (
            <>
              <TouchableOpacity
                onPress={confirmDelete}
                style={{
                  borderWidth: 1, borderColor: colors.destructive,
                  borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 12,
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={15} color={colors.destructive} />
                <Text style={{ color: colors.destructive, fontWeight: typography.weight.semibold, fontSize: typography.size.sm }}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push(`/challan/${id}/edit`)}
                style={{
                  flex: 1, borderWidth: 1, borderColor: colors.border,
                  borderRadius: radius.lg, paddingVertical: 12,
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="pencil-outline" size={15} color={colors.mutedFg} />
                <Text style={{ color: colors.mutedFg, fontWeight: typography.weight.semibold, fontSize: typography.size.sm }}>Edit</Text>
              </TouchableOpacity>
            </>
          )}
          {canReceive && (
            <TouchableOpacity
              onPress={() => router.push(`/challan/${id}/review`)}
              style={{
                flex: 1, backgroundColor: colors.primary,
                borderRadius: radius.lg, paddingVertical: 12,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done-outline" size={15} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: typography.weight.bold, fontSize: typography.size.sm }}>Receive Challan</Text>
            </TouchableOpacity>
          )}
          {canTransfer && (
            <TouchableOpacity
              onPress={() => router.push(`/challan/${id}/transfer`)}
              style={{
                flex: 1, backgroundColor: '#d97706',
                borderRadius: radius.lg, paddingVertical: 12,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="swap-horizontal-outline" size={15} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: typography.weight.bold, fontSize: typography.size.sm }}>Transfer Challan</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

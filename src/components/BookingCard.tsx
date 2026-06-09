import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { colors, shadow, radius } from '@/src/theme'
import { normalizeStatus } from '@/src/types/booking'
import type { BookingRecord } from '@/src/types/booking'

type Props = {
  item: BookingRecord
  onPress?: () => void
}

export function BookingCard({ item, onPress }: Props) {
  const typeColor  = colors.bookingType[item.booking_type] ?? { bg: '#f4f4f5', text: '#71717a' }
  const status     = normalizeStatus(item.status)
  const statusMeta = colors.status[status] ?? { label: status, bg: '#f4f4f5', text: '#71717a', accent: '#71717a' }
  const date       = new Date(item.booked_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const itemCount  = item.items?.length ?? 0

  const handlePress = onPress ?? (() => router.push(`/booking/${item.id}`))

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      style={{
        backgroundColor: colors.card,
        borderRadius: radius.xl,
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        ...shadow.DEFAULT,
      }}
    >
      {/* status accent strip */}
      <View style={{ height: 3, backgroundColor: statusMeta.accent }} />

      <View style={{ padding: 14 }}>
        {/* Row 1: LR + date | badges */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.foreground }} numberOfLines={1}>
              LR #{item.lr_number}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <Ionicons name="calendar-outline" size={11} color={colors.subtleFg} />
              <Text style={{ fontSize: 11, color: colors.subtleFg }}>{date}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 5, flexShrink: 0 }}>
            <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: typeColor.bg }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: typeColor.text }}>
                {item.booking_type.replace('_', ' ')}
              </Text>
            </View>
            <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: statusMeta.bg }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: statusMeta.text }}>{statusMeta.label}</Text>
            </View>
          </View>
        </View>

        {/* Row 2: sender → receiver */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 10, color: colors.subtleFg, marginBottom: 1 }}>SENDER</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }} numberOfLines={1}>
              {item.sender_name}
            </Text>
            {item.sender_mobile ? (
              <Text style={{ fontSize: 11, color: colors.mutedFg }} numberOfLines={1}>{item.sender_mobile}</Text>
            ) : null}
          </View>
          <Ionicons name="arrow-forward" size={14} color={colors.subtleFg} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 10, color: colors.subtleFg, marginBottom: 1 }}>RECEIVER</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }} numberOfLines={1}>
              {item.receiver_name}
            </Text>
            {item.receiver_mobile ? (
              <Text style={{ fontSize: 11, color: colors.mutedFg }} numberOfLines={1}>{item.receiver_mobile}</Text>
            ) : null}
          </View>
        </View>

        {/* Row 3: destination + amount */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.muted,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, minWidth: 0, marginRight: 8 }}>
            <Ionicons name="location-outline" size={13} color={colors.mutedFg} />
            <Text style={{ fontSize: 12, color: colors.mutedFg, fontWeight: '500', flexShrink: 1 }} numberOfLines={1}>
              {item.to_city}
            </Text>
            {itemCount > 0 && (
              <View style={{ marginLeft: 4, backgroundColor: colors.muted, borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 1 }}>
                <Text style={{ fontSize: 10, color: colors.mutedFg, fontWeight: '600' }}>{itemCount} pkg</Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 16, fontWeight: '900', color: colors.primary, flexShrink: 0 }}>
            {item.grand_total != null
              ? `₹${parseFloat(String(item.grand_total)).toLocaleString('en-IN')}`
              : '—'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

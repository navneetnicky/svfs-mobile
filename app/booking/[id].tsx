import { ScrollView, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useBooking } from '@hooks/useBookings'
import { useRefreshControl } from '@hooks/useRefreshControl'
import type { BookingStatus, BookingRecord } from '@/src/types/booking'
import { normalizeStatus } from '@/src/types/booking'
import { colors } from '@/src/theme'

type StepConfig = {
  key: BookingStatus
  label: string
  sub: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  color: string
  tsKey: keyof BookingRecord
}

const STATUS_STEPS: StepConfig[] = [
  { key: 'CREATED',            label: 'Booking Created',    sub: 'Order placed at branch',         icon: 'cube-outline',     color: colors.status.CREATED.accent,            tsKey: 'booked_at' },
  { key: 'IN_TRANSIT',         label: 'In Transit',         sub: 'Shipment dispatched via challan', icon: 'car-outline',      color: colors.status.IN_TRANSIT.accent,         tsKey: 'in_transit_at' },
  { key: 'RECEIVED_AT_BRANCH', label: 'Received at Branch', sub: 'Nearby branch received parcel',  icon: 'business-outline', color: colors.status.RECEIVED_AT_BRANCH.accent, tsKey: 'received_at_branch_at' },
  { key: 'OUT_FOR_DELIVERY',   label: 'Out for Delivery',   sub: 'Driver started delivery route',  icon: 'navigate-outline', color: colors.status.OUT_FOR_DELIVERY.accent,   tsKey: 'out_for_delivery_at' },
  { key: 'DELIVERED',          label: 'Delivered',          sub: 'Customer received the parcel',   icon: 'checkmark-circle', color: colors.status.DELIVERED.accent,          tsKey: 'delivered_at' },
]

const STATUS_ORDER = STATUS_STEPS.map(s => s.key)

function StatusTimeline({ booking }: { booking: BookingRecord }) {
  const status    = normalizeStatus(booking.status)
  const activeIdx = STATUS_ORDER.indexOf(status)

  if (status === 'CANCELLED') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: '#fee2e2', borderRadius: 10 }}>
        <Ionicons name="close-circle" size={22} color="#dc2626" />
        <View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#dc2626' }}>Booking Cancelled</Text>
          <Text style={{ fontSize: 12, color: '#b91c1c', marginTop: 1 }}>This booking has been cancelled</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={{ paddingVertical: 4 }}>
      {STATUS_STEPS.map((step, i) => {
        const done    = i <= activeIdx
        const active  = i === activeIdx
        const ts      = booking[step.tsKey] as string | null | undefined
        const fmtTs   = ts ? new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null

        return (
          <View key={step.key} style={{ flexDirection: 'row', minHeight: 56 }}>
            {/* left column: circle + line */}
            <View style={{ width: 36, alignItems: 'center' }}>
              <View style={{
                width: 32, height: 32, borderRadius: 16,
                backgroundColor: done ? step.color : '#e4e4e7',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: active ? 2 : 0,
                borderColor: active ? step.color : 'transparent',
              }}>
                <Ionicons
                  name={done ? step.icon : 'ellipse-outline'}
                  size={done ? 16 : 12}
                  color={done ? 'white' : '#a1a1aa'}
                />
              </View>
              {i < STATUS_STEPS.length - 1 && (
                <View style={{ flex: 1, width: 2, backgroundColor: i < activeIdx ? step.color : '#e4e4e7', marginTop: 2 }} />
              )}
            </View>

            {/* right column: text */}
            <View style={{ flex: 1, paddingLeft: 12, paddingBottom: 20 }}>
              <Text style={{ fontSize: 13, fontWeight: active ? '700' : '600', color: done ? '#09090b' : '#a1a1aa' }}>
                {step.label}
              </Text>
              <Text style={{ fontSize: 11, color: done ? '#71717a' : '#d4d4d8', marginTop: 1 }}>{step.sub}</Text>
              {fmtTs && (
                <Text style={{ fontSize: 10, color: step.color, marginTop: 3, fontWeight: '500' }}>{fmtTs}</Text>
              )}
            </View>
          </View>
        )
      })}
    </View>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text style={{ fontSize: 13, color: '#71717a', flex: 1 }}>{label}</Text>
      <Text style={{ fontSize: 13, color: '#09090b', fontWeight: '500', flex: 1, textAlign: 'right' }}>
        {value ?? '—'}
      </Text>
    </View>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: '#09090b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </Text>
      {children}
    </View>
  )
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: booking, isLoading, isRefetching, refetch, error } = useBooking(id)
  const refreshControl = useRefreshControl(isRefetching, refetch)

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f4f5' }}>
      <View style={{ backgroundColor: 'white', paddingTop: 12, paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f4f4f5' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={22} color="#09090b" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#09090b' }}>
            {booking ? `LR #${booking.lr_number}` : 'Booking Detail'}
          </Text>
          {booking && (
            <Text style={{ fontSize: 12, color: '#a1a1aa', marginTop: 1 }}>
              {new Date(booking.booked_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          )}
        </View>
        {booking && (() => {
          const meta = colors.status[normalizeStatus(booking.status)] ?? { label: booking.status, bg: '#f4f4f5', text: '#71717a' }
          return (
            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: meta.bg }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: meta.text }}>{meta.label}</Text>
            </View>
          )
        })()}
      </View>

      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}

      {error && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: '#dc2626', textAlign: 'center' }}>Failed to load booking details.</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: '#2563eb', fontWeight: '600' }}>Go back</Text>
          </TouchableOpacity>
        </View>
      )}

      {booking && (
        <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} refreshControl={refreshControl}>
          <Card title="Status">
            <StatusTimeline booking={booking} />
          </Card>

          <Card title="Booking Info">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: (colors.bookingType[booking.booking_type] ?? { bg: '#f4f4f5' }).bg }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: (colors.bookingType[booking.booking_type] ?? { text: '#71717a' }).text }}>
                  {booking.booking_type.replace('_', ' ')}
                </Text>
              </View>
            </View>
            <InfoRow label="To City" value={booking.to_city} />
            <InfoRow label="GST Paid By" value={booking.gst_paid_by} />
            {booking.remarks && <InfoRow label="Remarks" value={booking.remarks} />}
          </Card>

          <Card title="Sender">
            <InfoRow label="Name" value={booking.sender_name} />
            {booking.sender_mobile && <InfoRow label="Mobile" value={booking.sender_mobile} />}
            {booking.sender_address && <InfoRow label="Address" value={booking.sender_address} />}
          </Card>

          <Card title="Receiver">
            <InfoRow label="Name" value={booking.receiver_name} />
            {booking.receiver_mobile && <InfoRow label="Mobile" value={booking.receiver_mobile} />}
            {booking.receiver_address && <InfoRow label="Address" value={booking.receiver_address} />}
          </Card>

          <Card title="Items">
            {booking.items.map((item, i) => (
              <View key={i} style={{ borderBottomWidth: i < booking.items.length - 1 ? 1 : 0, borderBottomColor: '#f4f4f5', paddingBottom: 10, marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#09090b', flex: 1 }}>{item.description ?? '—'}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#09090b' }}>₹{(item.total ?? 0).toLocaleString('en-IN')}</Text>
                </View>
                <Text style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
                  {item.unit} · {item.pkg_count ?? 0} pcs · {item.actual_weight ?? 0} kg · ₹{item.rate ?? 0}/kg
                </Text>
              </View>
            ))}
          </Card>

          <Card title="Charges">
            <InfoRow label="Freight" value={`₹${Number(booking.freight).toLocaleString('en-IN')}`} />
            {Number(booking.labour_charge) > 0 && <InfoRow label="Labour" value={`₹${Number(booking.labour_charge).toLocaleString('en-IN')}`} />}
            {Number(booking.delivery_charge) > 0 && <InfoRow label="Door Delivery" value={`₹${Number(booking.delivery_charge).toLocaleString('en-IN')}`} />}
            {Number(booking.agent_charge) > 0 && <InfoRow label="Agent" value={`₹${Number(booking.agent_charge).toLocaleString('en-IN')}`} />}
            {Number(booking.taxi_charge) > 0 && <InfoRow label="Taxi" value={`₹${Number(booking.taxi_charge).toLocaleString('en-IN')}`} />}
            {Number(booking.bilty_charge) > 0 && <InfoRow label="Bilty" value={`₹${Number(booking.bilty_charge).toLocaleString('en-IN')}`} />}
            {Number(booking.cod) > 0 && <InfoRow label="COD" value={`₹${Number(booking.cod).toLocaleString('en-IN')}`} />}
            <View style={{ height: 1, backgroundColor: '#e4e4e7', marginVertical: 8 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#09090b' }}>Grand Total</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#2563eb' }}>₹{Number(booking.grand_total).toLocaleString('en-IN')}</Text>
            </View>
          </Card>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  )
}

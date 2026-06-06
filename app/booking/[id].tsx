import { ScrollView, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useBooking } from '@hooks/useBookings'
import type { BookingStatus, BookingType } from '@/src/types/booking'

const TYPE_COLORS: Record<BookingType, { bg: string; text: string }> = {
  PAID:   { bg: '#dcfce7', text: '#16a34a' },
  TO_PAY: { bg: '#fef9c3', text: '#ca8a04' },
  TBB:    { bg: '#dbeafe', text: '#2563eb' },
  FOC:    { bg: '#f3e8ff', text: '#9333ea' },
}

const STATUS_COLORS: Record<BookingStatus, { bg: string; text: string }> = {
  booked:     { bg: '#dbeafe', text: '#2563eb' },
  in_transit: { bg: '#fef9c3', text: '#ca8a04' },
  delivered:  { bg: '#dcfce7', text: '#16a34a' },
  cancelled:  { bg: '#fee2e2', text: '#dc2626' },
}

const STATUS_STEPS: BookingStatus[] = ['booked', 'in_transit', 'delivered']

function StatusTimeline({ status }: { status: BookingStatus }) {
  const activeIdx = STATUS_STEPS.indexOf(status)
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }}>
      {STATUS_STEPS.map((s, i) => {
        const done = i <= activeIdx && status !== 'cancelled'
        return (
          <View key={s} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              {i > 0 && (
                <View style={{ flex: 1, height: 2, backgroundColor: done ? '#2563eb' : '#e4e4e7' }} />
              )}
              <View style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: done ? '#2563eb' : '#e4e4e7',
                alignItems: 'center', justifyContent: 'center',
              }}>
                {done
                  ? <Ionicons name="checkmark" size={14} color="white" />
                  : <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#a1a1aa' }} />
                }
              </View>
              {i < STATUS_STEPS.length - 1 && (
                <View style={{ flex: 1, height: 2, backgroundColor: i < activeIdx && status !== 'cancelled' ? '#2563eb' : '#e4e4e7' }} />
              )}
            </View>
            <Text style={{ fontSize: 10, color: done ? '#2563eb' : '#a1a1aa', marginTop: 6, textAlign: 'center' }}>
              {s.replace('_', ' ')}
            </Text>
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
  const { data: booking, isLoading, error } = useBooking(id)

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f4f5' }}>
      <View style={{ backgroundColor: 'white', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f4f4f5' }}>
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
        {booking && (
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: (STATUS_COLORS[booking.status] ?? { bg: '#f4f4f5' }).bg }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: (STATUS_COLORS[booking.status] ?? { text: '#71717a' }).text }}>
              {booking.status.replace('_', ' ')}
            </Text>
          </View>
        )}
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
        <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
          <Card title="Status">
            {booking.status !== 'cancelled'
              ? <StatusTimeline status={booking.status} />
              : (
                <View style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#fee2e2', borderRadius: 8 }}>
                  <Text style={{ color: '#dc2626', fontWeight: '600' }}>This booking has been cancelled.</Text>
                </View>
              )
            }
          </Card>

          <Card title="Booking Info">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: (TYPE_COLORS[booking.booking_type] ?? { bg: '#f4f4f5' }).bg }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: (TYPE_COLORS[booking.booking_type] ?? { text: '#71717a' }).text }}>
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

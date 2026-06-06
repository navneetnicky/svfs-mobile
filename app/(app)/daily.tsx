import { useState } from 'react'
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { TopTabBar } from '@/src/components/TopTabBar'
import { WipPlaceholder } from '@/src/components/WipPlaceholder'
import { useBookingList } from '@hooks/useBookings'
import type { BookingRecord, BookingType, BookingStatus } from '@/src/types/booking'

const TABS = ['Booking', 'Challan Register', 'Route Bulk Delivery', 'Delivery'] as const
type Tab = typeof TABS[number]

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

function BookingCard({ item }: { item: BookingRecord }) {
  const typeColor = TYPE_COLORS[item.booking_type] ?? { bg: '#f4f4f5', text: '#71717a' }
  const statusColor = STATUS_COLORS[item.status] ?? { bg: '#f4f4f5', text: '#71717a' }
  const date = new Date(item.booked_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <TouchableOpacity
      onPress={() => router.push(`/booking/${item.id}`)}
      activeOpacity={0.7}
      style={{
        backgroundColor: 'white', borderRadius: 12, padding: 14, marginBottom: 10,
        borderWidth: 1, borderColor: '#f4f4f5',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#09090b' }}>LR #{item.lr_number}</Text>
          <Text style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>{date}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: typeColor.bg }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: typeColor.text }}>{item.booking_type.replace('_', ' ')}</Text>
          </View>
          <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: statusColor.bg }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: statusColor.text }}>{item.status.replace('_', ' ')}</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: '#f4f4f5', marginVertical: 10 }} />

      <View style={{ flexDirection: 'row', gap: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: '#a1a1aa', marginBottom: 1 }}>From</Text>
          <Text style={{ fontSize: 13, color: '#09090b', fontWeight: '500' }} numberOfLines={1}>{item.sender_name}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: '#a1a1aa', marginBottom: 1 }}>To</Text>
          <Text style={{ fontSize: 13, color: '#09090b', fontWeight: '500' }} numberOfLines={1}>{item.receiver_name}</Text>
        </View>
        <View>
          <Text style={{ fontSize: 11, color: '#a1a1aa', marginBottom: 1, textAlign: 'right' }}>Destination</Text>
          <Text style={{ fontSize: 13, color: '#09090b', fontWeight: '500' }}>{item.to_city}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: '#2563eb' }}>
          ₹{Number(item.grand_total).toLocaleString('en-IN')}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

function BookingList() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading, error, refetch } = useBookingList({ page, search: search || undefined })

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: '#e4e4e7', paddingHorizontal: 12, gap: 8 }}>
          <Ionicons name="search-outline" size={16} color="#a1a1aa" />
          <TextInput
            value={search}
            onChangeText={v => { setSearch(v); setPage(1) }}
            placeholder="Search LR, sender, receiver..."
            placeholderTextColor="#a1a1aa"
            style={{ flex: 1, paddingVertical: 10, fontSize: 14, color: '#09090b' }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setPage(1) }}>
              <Ionicons name="close-circle" size={16} color="#a1a1aa" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}

      {error && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Ionicons name="alert-circle-outline" size={40} color="#dc2626" />
          <Text style={{ color: '#dc2626', marginTop: 8, textAlign: 'center' }}>Failed to load bookings.</Text>
          <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 12, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#2563eb', borderRadius: 20 }}>
            <Text style={{ color: 'white', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !error && (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <BookingCard item={item} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
              <Ionicons name="document-text-outline" size={48} color="#d4d4d8" />
              <Text style={{ color: '#a1a1aa', fontSize: 15, marginTop: 12, fontWeight: '500' }}>No bookings found</Text>
              <Text style={{ color: '#d4d4d8', fontSize: 13, marginTop: 4 }}>Tap + to create a new booking</Text>
            </View>
          }
          ListFooterComponent={
            data && data.total > (page * (data.limit ?? 20)) ? (
              <TouchableOpacity
                onPress={() => setPage(p => p + 1)}
                style={{ alignItems: 'center', paddingVertical: 14 }}
              >
                <Text style={{ color: '#2563eb', fontWeight: '600' }}>Load more</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}

      <TouchableOpacity
        onPress={() => router.push('/booking/create')}
        style={{
          position: 'absolute', bottom: 24, right: 20,
          width: 52, height: 52, borderRadius: 26,
          backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center',
          shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
        }}
      >
        <Ionicons name="add" size={26} color="white" />
      </TouchableOpacity>
    </View>
  )
}

export default function DailyScreen() {
  const [active, setActive] = useState<Tab>('Booking')

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f4f5' }}>
      <View style={{ backgroundColor: 'white', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f4f4f5' }}>
        <View>
          <Text style={{ fontSize: 12, fontWeight: '500', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 1.2 }}>Section</Text>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#09090b', marginTop: 2 }}>Daily Working</Text>
        </View>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="calendar-outline" size={20} color="#2563eb" />
        </View>
      </View>
      <TopTabBar tabs={[...TABS]} active={active} onSelect={t => setActive(t as Tab)} />
      {active === 'Booking' ? <BookingList /> : <WipPlaceholder label={active} />}
    </View>
  )
}

import { useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, FlatList, ActivityIndicator,
  TextInput, Platform, Modal, Pressable,
  ScrollView, useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent,
} from 'react-native'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { TopTabBar } from '@/src/components/TopTabBar'
import { WipPlaceholder } from '@/src/components/WipPlaceholder'
import { BookingCard } from '@/src/components/BookingCard'
import { ChallanCard } from '@/src/components/challan/ChallanCard'
import { useBookingList } from '@hooks/useBookings'
import { useChallanList } from '@hooks/useChallans'
import { useAppSelector } from '@/src/store/hooks'
import { useRefreshControl } from '@hooks/useRefreshControl'
import { colors, radius, typography } from '@/src/theme'

const TABS = ['Booking', 'Challan Register', 'Route Bulk Delivery', 'Delivery'] as const
type Tab = typeof TABS[number]

// ─── Date helpers ─────────────────────────────────────────────────────────────

function toISO(d: Date)  { return d.toISOString().split('T')[0] }
function fmtDate(d: Date) {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}


// ─── BookingList ──────────────────────────────────────────────────────────────

function BookingList() {
  const today = new Date()
  const [search,    setSearch]    = useState('')
  const [startDate, setStartDate] = useState<Date>(today)
  const [endDate,   setEndDate]   = useState<Date>(today)
  const [picker,    setPicker]    = useState<'start' | 'end' | null>(null)
  const [page,      setPage]      = useState(1)

  const { data, isLoading, isRefetching, error, refetch } = useBookingList({
    page,
    search:     search || undefined,
    start_date: toISO(startDate),
    end_date:   toISO(endDate),
  })

  const handleDateChange = (_: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setPicker(null)
    if (!date) return
    if (picker === 'start') {
      setStartDate(date)
      if (date > endDate) setEndDate(date)
    } else {
      setEndDate(date)
      if (date < startDate) setStartDate(date)
    }
    setPage(1)
  }

  const closePicker = () => setPicker(null)

  return (
    <View style={{ flex: 1 }}>

      {/* Search bar */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: colors.card, borderRadius: radius.lg,
          borderWidth: 1, borderColor: colors.border,
          paddingHorizontal: 12, gap: 8,
        }}>
          <Ionicons name="search-outline" size={16} color={colors.subtleFg} />
          <TextInput
            value={search}
            onChangeText={v => { setSearch(v); setPage(1) }}
            placeholder="Search LR, sender, receiver..."
            placeholderTextColor={colors.subtleFg}
            style={{ flex: 1, paddingVertical: 10, fontSize: 14, color: colors.foreground }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setPage(1) }}>
              <Ionicons name="close-circle" size={16} color={colors.subtleFg} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Date range row */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 16, paddingBottom: 10,
      }}>
        <TouchableOpacity
          onPress={() => setPicker('start')}
          style={{
            flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: colors.card, borderRadius: radius.lg,
            borderWidth: 1, borderColor: picker === 'start' ? colors.primary : colors.border,
            paddingHorizontal: 12, paddingVertical: 9,
          }}
        >
          <Ionicons name="calendar-outline" size={14} color={picker === 'start' ? colors.primary : colors.subtleFg} />
          <Text style={{ fontSize: 12, color: colors.foreground, fontWeight: '500' }}>{fmtDate(startDate)}</Text>
        </TouchableOpacity>

        <Ionicons name="arrow-forward" size={14} color={colors.subtleFg} />

        <TouchableOpacity
          onPress={() => setPicker('end')}
          style={{
            flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: colors.card, borderRadius: radius.lg,
            borderWidth: 1, borderColor: picker === 'end' ? colors.primary : colors.border,
            paddingHorizontal: 12, paddingVertical: 9,
          }}
        >
          <Ionicons name="calendar-outline" size={14} color={picker === 'end' ? colors.primary : colors.subtleFg} />
          <Text style={{ fontSize: 12, color: colors.foreground, fontWeight: '500' }}>{fmtDate(endDate)}</Text>
        </TouchableOpacity>
      </View>

      {/* Android: picker renders inline as dialog */}
      {Platform.OS === 'android' && picker && (
        <DateTimePicker
          value={picker === 'start' ? startDate : endDate}
          mode="date"
          display="default"
          maximumDate={picker === 'end' ? new Date() : undefined}
          minimumDate={picker === 'end' ? startDate : undefined}
          onChange={handleDateChange}
        />
      )}

      {/* iOS: wrap in modal with Done button */}
      {Platform.OS === 'ios' && (
        <Modal visible={!!picker} transparent animationType="slide" onRequestClose={closePicker}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={closePicker} />
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32 }}>
            <View style={{
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              paddingHorizontal: 20, paddingVertical: 14,
              borderBottomWidth: 1, borderBottomColor: colors.border,
            }}>
              <Text style={{ fontSize: typography.size.base, fontWeight: typography.weight.semibold, color: colors.foreground }}>
                {picker === 'start' ? 'From Date' : 'To Date'}
              </Text>
              <TouchableOpacity onPress={closePicker}>
                <Text style={{ fontSize: typography.size.base, fontWeight: typography.weight.bold, color: colors.primary }}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={picker === 'start' ? startDate : endDate}
              mode="date"
              display="spinner"
              maximumDate={picker === 'end' ? new Date() : undefined}
              minimumDate={picker === 'end' ? startDate : undefined}
              onChange={handleDateChange}
              style={{ height: 200 }}
            />
          </View>
        </Modal>
      )}

      {/* Loading */}
      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.destructive} />
          <Text style={{ color: colors.destructive, marginTop: 8, textAlign: 'center' }}>Failed to load bookings.</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{ marginTop: 12, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: colors.primary, borderRadius: radius.full }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      {!isLoading && !error && (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <BookingCard item={item} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={useRefreshControl(isRefetching, refetch)}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
              <Ionicons name="document-text-outline" size={48} color={colors.border} />
              <Text style={{ color: colors.subtleFg, fontSize: 15, marginTop: 12, fontWeight: '500' }}>No bookings found</Text>
              <Text style={{ color: colors.subtleFg, fontSize: 13, marginTop: 4, opacity: 0.6 }}>
                {search ? 'Try a different search term' : 'No bookings for this date range'}
              </Text>
            </View>
          }
          ListFooterComponent={
            data && data.total > page * (data.limit ?? 20) ? (
              <TouchableOpacity onPress={() => setPage(p => p + 1)} style={{ alignItems: 'center', paddingVertical: 14 }}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Load more</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/booking/create')}
        style={{
          position: 'absolute', bottom: 24, right: 20,
          width: 52, height: 52, borderRadius: 26,
          backgroundColor: colors.primary,
          alignItems: 'center', justifyContent: 'center',
          shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
        }}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  )
}

// ─── ChallanList ──────────────────────────────────────────────────────────────

const CHALLAN_SUBTABS = ['Our Challan', 'We Received'] as const

function ChallanPage({ isOurs, width }: { isOurs: boolean; width: number }) {
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)
  const [search, setSearch] = useState('')

  const { data, isLoading, isRefetching, error, refetch } = useChallanList(
    isOurs
      ? { branch_id: activeBranch?.id, search: search || undefined }
      : { to_branch_id: activeBranch?.id, search: search || undefined }
  )

  return (
    <View style={{ width, flex: 1 }}>
      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: colors.card, borderRadius: radius.lg,
          borderWidth: 1, borderColor: colors.border,
          paddingHorizontal: 12, gap: 8,
        }}>
          <Ionicons name="search-outline" size={16} color={colors.subtleFg} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search challan no, truck..."
            placeholderTextColor={colors.subtleFg}
            style={{ flex: 1, paddingVertical: 10, fontSize: 14, color: colors.foreground }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={colors.subtleFg} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {error && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.destructive} />
          <Text style={{ color: colors.destructive, marginTop: 8, textAlign: 'center' }}>Failed to load challans.</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{ marginTop: 12, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: colors.primary, borderRadius: radius.full }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !error && (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ChallanCard challan={item} activeBranchId={activeBranch?.id} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          refreshControl={useRefreshControl(isRefetching, refetch)}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
              <Ionicons name="document-text-outline" size={48} color={colors.border} />
              <Text style={{ color: colors.subtleFg, fontSize: 15, marginTop: 12, fontWeight: '500' }}>No challans found</Text>
              <Text style={{ color: colors.subtleFg, fontSize: 13, marginTop: 4, opacity: 0.6 }}>
                {search ? 'Try a different search term' : isOurs ? 'No challans dispatched from this branch' : 'No challans received at this branch'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  )
}

function ChallanList() {
  const { width } = useWindowDimensions()
  const pagerRef = useRef<ScrollView>(null)
  const [tabIndex, setTabIndex] = useState(0)

  function goToTab(i: number) {
    setTabIndex(i)
    pagerRef.current?.scrollTo({ x: i * width, animated: true })
  }

  function onScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(e.nativeEvent.contentOffset.x / width)
    setTabIndex(i)
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Sub-tabs */}
      <View style={{
        flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border,
        backgroundColor: colors.card,
      }}>
        {CHALLAN_SUBTABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            onPress={() => goToTab(i)}
            style={{
              flex: 1, paddingVertical: 10, alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: tabIndex === i ? colors.primary : 'transparent',
            }}
          >
            <Text style={{
              fontSize: typography.size.sm,
              fontWeight: tabIndex === i ? typography.weight.bold : typography.weight.normal,
              color: tabIndex === i ? colors.primary : colors.mutedFg,
            }}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Swipeable pages */}
      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onScrollEnd}
        style={{ flex: 1 }}
      >
        <ChallanPage isOurs={true}  width={width} />
        <ChallanPage isOurs={false} width={width} />
      </ScrollView>

      {/* FAB — only on Our Challan tab */}
      {tabIndex === 0 && (
        <TouchableOpacity
          onPress={() => router.push('/challan/create')}
          style={{
            position: 'absolute', bottom: 24, right: 20,
            width: 52, height: 52, borderRadius: 26,
            backgroundColor: colors.primary,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
          }}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DailyScreen() {
  const [active, setActive] = useState<Tab>('Booking')

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        backgroundColor: colors.card, paddingTop: 16, paddingBottom: 12, paddingHorizontal: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <View>
          <Text style={{ fontSize: 12, fontWeight: '500', color: colors.subtleFg, textTransform: 'uppercase', letterSpacing: 1.2 }}>Section</Text>
          <Text style={{ fontSize: 20, fontWeight: '900', color: colors.foreground, marginTop: 2 }}>Daily Working</Text>
        </View>
        <View style={{ width: 36, height: 36, borderRadius: radius.lg, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        </View>
      </View>
      <TopTabBar tabs={[...TABS]} active={active} onSelect={t => setActive(t as Tab)} />
      {active === 'Booking'           ? <BookingList />  :
       active === 'Challan Register'  ? <ChallanList />  :
       <WipPlaceholder label={active} />}
    </View>
  )
}

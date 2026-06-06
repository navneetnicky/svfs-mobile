import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, Pressable,
} from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useColorScheme } from 'nativewind'
import { useRouter } from 'expo-router'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { logout } from '@/src/store/authSlice'
import { setTheme } from '@/src/store/themeSlice'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function greet() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function today() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

// ─── Menu modal ───────────────────────────────────────────────────────────────

function MenuModal({ visible, onClose, isDark, onToggleTheme, onLogout, userName, userEmail, initials }: {
  visible: boolean; onClose: () => void; isDark: boolean
  onToggleTheme: () => void; onLogout: () => void
  userName: string; userEmail: string; initials: string
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1 }} onPress={onClose}>
        <View style={{
          position: 'absolute', top: 80, right: 16, width: 260,
          borderRadius: 20, overflow: 'hidden',
          backgroundColor: isDark ? '#18181b' : '#ffffff',
          borderWidth: 1, borderColor: isDark ? '#27272a' : '#f4f4f5',
          shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#27272a' : '#f4f4f5' }}>
            <View style={{ height: 42, width: 42, borderRadius: 21, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: 'white' }}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#fff' : '#09090b' }} numberOfLines={1}>{userName}</Text>
              <Text style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }} numberOfLines={1}>{userEmail}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => { onToggleTheme(); onClose() }} activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#27272a' : '#f4f4f5' }}>
            <View style={{ height: 36, width: 36, borderRadius: 12, backgroundColor: isDark ? '#451a03' : '#fef3c7', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={isDark ? '#f59e0b' : '#6366f1'} />
            </View>
            <Text style={{ fontSize: 14, fontWeight: '500', color: isDark ? '#e4e4e7' : '#3f3f46' }}>
              {isDark ? 'Switch to Light' : 'Switch to Dark'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { onLogout(); onClose() }} activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
            <View style={{ height: 36, width: 36, borderRadius: 12, backgroundColor: isDark ? '#450a0a' : '#fef2f2', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            </View>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#ef4444' }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  )
}

// ─── Metric card ──────────────────────────────────────────────────────────────

type MetricCardProps = {
  label: string
  value: number | string
  iconName: string
  iconLib?: 'ion' | 'mci'
  iconBg: string
  iconColor: string
  valueColor: string
  loading?: boolean
}

function MetricCard({ label, value, iconName, iconLib = 'ion', iconBg, iconColor, valueColor, loading }: MetricCardProps) {
  const Icon = iconLib === 'mci' ? MaterialCommunityIcons : Ionicons
  return (
    <View className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl p-4 gap-y-3 border border-zinc-100 dark:border-zinc-800">
      <View className={`h-10 w-10 rounded-xl items-center justify-center ${iconBg}`}>
        <Icon name={iconName as any} size={20} color={iconColor} />
      </View>
      {loading
        ? <View className="h-7 w-14 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
        : <Text className={`text-2xl font-black tabular-nums ${valueColor}`}>{value}</Text>
      }
      <Text className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-tight">{label}</Text>
    </View>
  )
}

// ─── Home ─────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [menuOpen, setMenuOpen] = useState(false)

  const router   = useRouter()
  const dispatch = useAppDispatch()
  const authUser = useAppSelector(s => s.auth.user)
  const { colorScheme, setColorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'

  const firstName = authUser?.first_name ?? 'there'
  const userName  = authUser ? `${authUser.first_name ?? ''} ${authUser.last_name ?? ''}`.trim() : 'User'
  const userEmail = authUser?.email ?? ''
  const initials  = userName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase() || 'U'

  const handleToggleTheme = () => {
    const next = isDark ? 'light' : 'dark'
    setColorScheme(next)
    dispatch(setTheme(next))
  }

  const handleLogout = () => {
    dispatch(logout())
    router.replace('/(auth)/login')
  }

  // Static placeholder — wire API here later
  const loading = false
  const stats = { monthRevenue: 0, todayBookings: 0, inTransit: 0, challansReceived: 0, totalLRs: 0 }
  const recentBookings: {
    id: string; lr_number: string; sender_name: string
    receiver_name: string; to_city: string; grand_total: number; booked_at: string
  }[] = []

  const month = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <>
      <ScrollView
        className="flex-1 bg-zinc-100 dark:bg-zinc-950"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ── */}
        <View
          className="bg-blue-600 px-4 pt-14 pb-20"
          style={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
        >
          {/* Top bar */}
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center gap-x-2">
              <View className="h-8 w-8 rounded-xl bg-white/20 items-center justify-center">
                <MaterialCommunityIcons name="truck-delivery-outline" size={18} color="white" />
              </View>
              <Text className="text-base font-black text-white tracking-wide">SVFS</Text>
            </View>
            <View className="flex-row items-center gap-x-2">
              <TouchableOpacity className="h-9 w-9 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="notifications-outline" size={19} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMenuOpen(true)}
                className="h-9 w-9 rounded-full bg-white items-center justify-center"
                activeOpacity={0.8}
              >
                <Text className="text-xs font-black text-blue-600">{initials}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Greeting */}
          <Text className="text-blue-200 text-sm font-medium">{greet()}</Text>
          <Text className="text-white text-2xl font-black mt-0.5">{firstName} 👋</Text>
          <Text className="text-blue-300 text-xs mt-1">{today()}</Text>
        </View>

        {/* ── Revenue card (overlaps header) ── */}
        <View
          className="mx-4 bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800"
          style={{ marginTop: -52, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 }}
        >
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-xs font-medium text-zinc-400 dark:text-zinc-500">{month} Revenue</Text>
              {loading
                ? <View className="h-9 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-700 mt-1" />
                : <Text className="text-3xl font-black text-zinc-900 dark:text-white tabular-nums mt-1">
                    ₹ {stats.monthRevenue.toLocaleString('en-IN')}
                  </Text>
              }
            </View>
            <View className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950 items-center justify-center">
              <Ionicons name="wallet-outline" size={20} color="#2563eb" />
            </View>
          </View>

        </View>

        {/* ── Metric cards 2×2 ── */}
        <View className="mx-4 mt-4 gap-y-3">
          <Text className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Key Metrics</Text>
          <View className="flex-row gap-x-3">
            <MetricCard
              label="Today's Bookings" value={stats.todayBookings}
              iconName="cube-outline" iconBg="bg-blue-50 dark:bg-blue-950"
              iconColor="#2563eb" valueColor="text-blue-600 dark:text-blue-400" loading={loading}
            />
            <MetricCard
              label="In Transit" value={stats.inTransit}
              iconName="truck-outline" iconLib="mci" iconBg="bg-violet-50 dark:bg-violet-950"
              iconColor="#7c3aed" valueColor="text-violet-600 dark:text-violet-400" loading={loading}
            />
          </View>
          <View className="flex-row gap-x-3">
            <MetricCard
              label="Challans Received" value={stats.challansReceived}
              iconName="checkmark-circle-outline" iconBg="bg-emerald-50 dark:bg-emerald-950"
              iconColor="#059669" valueColor="text-emerald-600 dark:text-emerald-400" loading={loading}
            />
            <MetricCard
              label="Total LRs" value={stats.totalLRs}
              iconName="document-text-outline" iconBg="bg-amber-50 dark:bg-amber-950"
              iconColor="#d97706" valueColor="text-amber-600 dark:text-amber-400" loading={loading}
            />
          </View>
        </View>

        {/* ── Recent Bookings ── */}
        <View className="mx-4 mt-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
            <View>
              <Text className="text-sm font-bold text-zinc-900 dark:text-white">Recent Bookings</Text>
              <Text className="text-xs text-zinc-400 mt-0.5">Latest LR entries</Text>
            </View>
            <TouchableOpacity className="bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-full">
              <Text className="text-xs font-semibold text-blue-600">View all</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator color="#2563eb" size="large" />
            </View>
          ) : recentBookings.length === 0 ? (
            <View className="items-center justify-center py-12 gap-y-3">
              <View className="h-16 w-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 items-center justify-center">
                <MaterialCommunityIcons name="file-document-outline" size={30} color="#a1a1aa" />
              </View>
              <View className="items-center gap-y-1">
                <Text className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">No bookings yet</Text>
                <Text className="text-xs text-zinc-400 dark:text-zinc-500">Create your first LR to get started</Text>
              </View>
            </View>
          ) : (
            recentBookings.map((b, i) => (
              <TouchableOpacity
                key={b.id}
                activeOpacity={0.7}
                className={`flex-row items-center px-4 py-3 gap-x-3 ${i < recentBookings.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''}`}
              >
                <View className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950 items-center justify-center">
                  <MaterialCommunityIcons name="file-document-outline" size={18} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-x-2">
                    <View className="bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                      <Text className="text-[10px] font-black text-blue-600 font-mono">{b.lr_number}</Text>
                    </View>
                    <Text className="text-xs text-zinc-400">{b.to_city}</Text>
                  </View>
                  <Text className="text-sm font-medium text-zinc-900 dark:text-white mt-1" numberOfLines={1}>
                    {b.sender_name} → {b.receiver_name}
                  </Text>
                  <Text className="text-xs text-zinc-400 mt-0.5">
                    {new Date(b.booked_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </Text>
                </View>
                <View className="items-end gap-y-1">
                  <Text className="text-sm font-black text-emerald-600 tabular-nums">
                    ₹{b.grand_total.toLocaleString('en-IN')}
                  </Text>
                  <View className="bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    <Text className="text-[10px] font-semibold text-emerald-600">Booked</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>

      <MenuModal
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
        userName={userName}
        userEmail={userEmail}
        initials={initials}
      />
    </>
  )
}

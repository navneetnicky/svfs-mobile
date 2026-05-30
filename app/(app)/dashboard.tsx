import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, Pressable,
} from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useColorScheme } from 'nativewind'
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
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Tile = {
  label: string
  path: string
  iconName: string
  iconLib?: 'ion' | 'mci'
  iconBg: string
  iconColor: string
}

type Section = { title: string; tiles: Tile[] }

// ─── Nav data ─────────────────────────────────────────────────────────────────

const sections: Section[] = [
  {
    title: 'Daily Working',
    tiles: [
      { label: 'Booking',             path: '/(app)/daily/booking',       iconName: 'cube-outline',            iconLib: 'ion', iconBg: 'bg-blue-100 dark:bg-blue-950',       iconColor: '#2563eb' },
      { label: 'Challan Register',    path: '/(app)/daily/challan',       iconName: 'file-document-outline',   iconLib: 'mci', iconBg: 'bg-violet-100 dark:bg-violet-950',   iconColor: '#7c3aed' },
      { label: 'Route Bulk Delivery', path: '/(app)/daily/bulk-delivery', iconName: 'cube-send',               iconLib: 'mci', iconBg: 'bg-cyan-100 dark:bg-cyan-950',       iconColor: '#0891b2' },
      { label: 'Delivery',            path: '/(app)/daily/delivery',      iconName: 'package-variant-closed',  iconLib: 'mci', iconBg: 'bg-emerald-100 dark:bg-emerald-950', iconColor: '#059669' },
    ],
  },
  {
    title: 'Fleet Management',
    tiles: [
      { label: 'Diesel Entry',  path: '/(app)/fleet/diesel',   iconName: 'gas-station-outline', iconLib: 'mci', iconBg: 'bg-amber-100 dark:bg-amber-950',  iconColor: '#d97706' },
      { label: 'Toll Entry',    path: '/(app)/fleet/toll',     iconName: 'road-variant',        iconLib: 'mci', iconBg: 'bg-orange-100 dark:bg-orange-950', iconColor: '#ea580c' },
      { label: 'Truck Expense', path: '/(app)/fleet/expenses', iconName: 'wrench-outline',      iconLib: 'ion', iconBg: 'bg-red-100 dark:bg-red-950',       iconColor: '#dc2626' },
    ],
  },
  {
    title: 'Operations',
    tiles: [
      { label: 'Invoice Register', path: '/(app)/operations/invoices',   iconName: 'receipt-outline',      iconLib: 'ion', iconBg: 'bg-pink-100 dark:bg-pink-950',     iconColor: '#db2777' },
      { label: 'Quotation',        path: '/(app)/operations/quotations', iconName: 'document-text-outline', iconLib: 'ion', iconBg: 'bg-indigo-100 dark:bg-indigo-950', iconColor: '#4f46e5' },
      { label: 'City Wise',        path: '/(app)/operations/city-wise',  iconName: 'map-outline',           iconLib: 'ion', iconBg: 'bg-teal-100 dark:bg-teal-950',     iconColor: '#0d9488' },
      { label: 'Letter Head',      path: '/(app)/operations/letterhead', iconName: 'newspaper-outline',     iconLib: 'ion', iconBg: 'bg-slate-100 dark:bg-slate-800',   iconColor: '#475569' },
      { label: 'Income Book',      path: '/(app)/operations/income',     iconName: 'trending-up-outline',   iconLib: 'ion', iconBg: 'bg-green-100 dark:bg-green-950',   iconColor: '#16a34a' },
      { label: 'Expense Book',     path: '/(app)/operations/expenses',   iconName: 'trending-down-outline', iconLib: 'ion', iconBg: 'bg-rose-100 dark:bg-rose-950',     iconColor: '#e11d48' },
    ],
  },
]

// ─── Tile component ───────────────────────────────────────────────────────────

function NavTile({ tile, onPress }: { tile: Tile; onPress: () => void }) {
  const Icon = tile.iconLib === 'mci' ? MaterialCommunityIcons : Ionicons
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="flex-1 items-center gap-y-2 py-3 px-1"
    >
      <View className={`h-14 w-14 rounded-2xl items-center justify-center ${tile.iconBg}`}>
        <Icon name={tile.iconName as any} size={26} color={tile.iconColor} />
      </View>
      <Text className="text-xs font-medium text-zinc-700 dark:text-zinc-300 text-center leading-tight">
        {tile.label}
      </Text>
    </TouchableOpacity>
  )
}

// ─── Section block ────────────────────────────────────────────────────────────

function SectionBlock({ section, onNavigate }: { section: Section; onNavigate: (path: string) => void }) {
  const rows: Tile[][] = []
  for (let i = 0; i < section.tiles.length; i += 3) {
    rows.push(section.tiles.slice(i, i + 3))
  }

  return (
    <View className="mx-4 mt-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-2 pt-3 pb-1">
      <Text className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-2 mb-1">
        {section.title}
      </Text>
      {rows.map((row, ri) => (
        <View key={ri} className="flex-row">
          {row.map(tile => (
            <NavTile key={tile.path} tile={tile} onPress={() => onNavigate(tile.path)} />
          ))}
          {/* fill empty slots so last row aligns left */}
          {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, i) => (
            <View key={`empty-${i}`} className="flex-1" />
          ))}
        </View>
      ))}
    </View>
  )
}

// ─── Menu modal ───────────────────────────────────────────────────────────────

function MenuModal({ visible, onClose, isDark, onToggleTheme, onLogout, userName, userEmail, initials }: {
  visible: boolean
  onClose: () => void
  isDark: boolean
  onToggleTheme: () => void
  onLogout: () => void
  userName: string
  userEmail: string
  initials: string
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1" onPress={onClose}>
        <View className="absolute top-20 right-4 w-64 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-lg overflow-hidden">

          {/* User info */}
          <View className="flex-row items-center gap-x-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <View className="h-10 w-10 rounded-full bg-blue-600 items-center justify-center">
              <Text className="text-sm font-black text-white">{initials}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-zinc-900 dark:text-white" numberOfLines={1}>{userName}</Text>
              <Text className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5" numberOfLines={1}>{userEmail}</Text>
            </View>
          </View>

          {/* Theme toggle */}
          <TouchableOpacity
            onPress={() => { onToggleTheme(); onClose() }}
            activeOpacity={0.7}
            className="flex-row items-center gap-x-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800"
          >
            <View className={`h-8 w-8 rounded-xl items-center justify-center ${isDark ? 'bg-amber-100 dark:bg-amber-950' : 'bg-indigo-100 dark:bg-indigo-950'}`}>
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={16} color={isDark ? '#f59e0b' : '#6366f1'} />
            </View>
            <Text className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {isDark ? 'Switch to Light' : 'Switch to Dark'}
            </Text>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            onPress={() => { onLogout(); onClose() }}
            activeOpacity={0.7}
            className="flex-row items-center gap-x-3 px-4 py-3"
          >
            <View className="h-8 w-8 rounded-xl bg-red-100 dark:bg-red-950 items-center justify-center">
              <Ionicons name="log-out-outline" size={16} color="#ef4444" />
            </View>
            <Text className="text-sm font-medium text-red-500">Logout</Text>
          </TouchableOpacity>

        </View>
      </Pressable>
    </Modal>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const [menuOpen, setMenuOpen] = useState(false)

  const router    = useRouter()
  const dispatch  = useAppDispatch()
  const authUser  = useAppSelector(s => s.auth.user)
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

  const handleNavigate = (path: string) => router.push(path as any)

  // Static placeholder data — wire API calls here later
  const loading = false
  const stats = {
    monthRevenue: 0,
    todayBookings: 0,
    inTransit: 0,
    challansReceived: 0,
  }

  const recentBookings: {
    id: string; lr_number: string; sender_name: string
    receiver_name: string; to_city: string; grand_total: number; booked_at: string
  }[] = []

  return (
    <>
      <ScrollView
        className="flex-1 bg-zinc-100 dark:bg-zinc-950"
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Blue Header ── */}
        <View className="bg-blue-600 px-4 pt-14 pb-16">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-blue-200 font-medium">{greet()},</Text>
              <Text className="text-lg font-black text-white">{firstName} 👋</Text>
              <Text className="text-xs text-blue-300 mt-0.5">{today()}</Text>
            </View>
            <View className="flex-row items-center gap-x-2">
              <TouchableOpacity className="h-9 w-9 rounded-full bg-blue-500 items-center justify-center">
                <Ionicons name="notifications-outline" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMenuOpen(true)}
                className="h-9 w-9 rounded-full bg-white items-center justify-center"
                activeOpacity={0.8}
              >
                <Text className="text-xs font-bold text-blue-600">{initials}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Hero Revenue Card ── */}
        <View className="mx-4 -mt-10 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 p-4">
          <Text className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} Revenue
          </Text>
          {loading ? (
            <View className="h-9 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-700 mt-1" />
          ) : (
            <Text className="text-3xl font-black text-zinc-900 dark:text-white tabular-nums mt-0.5">
              ₹ {stats.monthRevenue.toLocaleString('en-IN')}
            </Text>
          )}

          <View className="h-px bg-zinc-100 dark:bg-zinc-800 my-3" />

          <View className="flex-row">
            {[
              { label: "Today's Bookings", value: stats.todayBookings,    color: 'text-blue-600 dark:text-blue-400'       },
              { label: 'In Transit',        value: stats.inTransit,        color: 'text-violet-600 dark:text-violet-400'   },
              { label: 'Challans Recv.',    value: stats.challansReceived, color: 'text-emerald-600 dark:text-emerald-400' },
            ].map((s, i) => (
              <View key={s.label} className={`flex-1 ${i < 2 ? 'border-r border-zinc-100 dark:border-zinc-800' : ''} px-2 items-center`}>
                {loading ? (
                  <View className="h-6 w-8 rounded bg-zinc-200 dark:bg-zinc-700" />
                ) : (
                  <Text className={`text-xl font-black tabular-nums ${s.color}`}>{s.value}</Text>
                )}
                <Text className="text-[10px] text-zinc-400 text-center mt-0.5 leading-tight">{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Nav Sections ── */}
        {sections.map(section => (
          <SectionBlock key={section.title} section={section} onNavigate={handleNavigate} />
        ))}

        {/* ── Recent Bookings ── */}
        <View className="mx-4 mt-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <Text className="text-sm font-semibold text-zinc-900 dark:text-white">Recent Bookings</Text>
            <TouchableOpacity onPress={() => handleNavigate('/(app)/daily/booking')}>
              <Text className="text-xs font-medium text-blue-600">View all</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="items-center justify-center py-10">
              <ActivityIndicator color="#2563eb" />
            </View>
          ) : recentBookings.length === 0 ? (
            <View className="items-center justify-center py-10 gap-y-2">
              <View className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 items-center justify-center">
                <MaterialCommunityIcons name="file-document-outline" size={28} color="#d1d5db" />
              </View>
              <Text className="text-sm text-zinc-400">No bookings yet</Text>
            </View>
          ) : (
            recentBookings.map((b, i) => (
              <TouchableOpacity
                key={b.id}
                activeOpacity={0.7}
                className={`flex-row items-center px-4 py-3 gap-x-3 ${i < recentBookings.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''}`}
              >
                <View className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950 items-center justify-center">
                  <MaterialCommunityIcons name="file-document-outline" size={18} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-x-2">
                    <Text className="text-xs font-bold text-blue-600 font-mono">{b.lr_number}</Text>
                    <Text className="text-xs text-zinc-500 dark:text-zinc-400">{b.to_city}</Text>
                  </View>
                  <Text className="text-sm font-medium text-zinc-900 dark:text-white mt-0.5" numberOfLines={1}>
                    {b.sender_name} → {b.receiver_name}
                  </Text>
                  <Text className="text-xs text-zinc-400 mt-0.5">
                    {new Date(b.booked_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </Text>
                </View>
                <Text className="text-sm font-bold text-emerald-600 tabular-nums">
                  ₹{b.grand_total.toLocaleString('en-IN')}
                </Text>
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

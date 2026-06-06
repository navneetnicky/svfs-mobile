import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import type { DrawerContentComponentProps } from '@react-navigation/drawer'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useColorScheme } from 'nativewind'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { logout } from '@store/authSlice'
import { setTheme } from '@store/themeSlice'

// ─── Nav definition ───────────────────────────────────────────────────────────

type NavItem = {
  label: string
  path: string
  iconName: string
  iconLib?: 'ion' | 'mci'
  iconBg: string
  iconColor: string
}

type NavSection = {
  title: string
  items: NavItem[]
}

const navData: { top: NavItem; sections: NavSection[] } = {
  top: {
    label: 'Dashboard',
    path: '/(app)/dashboard',
    iconName: 'grid',
    iconLib: 'ion',
    iconBg: 'bg-blue-500',
    iconColor: '#ffffff',
  },
  sections: [
    {
      title: 'Daily Working',
      items: [
        { label: 'Booking',             path: '/(app)/daily/booking',       iconName: 'cube-outline',              iconLib: 'ion', iconBg: 'bg-blue-100 dark:bg-blue-950',    iconColor: '#2563eb' },
        { label: 'Challan Register',    path: '/(app)/daily/challan',       iconName: 'file-document-outline',    iconLib: 'mci', iconBg: 'bg-violet-100 dark:bg-violet-950', iconColor: '#7c3aed' },
        { label: 'Route Bulk Delivery', path: '/(app)/daily/bulk-delivery', iconName: 'cube-send',                iconLib: 'mci', iconBg: 'bg-cyan-100 dark:bg-cyan-950',    iconColor: '#0891b2' },
        { label: 'Delivery',            path: '/(app)/daily/delivery',      iconName: 'package-variant-closed',   iconLib: 'mci', iconBg: 'bg-emerald-100 dark:bg-emerald-950', iconColor: '#059669' },
      ],
    },
    {
      title: 'Fleet Management',
      items: [
        { label: 'Diesel Entry',  path: '/(app)/fleet/diesel',   iconName: 'gas-station-outline', iconLib: 'mci', iconBg: 'bg-amber-100 dark:bg-amber-950',  iconColor: '#d97706' },
        { label: 'Toll Entry',    path: '/(app)/fleet/toll',     iconName: 'road-variant',        iconLib: 'mci', iconBg: 'bg-orange-100 dark:bg-orange-950', iconColor: '#ea580c' },
        { label: 'Truck Expense', path: '/(app)/fleet/expenses', iconName: 'wrench-outline',      iconLib: 'ion', iconBg: 'bg-red-100 dark:bg-red-950',       iconColor: '#dc2626' },
      ],
    },
    {
      title: 'Operations',
      items: [
        { label: 'Invoice Register', path: '/(app)/operations/invoices',   iconName: 'receipt-outline',      iconLib: 'ion', iconBg: 'bg-pink-100 dark:bg-pink-950',   iconColor: '#db2777' },
        { label: 'Quotation',        path: '/(app)/operations/quotations', iconName: 'document-text-outline', iconLib: 'ion', iconBg: 'bg-indigo-100 dark:bg-indigo-950', iconColor: '#4f46e5' },
        { label: 'City Wise',        path: '/(app)/operations/city-wise',  iconName: 'map-outline',           iconLib: 'ion', iconBg: 'bg-teal-100 dark:bg-teal-950',   iconColor: '#0d9488' },
        { label: 'Letter Head',      path: '/(app)/operations/letterhead', iconName: 'newspaper-outline',     iconLib: 'ion', iconBg: 'bg-slate-100 dark:bg-slate-800', iconColor: '#475569' },
        { label: 'Income Book',      path: '/(app)/operations/income',     iconName: 'trending-up-outline',   iconLib: 'ion', iconBg: 'bg-green-100 dark:bg-green-950', iconColor: '#16a34a' },
        { label: 'Expense Book',     path: '/(app)/operations/expenses',   iconName: 'trending-down-outline', iconLib: 'ion', iconBg: 'bg-rose-100 dark:bg-rose-950',   iconColor: '#e11d48' },
      ],
    },
  ],
}

// ─── Nav Row ──────────────────────────────────────────────────────────────────

function NavRow({ item }: { item: NavItem }) {
  const router   = useRouter()
  const pathname = usePathname()
  const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
  const Icon = item.iconLib === 'mci' ? MaterialCommunityIcons : Ionicons

  return (
    <TouchableOpacity
      onPress={() => router.push(item.path as any)}
      activeOpacity={0.7}
      className={`flex-row items-center px-3 py-2.5 rounded-xl gap-x-3 ${isActive ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
    >
      <View className={`h-9 w-9 rounded-xl items-center justify-center ${item.iconBg}`}>
        <Icon name={item.iconName as any} size={18} color={item.iconColor} />
      </View>
      <Text className={`flex-1 text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
        {item.label}
      </Text>
      <Ionicons name="chevron-forward" size={14} color={isActive ? '#2563eb' : '#d1d5db'} />
    </TouchableOpacity>
  )
}

// ─── Main drawer content ──────────────────────────────────────────────────────

export function DrawerContent(_props: DrawerContentComponentProps) {
  const dispatch  = useAppDispatch()
  const router    = useRouter()
  const authUser  = useAppSelector(s => s.auth.user)
  const { colorScheme, setColorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const pathname = usePathname()

  const handleToggleTheme = () => {
    const next = isDark ? 'light' : 'dark'
    setColorScheme(next)
    dispatch(setTheme(next))
  }

  const handleLogout = () => {
    dispatch(logout())
    router.replace('/(auth)/login')
  }

  const userName  = authUser ? `${authUser.first_name ?? ''} ${authUser.last_name ?? ''}`.trim() : 'User'
  const userEmail = authUser?.email ?? ''
  const initials  = userName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase() || 'U'

  const dashActive = pathname === navData.top.path

  return (
    <View className="flex-1 bg-white dark:bg-zinc-950">

      {/* ── Profile header ── */}
      <View className="px-4 pt-12 pb-5 border-b border-zinc-100 dark:border-zinc-800">
        <View className="flex-row items-center gap-x-3">
          <View className="h-12 w-12 rounded-2xl bg-blue-600 items-center justify-center">
            <Text className="text-base font-black text-white">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-zinc-900 dark:text-white" numberOfLines={1}>
              {userName}
            </Text>
            <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5" numberOfLines={1}>
              {userEmail}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleToggleTheme}
            className="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={18}
              color={isDark ? '#f59e0b' : '#6366f1'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-3 py-3 gap-y-1" showsVerticalScrollIndicator={false}>

        {/* ── Dashboard (standalone) ── */}
        <TouchableOpacity
          onPress={() => router.push(navData.top.path as any)}
          activeOpacity={0.7}
          className={`flex-row items-center px-3 py-2.5 rounded-xl gap-x-3 mb-2 ${dashActive ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
        >
          <View className={`h-9 w-9 rounded-xl items-center justify-center ${dashActive ? 'bg-blue-500' : 'bg-blue-100 dark:bg-blue-950'}`}>
            <Ionicons name="grid" size={18} color={dashActive ? '#ffffff' : '#2563eb'} />
          </View>
          <Text className={`flex-1 text-sm font-semibold ${dashActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
            Dashboard
          </Text>
          <Ionicons name="chevron-forward" size={14} color={dashActive ? '#2563eb' : '#d1d5db'} />
        </TouchableOpacity>

        {/* ── Sections ── */}
        {navData.sections.map((section, si) => (
          <View key={section.title} className={si > 0 ? 'mt-2' : ''}>
            <Text className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-3 mb-1.5">
              {section.title}
            </Text>
            {section.items.map(item => (
              <NavRow key={item.path} item={item} />
            ))}
          </View>
        ))}

      </ScrollView>

      {/* ── Footer ── */}
      <View className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-4">
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.7}
          className="flex-row items-center gap-x-3 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-950"
        >
          <View className="h-9 w-9 rounded-xl bg-red-100 dark:bg-red-900 items-center justify-center">
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          </View>
          <Text className="flex-1 text-sm font-medium text-red-500">Logout</Text>
          <Ionicons name="chevron-forward" size={14} color="#fca5a5" />
        </TouchableOpacity>
      </View>

    </View>
  )
}

import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, Pressable,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { logout } from '@/src/store/authSlice'
import { setActiveBranch, type WorkspaceBranch } from '@/src/store/workspaceSlice'
import { useBranches } from '@/src/hooks/useBranches'

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

function MenuModal({ visible, onClose, onLogout, userName, userEmail, initials, activeBranch, branches, canSwitchBranch, onSelectBranch }: {
  visible: boolean; onClose: () => void; onLogout: () => void
  userName: string; userEmail: string; initials: string
  activeBranch: WorkspaceBranch | null; branches: WorkspaceBranch[]
  canSwitchBranch: boolean; onSelectBranch: (b: WorkspaceBranch) => void
}) {
  const [branchOpen, setBranchOpen] = useState(false)

  const bg     = '#ffffff'
  const border = '#f4f4f5'
  const text   = '#09090b'
  const muted  = '#a1a1aa'
  const rowBg  = '#f9f9f9'

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1 }} onPress={onClose}>
        <View style={{ position: 'absolute', top: 80, right: 16, width: 268, borderRadius: 20, overflow: 'hidden', backgroundColor: bg, borderWidth: 1, borderColor: border, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 }}>

          {/* User info */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: border }}>
            <View style={{ height: 42, width: 42, borderRadius: 21, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: 'white' }}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: text }} numberOfLines={1}>{userName}</Text>
              <Text style={{ fontSize: 12, color: muted, marginTop: 2 }} numberOfLines={1}>{userEmail}</Text>
            </View>
          </View>

          {/* Branch row */}
          <TouchableOpacity
            onPress={canSwitchBranch ? (e) => { e.stopPropagation(); setBranchOpen(o => !o) } : undefined}
            activeOpacity={canSwitchBranch ? 0.7 : 1}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: branchOpen ? 0 : 1, borderBottomColor: border }}
          >
            <View style={{ height: 36, width: 36, borderRadius: 12, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="business-outline" size={18} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: muted, marginBottom: 1 }}>Current Branch</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: text }} numberOfLines={1}>
                {activeBranch?.branch_name ?? 'Not set'}
              </Text>
              {activeBranch?.branch_code && (
                <Text style={{ fontSize: 11, color: '#2563eb', marginTop: 1 }}>{activeBranch.branch_code}</Text>
              )}
            </View>
            {canSwitchBranch && (
              <Ionicons name={branchOpen ? 'chevron-up' : 'chevron-down'} size={16} color={muted} />
            )}
          </TouchableOpacity>

          {/* Inline branch list */}
          {branchOpen && (
            <View style={{ borderBottomWidth: 1, borderBottomColor: border, backgroundColor: rowBg }}>
              {branches.map((b, i) => {
                const isActive = b.id === activeBranch?.id
                return (
                  <TouchableOpacity
                    key={b.id}
                    onPress={(e) => { e.stopPropagation(); onSelectBranch(b); setBranchOpen(false); onClose() }}
                    activeOpacity={0.7}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 11, borderTopWidth: i === 0 ? 1 : 0, borderTopColor: border }}
                  >
                    <Ionicons name="git-branch-outline" size={15} color={isActive ? '#2563eb' : muted} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: isActive ? '700' : '500', color: isActive ? '#2563eb' : text }} numberOfLines={1}>
                        {b.branch_name}
                      </Text>
                      <Text style={{ fontSize: 11, color: muted }}>{b.branch_code}</Text>
                    </View>
                    {isActive && <Ionicons name="checkmark-circle" size={16} color="#2563eb" />}
                  </TouchableOpacity>
                )
              })}
            </View>
          )}

          {/* Logout */}
          <TouchableOpacity onPress={() => { onLogout(); onClose() }} activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
            <View style={{ height: 36, width: 36, borderRadius: 12, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' }}>
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
    <View className="flex-1 bg-white rounded-2xl p-4 gap-y-3 border border-zinc-100">
      <View className={`h-10 w-10 rounded-xl items-center justify-center ${iconBg}`}>
        <Icon name={iconName as any} size={20} color={iconColor} />
      </View>
      {loading
        ? <View className="h-7 w-14 rounded-lg bg-zinc-200" />
        : <Text className={`text-2xl font-black tabular-nums ${valueColor}`}>{value}</Text>
      }
      <Text className="text-xs text-zinc-500 font-medium leading-tight">{label}</Text>
    </View>
  )
}

// ─── Home ─────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { top } = useSafeAreaInsets()

  const router       = useRouter()
  const dispatch     = useAppDispatch()
  const authUser     = useAppSelector(s => s.auth.user)
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)
  const branches     = useAppSelector(s => s.workspace.branches)

  useBranches()

  const canSwitchBranch = !authUser?.branch_id

  const firstName = authUser?.first_name ?? 'there'
  const userName  = authUser ? `${authUser.first_name ?? ''} ${authUser.last_name ?? ''}`.trim() : 'User'
  const userEmail = authUser?.email ?? ''
  const initials  = userName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase() || 'U'

  const handleLogout = () => {
    dispatch(logout())
    router.replace('/(auth)/login')
  }

  const handleSelectBranch = (b: WorkspaceBranch) => {
    dispatch(setActiveBranch(b))
  }

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
        className="flex-1 bg-zinc-100"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ── */}
        <View
          className="bg-blue-600 px-4 pb-20"
          style={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32, marginTop: -top, paddingTop: top + 16 }}
        >
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
                activeOpacity={0.8}
                className="flex-row items-center gap-x-2 bg-white/15 rounded-full pl-3 pr-1 py-1"
              >
                {activeBranch && (
                  <Text className="text-xs font-semibold text-white" numberOfLines={1}>
                    {activeBranch.branch_name}
                  </Text>
                )}
                <View className="h-7 w-7 rounded-full bg-white items-center justify-center">
                  <Text className="text-[10px] font-black text-blue-600">{initials}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <Text className="text-blue-200 text-sm font-medium">{greet()}</Text>
          <Text className="text-white text-2xl font-black mt-0.5">{firstName} 👋</Text>
          <Text className="text-blue-300 text-xs mt-1">{today()}</Text>
        </View>

        {/* ── Revenue card ── */}
        <View
          className="mx-4 bg-white rounded-2xl p-4 border border-zinc-100"
          style={{ marginTop: -52, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 }}
        >
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-xs font-medium text-zinc-400">{month} Revenue</Text>
              {loading
                ? <View className="h-9 w-32 rounded-lg bg-zinc-200 mt-1" />
                : <Text className="text-3xl font-black text-zinc-900 tabular-nums mt-1">
                    ₹ {stats.monthRevenue.toLocaleString('en-IN')}
                  </Text>
              }
            </View>
            <View className="h-10 w-10 rounded-xl bg-blue-50 items-center justify-center">
              <Ionicons name="wallet-outline" size={20} color="#2563eb" />
            </View>
          </View>
        </View>

        {/* ── Metric cards 2×2 ── */}
        <View className="mx-4 mt-4 gap-y-3">
          <Text className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Key Metrics</Text>
          <View className="flex-row gap-x-3">
            <MetricCard
              label="Today's Bookings" value={stats.todayBookings}
              iconName="cube-outline" iconBg="bg-blue-50"
              iconColor="#2563eb" valueColor="text-blue-600" loading={loading}
            />
            <MetricCard
              label="In Transit" value={stats.inTransit}
              iconName="truck-outline" iconLib="mci" iconBg="bg-violet-50"
              iconColor="#7c3aed" valueColor="text-violet-600" loading={loading}
            />
          </View>
          <View className="flex-row gap-x-3">
            <MetricCard
              label="Challans Received" value={stats.challansReceived}
              iconName="checkmark-circle-outline" iconBg="bg-emerald-50"
              iconColor="#059669" valueColor="text-emerald-600" loading={loading}
            />
            <MetricCard
              label="Total LRs" value={stats.totalLRs}
              iconName="document-text-outline" iconBg="bg-amber-50"
              iconColor="#d97706" valueColor="text-amber-600" loading={loading}
            />
          </View>
        </View>

        {/* ── Recent Bookings ── */}
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-zinc-100 overflow-hidden">
          <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-zinc-100">
            <View>
              <Text className="text-sm font-bold text-zinc-900">Recent Bookings</Text>
              <Text className="text-xs text-zinc-400 mt-0.5">Latest LR entries</Text>
            </View>
            <TouchableOpacity className="bg-blue-50 px-3 py-1.5 rounded-full">
              <Text className="text-xs font-semibold text-blue-600">View all</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator color="#2563eb" size="large" />
            </View>
          ) : recentBookings.length === 0 ? (
            <View className="items-center justify-center py-12 gap-y-3">
              <View className="h-16 w-16 rounded-3xl bg-zinc-100 items-center justify-center">
                <MaterialCommunityIcons name="file-document-outline" size={30} color="#a1a1aa" />
              </View>
              <View className="items-center gap-y-1">
                <Text className="text-sm font-semibold text-zinc-600">No bookings yet</Text>
                <Text className="text-xs text-zinc-400">Create your first LR to get started</Text>
              </View>
            </View>
          ) : (
            recentBookings.map((b, i) => (
              <TouchableOpacity
                key={b.id}
                activeOpacity={0.7}
                className={`flex-row items-center px-4 py-3 gap-x-3 ${i < recentBookings.length - 1 ? 'border-b border-zinc-100' : ''}`}
              >
                <View className="h-10 w-10 rounded-xl bg-blue-50 items-center justify-center">
                  <MaterialCommunityIcons name="file-document-outline" size={18} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-x-2">
                    <View className="bg-blue-50 px-2 py-0.5 rounded-md">
                      <Text className="text-[10px] font-black text-blue-600 font-mono">{b.lr_number}</Text>
                    </View>
                    <Text className="text-xs text-zinc-400">{b.to_city}</Text>
                  </View>
                  <Text className="text-sm font-medium text-zinc-900 mt-1" numberOfLines={1}>
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
                  <View className="bg-emerald-50 px-2 py-0.5 rounded-full">
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
        onLogout={handleLogout}
        userName={userName}
        userEmail={userEmail}
        initials={initials}
        activeBranch={activeBranch}
        branches={branches}
        canSwitchBranch={canSwitchBranch}
        onSelectBranch={handleSelectBranch}
      />
    </>
  )
}

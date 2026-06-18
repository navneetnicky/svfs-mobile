import { useState } from 'react'
import {
  View, Text, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAppSelector } from '@/src/store/hooks'
import { useChallan, useTransferChallan } from '@hooks/useChallans'
import { useBranches } from '@hooks/useBranches'
import { Autocomplete } from '@/src/components/form/Autocomplete'
import type { BranchRecord } from '@/src/services/branchService'
import { colors, radius, typography } from '@/src/theme'

export default function ChallanTransferScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: challan, isLoading } = useChallan(id)
  const { mutate: transferChallan, isPending } = useTransferChallan(id)
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)
  const { data: allBranches = [] } = useBranches()

  const [toBranchId,   setToBranchId]   = useState<string | null>(null)
  const [toBranchName, setToBranchName] = useState('')

  const otherBranches = allBranches.filter(b => b.id !== activeBranch?.id)

  const currentToLabel = challan?.to_branch?.branch_name
    ?? challan?.to_location_master?.address
    ?? '—'

  function handleSelect(branch: BranchRecord) {
    setToBranchId(branch.id)
    setToBranchName(branch.branch_name)
  }

  function handleSubmit() {
    if (!toBranchId) { Alert.alert('Select Branch', 'Please select a new destination branch.'); return }
    if (toBranchId === challan?.to_branch_id) { Alert.alert('Same Branch', 'New destination is the same as current.'); return }

    Alert.alert(
      'Confirm Transfer',
      `Change destination from "${currentToLabel}" to "${toBranchName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer', onPress: () =>
            transferChallan(toBranchId, {
              onSuccess: () => router.back(),
              onError:   () => Alert.alert('Error', 'Failed to transfer challan. Please try again.'),
            }),
        },
      ]
    )
  }

  if (isLoading || !challan) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>

        {/* Header */}
        <View style={{
          backgroundColor: colors.card,
          paddingTop: 12, paddingBottom: 12, paddingHorizontal: 16,
          borderBottomWidth: 1, borderBottomColor: colors.border,
          flexDirection: 'row', alignItems: 'center', gap: 12,
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: typography.size.xl, fontWeight: typography.weight.extrabold, color: colors.foreground }}>
              Transfer Challan
            </Text>
            <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg, fontFamily: 'monospace' }}>
              {challan.challan_no}
            </Text>
          </View>
        </View>

        <View style={{ padding: 16, flex: 1 }}>

          {/* Current route info */}
          <View style={{
            backgroundColor: colors.card, borderRadius: radius.xl,
            borderWidth: 1, borderColor: colors.border,
            padding: 16, marginBottom: 16,
          }}>
            <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.bold, color: colors.subtleFg, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
              Current Route
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flex: 1, backgroundColor: colors.muted, borderRadius: radius.lg, padding: 10 }}>
                <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg, marginBottom: 2 }}>From</Text>
                <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.foreground }}>
                  {challan.from_branch?.branch_name ?? '—'}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={colors.subtleFg} />
              <View style={{ flex: 1, backgroundColor: '#fef3c7', borderRadius: radius.lg, padding: 10 }}>
                <Text style={{ fontSize: typography.size.xs, color: '#92400e', marginBottom: 2 }}>Current To</Text>
                <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: '#92400e' }}>
                  {currentToLabel}
                </Text>
              </View>
            </View>

            {/* New destination preview */}
            {toBranchName ? (
              <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ flex: 1 }} />
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                <View style={{ flex: 1, backgroundColor: colors.primaryLight, borderRadius: radius.lg, padding: 10, borderWidth: 1, borderColor: colors.primary }}>
                  <Text style={{ fontSize: typography.size.xs, color: colors.primary, marginBottom: 2 }}>New To</Text>
                  <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.primary }}>
                    {toBranchName}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Branch picker */}
          <View style={{
            backgroundColor: colors.card, borderRadius: radius.xl,
            borderWidth: 1, borderColor: colors.border,
            padding: 16,
          }}>
            <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.bold, color: colors.subtleFg, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
              New Destination
            </Text>
            <Autocomplete
              label="Transfer To Branch"
              value={toBranchName}
              icon="location-outline"
              placeholder="Select new destination..."
              searchPlaceholder="Search branch..."
              emptyText="No branches found"
              items={otherBranches}
              keyExtractor={b => b.id}
              onQueryChange={q => {
                setToBranchName(q)
                if (!q) setToBranchId(null)
              }}
              onClose={q => setToBranchName(q)}
              onSelect={handleSelect}
              renderItem={branch => (
                <View style={{
                  paddingHorizontal: 16, paddingVertical: 13,
                  borderBottomWidth: 1, borderBottomColor: colors.border,
                  backgroundColor: branch.id === toBranchId ? colors.primaryLight : undefined,
                }}>
                  <Text style={{
                    fontSize: typography.size.base, color: colors.foreground,
                    fontWeight: branch.id === toBranchId ? typography.weight.bold : typography.weight.normal,
                  }}>
                    {branch.branch_name}
                  </Text>
                  <Text style={{ fontSize: typography.size.xs, color: colors.subtleFg, marginTop: 1 }}>
                    {branch.branch_code}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={{
          backgroundColor: colors.card,
          borderTopWidth: 1, borderTopColor: colors.border,
          padding: 16,
        }}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending || !toBranchId}
            style={{
              backgroundColor: (!toBranchId || isPending) ? colors.border : '#d97706',
              borderRadius: radius.lg, paddingVertical: 14,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            activeOpacity={0.8}
          >
            {isPending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="swap-horizontal-outline" size={18} color="#fff" />
            }
            <Text style={{ color: '#fff', fontSize: typography.size.base, fontWeight: typography.weight.bold }}>
              {isPending ? 'Transferring...' : 'Confirm Transfer'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

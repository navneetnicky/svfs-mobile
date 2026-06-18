import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAppSelector } from '@/src/store/hooks'
import { useCreateChallan } from '@hooks/useChallans'
import { useBranches } from '@hooks/useBranches'
import { FormField } from '@/src/components/form/FormField'
import { TruckPicker } from '@/src/components/form/TruckPicker'
import { DriverCombobox } from '@/src/components/form/DriverCombobox'
import { Autocomplete } from '@/src/components/form/Autocomplete'
import { LRPickerModal } from '@/src/components/challan/LRPickerModal'
import { ChallanSuccessOverlay } from '@/src/components/SuccessOverlay'
import type { ChallanLRRow, TruckRecord } from '@/src/types/challan'
import type { BranchRecord } from '@/src/services/branchService'
import { colors, radius, typography } from '@/src/theme'

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={{
      backgroundColor: colors.card, borderRadius: radius.xl,
      padding: 16, marginBottom: 12,
      borderWidth: 1, borderColor: colors.border,
    }}>
      {children}
    </View>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text style={{
      fontSize: typography.size.xs, fontWeight: typography.weight.bold,
      color: colors.subtleFg, textTransform: 'uppercase', letterSpacing: 0.8,
      marginBottom: 14,
    }}>
      {title}
    </Text>
  )
}

export default function ChallanCreateScreen() {
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)
  const { mutate: createChallan, isPending } = useCreateChallan()
  const { data: allBranches = [] } = useBranches()

  // Route
  const [toBranchId,   setToBranchId]   = useState<string | null>(null)
  const [toBranchName, setToBranchName] = useState('')

  // Truck & driver
  const [truckId,       setTruckId]       = useState('')
  const [truckNumber,   setTruckNumber]   = useState('')
  const [selectedTruck, setSelectedTruck] = useState<TruckRecord | null>(null)
  const [driverName,    setDriverName]    = useState('')
  const [driverMobile,  setDriverMobile]  = useState('')
  const [driverLicence, setDriverLicence] = useState('')
  const [departureAt,   setDepartureAt]   = useState('')
  const [remarks,       setRemarks]       = useState('')

  // LRs
  const [selectedLRs,  setSelectedLRs]  = useState<ChallanLRRow[]>([])
  const [lrPickerOpen, setLrPickerOpen] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [successChallanNo, setSuccessChallanNo] = useState<string | null>(null)

  const otherBranches = allBranches.filter(b => b.id !== activeBranch?.id)

  const totalPkgs    = selectedLRs.reduce((s, lr) => s + lr.pkgs, 0)
  const totalFreight = selectedLRs.reduce((s, lr) => s + lr.freight, 0)

  function handleTruckSelect(truck: TruckRecord) {
    setTruckId(truck.id)
    setTruckNumber(truck.truck_number)
    setSelectedTruck(truck)
  }

  function handleBranchSelect(branch: BranchRecord) {
    setToBranchId(branch.id)
    setToBranchName(branch.branch_name)
  }

  function removeLR(id: string) {
    setSelectedLRs(prev => prev.filter(lr => lr.id !== id))
  }

  function validate(): string | null {
    if (!truckId)           return 'Please select a truck.'
    if (!driverName.trim()) return 'Driver name is required.'
    if (selectedLRs.length === 0) return 'Please add at least one LR.'
    return null
  }

  function handleSubmit() {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)

    createChallan({
      to_branch_id:  toBranchId,
      truck_id:      truckId,
      driver_name:   driverName.trim(),
      driver_mobile: driverMobile.trim() || undefined,
      driver_licence: driverLicence.trim().toUpperCase() || undefined,
      departure_at:  departureAt.trim() || undefined,
      remarks:       remarks.trim() || undefined,
      booking_ids:   selectedLRs.map(lr => lr.id),
    }, {
      onSuccess: (result) => setSuccessChallanNo(result.challan_no),
      onError:   () => setError('Failed to create challan. Please try again.'),
    })
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
          <Text style={{ fontSize: typography.size.xl, fontWeight: typography.weight.extrabold, color: colors.foreground, flex: 1 }}>
            New Challan
          </Text>
          {activeBranch && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryMuted, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Ionicons name="business-outline" size={11} color={colors.primary} />
              <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: colors.primary }}>
                {activeBranch.branch_name}
              </Text>
            </View>
          )}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Error banner */}
          {error && (
            <View style={{
              backgroundColor: '#fee2e2', borderRadius: radius.lg,
              padding: 12, marginBottom: 12,
              flexDirection: 'row', alignItems: 'center', gap: 8,
              borderWidth: 1, borderColor: '#fca5a5',
            }}>
              <Ionicons name="alert-circle" size={16} color={colors.destructive} />
              <Text style={{ color: colors.destructive, fontSize: typography.size.sm, flex: 1, fontWeight: typography.weight.medium }}>
                {error}
              </Text>
            </View>
          )}

          {/* Route */}
          <SectionCard>
            <SectionTitle title="Route" />
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.mutedFg, marginBottom: 4 }}>
                From Branch
              </Text>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 8,
                backgroundColor: colors.muted, borderRadius: radius.lg,
                paddingHorizontal: 12, paddingVertical: 11,
                borderWidth: 1, borderColor: colors.border,
              }}>
                <Ionicons name="business-outline" size={15} color={colors.subtleFg} />
                <Text style={{ fontSize: typography.size.base, color: colors.mutedFg }}>
                  {activeBranch?.branch_name ?? '—'}
                </Text>
              </View>
            </View>

            <Autocomplete
              label="To Branch"
              value={toBranchName}
              icon="location-outline"
              placeholder="Select destination branch..."
              searchPlaceholder="Search branch..."
              emptyText="No branches found"
              items={otherBranches}
              keyExtractor={b => b.id}
              onQueryChange={q => {
                setToBranchName(q)
                if (!q) { setToBranchId(null) }
              }}
              onClose={q => setToBranchName(q)}
              onSelect={handleBranchSelect}
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
          </SectionCard>

          {/* Truck & Driver */}
          <SectionCard>
            <SectionTitle title="Truck & Driver" />
            <TruckPicker value={truckNumber} selectedTruck={selectedTruck} onSelect={handleTruckSelect} required />
            <DriverCombobox value={driverName} onChange={setDriverName} required />
            <FormField label="Mobile" value={driverMobile} onChangeText={setDriverMobile} placeholder="10-digit mobile" keyboardType="phone-pad" />
            <FormField
              label="Licence No."
              value={driverLicence}
              onChangeText={v => setDriverLicence(v.toUpperCase())}
              placeholder="DL-XXXXXXXXXXXX"
              autoCapitalize="characters"
            />
            <FormField label="Departure At" value={departureAt} onChangeText={setDepartureAt} placeholder="e.g. 2026-06-18T14:30" />
            <FormField label="Remarks" value={remarks} onChangeText={setRemarks} placeholder="Optional notes..." multiline />
          </SectionCard>

          {/* LRs */}
          <SectionCard>
            <SectionTitle title="LR Manifest" />

            <TouchableOpacity
              onPress={() => setLrPickerOpen(true)}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed',
                borderRadius: radius.lg, paddingVertical: 12, marginBottom: 12,
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: typography.weight.semibold, fontSize: typography.size.sm }}>
                {selectedLRs.length === 0 ? 'Add LRs' : 'Change LRs'}
              </Text>
            </TouchableOpacity>

            {selectedLRs.length > 0 && (
              <>
                {selectedLRs.map(lr => (
                  <View key={lr.id} style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8,
                  }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.primary, fontFamily: 'monospace' }}>
                          {lr.lr_number}
                        </Text>
                        <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.foreground }}>
                          ₹{lr.freight.toLocaleString('en-IN')}
                        </Text>
                      </View>
                      <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg, marginTop: 1 }} numberOfLines={1}>
                        {lr.sender} → {lr.receiver} · {lr.to_city}
                      </Text>
                      <Text style={{ fontSize: typography.size.xs, color: colors.subtleFg }}>
                        {lr.pkgs} pkgs · {lr.weight} kg
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => removeLR(lr.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close-circle" size={18} color={colors.subtleFg} />
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                  <Text style={{ fontSize: typography.size.sm, color: colors.mutedFg }}>
                    {selectedLRs.length} LRs · {totalPkgs} pkgs
                  </Text>
                  <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.foreground }}>
                    ₹{totalFreight.toLocaleString('en-IN')}
                  </Text>
                </View>
              </>
            )}
          </SectionCard>
        </ScrollView>

        {/* Footer */}
        <View style={{
          backgroundColor: colors.card,
          borderTopWidth: 1, borderTopColor: colors.border,
          padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12,
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg }}>
              {selectedLRs.length} LRs · ₹{totalFreight.toLocaleString('en-IN')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending}
            style={{
              backgroundColor: isPending ? colors.border : colors.primary,
              borderRadius: radius.lg, paddingHorizontal: 24, paddingVertical: 13,
              flexDirection: 'row', alignItems: 'center', gap: 6,
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
            <Text style={{ color: '#fff', fontSize: typography.size.base, fontWeight: typography.weight.bold }}>
              {isPending ? 'Creating...' : 'Create Challan'}
            </Text>
          </TouchableOpacity>
        </View>

        <LRPickerModal
          visible={lrPickerOpen}
          selectedIds={selectedLRs.map(lr => lr.id)}
          onConfirm={setSelectedLRs}
          onClose={() => setLrPickerOpen(false)}
        />
      </View>

      {successChallanNo != null && (
        <ChallanSuccessOverlay
          challanNo={successChallanNo}
          onDone={() => router.back()}
        />
      )}
    </KeyboardAvoidingView>
  )
}

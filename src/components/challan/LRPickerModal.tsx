import { useState, useMemo } from 'react'
import {
  View, Text, Modal, TouchableOpacity, FlatList,
  TextInput, ActivityIndicator, SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAvailableLRs } from '@hooks/useChallans'
import type { ChallanLRRow } from '@/src/types/challan'
import { colors, radius, typography } from '@/src/theme'

type Props = {
  visible:         boolean
  selectedIds:     string[]
  excludeChallanId?: string
  onConfirm:       (lrs: ChallanLRRow[]) => void
  onClose:         () => void
}

export function LRPickerModal({ visible, selectedIds, excludeChallanId, onConfirm, onClose }: Props) {
  const [search, setSearch] = useState('')
  const [checked, setChecked] = useState<Set<string>>(new Set(selectedIds))

  const { data: lrs = [], isLoading } = useAvailableLRs({ exclude_challan_id: excludeChallanId })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return lrs
    return lrs.filter(lr =>
      lr.lr_number.toLowerCase().includes(q) ||
      lr.sender.toLowerCase().includes(q) ||
      lr.receiver.toLowerCase().includes(q) ||
      lr.to_city.toLowerCase().includes(q)
    )
  }, [lrs, search])

  function toggle(id: string) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleConfirm() {
    const selected = lrs.filter(lr => checked.has(lr.id))
    onConfirm(selected)
    onClose()
  }

  const totalPkgs    = lrs.filter(lr => checked.has(lr.id)).reduce((s, lr) => s + lr.pkgs, 0)
  const totalFreight = lrs.filter(lr => checked.has(lr.id)).reduce((s, lr) => s + lr.freight, 0)

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 10,
          paddingHorizontal: 16, paddingVertical: 12,
          backgroundColor: colors.card,
          borderBottomWidth: 1, borderBottomColor: colors.border,
        }}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={{ flex: 1, fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: colors.foreground }}>
            Select LRs
          </Text>
          <Text style={{ fontSize: typography.size.sm, color: colors.primary, fontWeight: typography.weight.semibold }}>
            {checked.size} selected
          </Text>
        </View>

        {/* Search */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 8,
          margin: 12, paddingHorizontal: 12,
          backgroundColor: colors.card, borderRadius: radius.lg,
          borderWidth: 1, borderColor: colors.border,
        }}>
          <Ionicons name="search-outline" size={16} color={colors.subtleFg} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search LR, sender, receiver, city..."
            placeholderTextColor={colors.subtleFg}
            style={{ flex: 1, paddingVertical: 10, fontSize: typography.size.base, color: colors.foreground }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={colors.subtleFg} />
            </TouchableOpacity>
          )}
        </View>

        {/* List */}
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Ionicons name="document-outline" size={32} color={colors.subtleFg} />
            <Text style={{ color: colors.mutedFg, fontSize: typography.size.sm }}>
              {search ? 'No LRs match your search' : 'No available LRs'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={lr => lr.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
            renderItem={({ item: lr }) => {
              const isChecked = checked.has(lr.id)
              return (
                <TouchableOpacity
                  onPress={() => toggle(lr.id)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    backgroundColor: isChecked ? colors.primaryLight : colors.card,
                    borderRadius: radius.lg, padding: 12, marginBottom: 8,
                    borderWidth: 1, borderColor: isChecked ? colors.primary : colors.border,
                  }}
                >
                  <View style={{
                    width: 22, height: 22, borderRadius: 6,
                    borderWidth: 2, borderColor: isChecked ? colors.primary : colors.border,
                    backgroundColor: isChecked ? colors.primary : 'transparent',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isChecked && <Ionicons name="checkmark" size={13} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.primary, fontFamily: 'monospace' }}>
                        {lr.lr_number}
                      </Text>
                      <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.foreground }}>
                        ₹{lr.freight.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <Text style={{ fontSize: typography.size.sm, color: colors.foreground }} numberOfLines={1}>
                      {lr.sender} <Text style={{ color: colors.subtleFg }}>→</Text> {lr.receiver}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 3 }}>
                      <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg }}>{lr.to_city}</Text>
                      <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg }}>{lr.pkgs} pkgs</Text>
                      <Text style={{ fontSize: typography.size.xs, color: colors.mutedFg }}>{lr.weight} kg</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            }}
          />
        )}

        {/* Footer */}
        <View style={{
          backgroundColor: colors.card,
          borderTopWidth: 1, borderTopColor: colors.border,
          padding: 16, gap: 10,
        }}>
          {checked.size > 0 && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: typography.size.sm, color: colors.mutedFg }}>
                {checked.size} LRs · {totalPkgs} pkgs
              </Text>
              <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.foreground }}>
                ₹{totalFreight.toLocaleString('en-IN')}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={checked.size === 0}
            style={{
              backgroundColor: checked.size === 0 ? colors.border : colors.primary,
              borderRadius: radius.lg, paddingVertical: 14,
              alignItems: 'center',
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#fff', fontSize: typography.size.base, fontWeight: typography.weight.bold }}>
              {checked.size === 0 ? 'Select LRs to continue' : `Add ${checked.size} LR${checked.size !== 1 ? 's' : ''}`}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

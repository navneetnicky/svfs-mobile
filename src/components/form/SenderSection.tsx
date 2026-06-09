import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius, typography } from '@/src/theme'
import { FormField } from './FormField'
import { PartyCombobox } from './PartyCombobox'
import type { PartyAddress } from '@/src/services/partyService'
import type { BookingInvoice, BookingInsurance } from '@/src/types/booking'

export interface SenderExtra {
  invoices: BookingInvoice[]
  address: string
  place_id: string
  crossing_agent_lr: string
  crossing_agent_name: string
  crossing_agent_id: string
  insurance: BookingInsurance
  cod: string
  document_note: string
}

export function emptySenderExtra(): SenderExtra {
  return {
    invoices: [{ eway_bill: '', inv_no: '', inv_amt: '' }],
    address: '',
    place_id: '',
    crossing_agent_lr: '',
    crossing_agent_name: '',
    crossing_agent_id: '',
    insurance: { company_name: '', policy_no: '', amount: '', ins_date: '', remark: '' },
    cod: '',
    document_note: '',
  }
}

function buildAddressLabels(addrs: PartyAddress[]): { addr: PartyAddress; label: string }[] {
  const filtered = addrs.filter(a => a.address?.trim())
  const typeCounts: Record<string, number> = {}
  filtered.forEach(a => { typeCounts[a.address_type] = (typeCounts[a.address_type] ?? 0) + 1 })
  const typeIdx: Record<string, number> = {}
  return filtered.map(addr => {
    const base = addr.address_type === 'GODOWN' ? 'Godown' : 'Door'
    if (typeCounts[addr.address_type] > 1) {
      typeIdx[addr.address_type] = (typeIdx[addr.address_type] ?? 0) + 1
      return { addr, label: `${base} ${typeIdx[addr.address_type]}` }
    }
    return { addr, label: base }
  })
}

type Tab = 'invoice' | 'address' | 'crossing' | 'insurance' | 'cod' | 'document'

const TABS: { id: Tab; label: string }[] = [
  { id: 'invoice',   label: 'Invoice/E-way' },
  { id: 'address',   label: 'Address' },
  { id: 'crossing',  label: 'Crossing Agent' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'cod',       label: 'COD' },
  { id: 'document',  label: 'Document' },
]

type Props = {
  value: SenderExtra
  onChange: (v: SenderExtra) => void
  savedAddresses?: PartyAddress[]
}

export function SenderSection({ value, onChange, savedAddresses }: Props) {
  const [tab, setTab] = useState<Tab>('invoice')

  function set<K extends keyof SenderExtra>(key: K, v: SenderExtra[K]) {
    onChange({ ...value, [key]: v })
  }

  function updateInvoice(i: number, field: keyof BookingInvoice, v: string) {
    const updated = value.invoices.map((inv, idx) => idx === i ? { ...inv, [field]: v } : inv)
    set('invoices', updated)
  }

  function addInvoice() {
    set('invoices', [...value.invoices, { eway_bill: '', inv_no: '', inv_amt: '' }])
  }

  function removeInvoice(i: number) {
    set('invoices', value.invoices.filter((_, idx) => idx !== i))
  }

  function updateInsurance(field: keyof BookingInsurance, v: string) {
    set('insurance', { ...value.insurance, [field]: v })
  }


  return (
    <View>
      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {TABS.map(t => {
            const active = tab === t.id
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTab(t.id)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 7,
                  borderRadius: radius.full,
                  backgroundColor: active ? colors.primary : colors.background,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                }}
              >
                <Text style={{
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.semibold,
                  color: active ? '#fff' : colors.mutedFg,
                }}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      {/* Tab content */}
      {tab === 'invoice' && (
        <View>
          {value.invoices.map((inv, i) => (
            <View key={i} style={{
              backgroundColor: colors.background, borderRadius: radius.lg,
              padding: 12, marginBottom: 10,
              borderWidth: 1, borderColor: colors.border,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: colors.foreground }}>
                  Invoice {i + 1}
                </Text>
                {value.invoices.length > 1 && (
                  <TouchableOpacity onPress={() => removeInvoice(i)}>
                    <Ionicons name="trash-outline" size={15} color={colors.destructive} />
                  </TouchableOpacity>
                )}
              </View>
              <FormField
                label="E-way Bill No."
                value={inv.eway_bill}
                onChangeText={v => updateInvoice(i, 'eway_bill', v)}
                placeholder="e.g. 123456789012"
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <FormField
                    label="Invoice No."
                    value={inv.inv_no}
                    onChangeText={v => updateInvoice(i, 'inv_no', v)}
                    placeholder="INV-001"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FormField
                    label="Invoice Amount"
                    value={inv.inv_amt}
                    onChangeText={v => updateInvoice(i, 'inv_amt', v)}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              {inv.valid_upto ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: -4, marginBottom: 8 }}>
                  <Ionicons name="time-outline" size={11} color={colors.success} />
                  <Text style={{ fontSize: typography.size.xs, color: colors.success, fontWeight: typography.weight.medium }}>
                    Valid upto {inv.valid_upto}
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
          <TouchableOpacity
            onPress={addInvoice}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 }}
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: typography.weight.semibold, fontSize: typography.size.sm }}>
              Add Invoice
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {tab === 'address' && (
        <View>
          {savedAddresses && savedAddresses.length > 0 ? (
            <View>
              <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.mutedFg, marginBottom: 8 }}>
                Saved Addresses
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {buildAddressLabels(savedAddresses).map(({ addr, label }) => {
                  const selected = value.address === addr.address
                  return (
                    <TouchableOpacity
                      key={addr.id}
                      onPress={() => onChange({ ...value, address: addr.address, place_id: addr.place_id ?? '' })}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 4,
                        paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full,
                        backgroundColor: selected ? colors.primary : colors.background,
                        borderWidth: 1, borderColor: selected ? colors.primary : colors.border,
                      }}
                    >
                      <Ionicons name="location-outline" size={11} color={selected ? '#fff' : colors.mutedFg} />
                      <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: selected ? '#fff' : colors.mutedFg }}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
              <Text style={{ fontSize: typography.size.xs, color: colors.subtleFg, marginBottom: 4, paddingHorizontal: 2 }} numberOfLines={2}>
                {value.address || 'Tap a pill to select an address'}
              </Text>
            </View>
          ) : (
            <FormField
              label="Sender Address"
              value={value.address}
              onChangeText={v => set('address', v)}
              placeholder="Full pickup address..."
              multiline
            />
          )}
        </View>
      )}

      {tab === 'crossing' && (
        <View>
          <PartyCombobox
            label="Crossing Agent"
            value={value.crossing_agent_name}
            onChange={v => set('crossing_agent_name', v)}
            onSelect={party => onChange({ ...value, crossing_agent_name: party.legal_name, crossing_agent_id: party.id })}
          />
          <FormField
            label="Agent LR Number"
            value={value.crossing_agent_lr}
            onChangeText={v => set('crossing_agent_lr', v)}
            placeholder="LR number"
          />
        </View>
      )}

      {tab === 'insurance' && (
        <View>
          <FormField
            label="Insurance Company"
            value={value.insurance.company_name}
            onChangeText={v => updateInsurance('company_name', v)}
            placeholder="Company name"
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <FormField
                label="Policy No."
                value={value.insurance.policy_no}
                onChangeText={v => updateInsurance('policy_no', v)}
                placeholder="Policy number"
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormField
                label="Amount (₹)"
                value={value.insurance.amount}
                onChangeText={v => updateInsurance('amount', v)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>
          <FormField
            label="Insurance Date"
            value={value.insurance.ins_date}
            onChangeText={v => updateInsurance('ins_date', v)}
            placeholder="DD/MM/YYYY"
          />
          <FormField
            label="Remark"
            value={value.insurance.remark}
            onChangeText={v => updateInsurance('remark', v)}
            placeholder="Optional remark..."
            multiline
          />
        </View>
      )}

      {tab === 'cod' && (
        <FormField
          label="COD Amount (₹)"
          value={value.cod}
          onChangeText={v => set('cod', v)}
          placeholder="0"
          keyboardType="numeric"
          hint="Cash on Delivery amount to collect from receiver"
        />
      )}

      {tab === 'document' && (
        <View style={{
          borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
          borderStyle: 'dashed', padding: 24, alignItems: 'center', gap: 10,
        }}>
          <Ionicons name="document-attach-outline" size={32} color={colors.subtleFg} />
          <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: colors.mutedFg }}>
            Attach Documents
          </Text>
          <Text style={{ fontSize: typography.size.xs, color: colors.subtleFg, textAlign: 'center' }}>
            Document upload will be available in a future update.
          </Text>
        </View>
      )}
    </View>
  )
}

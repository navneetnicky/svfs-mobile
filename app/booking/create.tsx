import { useState } from 'react'
import {
  ScrollView, View, Text, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useCreateBooking } from '@hooks/useBookings'
import type { BookingType, BookingFormData, GstPaidBy } from '@/src/types/booking'
import { colors, radius, typography, shadow } from '@/src/theme'
import { StepIndicator } from '@/src/components/form/StepIndicator'
import { SegmentControl } from '@/src/components/form/SegmentControl'
import { CityPicker } from '@/src/components/form/CityPicker'
import { PartyCombobox } from '@/src/components/form/PartyCombobox'
import { FormField } from '@/src/components/form/FormField'
import { ItemsEditor, emptyItem, type ItemDraft } from '@/src/components/form/ItemsEditor'
import { SenderSection, emptySenderExtra, type SenderExtra } from '@/src/components/form/SenderSection'
import { ReceiverSection, emptyReceiverExtra, type ReceiverExtra } from '@/src/components/form/ReceiverSection'

const STEPS = ['Booking', 'Sender', 'Receiver', 'Items', 'Charges']

const BOOKING_TYPE_OPTIONS: { value: BookingType; label: string }[] = [
  { value: 'PAID',   label: 'Paid' },
  { value: 'TO_PAY', label: 'To Pay' },
  { value: 'TBB',    label: 'TBB' },
  { value: 'FOC',    label: 'FOC' },
]

const GST_OPTIONS: { value: GstPaidBy; label: string }[] = [
  { value: 'Exempt',   label: 'Exempt' },
  { value: 'Sender',   label: 'Sender' },
  { value: 'Receiver', label: 'Receiver' },
]

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

function ChargeRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <FormField
      label={label}
      value={value}
      onChangeText={onChange}
      placeholder="0"
      keyboardType="numeric"
    />
  )
}

export default function BookingCreateScreen() {
  const { mutate: createBooking, isPending } = useCreateBooking()
  const [step, setStep] = useState(0)

  // Step 0 — Booking info
  const [bookingType, setBookingType] = useState<BookingType>('PAID')
  const [toCity, setToCity]           = useState('')
  const [toCityId, setToCityId]       = useState<number | null>(null)

  // Step 1 — Sender
  const [senderName,   setSenderName]   = useState('')
  const [senderMobile, setSenderMobile] = useState('')
  const [senderGstin,  setSenderGstin]  = useState('')
  const [senderPartyId, setSenderPartyId] = useState<string | null>(null)
  const [senderExtra,  setSenderExtra]  = useState<SenderExtra>(emptySenderExtra())

  // Step 2 — Receiver
  const [receiverName,   setReceiverName]   = useState('')
  const [receiverMobile, setReceiverMobile] = useState('')
  const [receiverGstin,  setReceiverGstin]  = useState('')
  const [receiverPartyId, setReceiverPartyId] = useState<string | null>(null)
  const [receiverExtra, setReceiverExtra]   = useState<ReceiverExtra>(emptyReceiverExtra())

  // Step 3 — Items
  const [items, setItems] = useState<ItemDraft[]>([emptyItem()])

  // Step 4 — Charges
  const [freight,        setFreight]        = useState('')
  const [labourCharge,   setLabourCharge]   = useState('')
  const [deliveryCharge, setDeliveryCharge] = useState('')
  const [agentCharge,    setAgentCharge]    = useState('')
  const [taxiCharge,     setTaxiCharge]     = useState('')
  const [biltyCharge,    setBiltyCharge]    = useState('')
  const [cod,            setCod]            = useState('')
  const [gstPaidBy,      setGstPaidBy]      = useState<GstPaidBy>('Exempt')
  const [remarks,        setRemarks]        = useState('')

  const d = (v: string) => parseFloat(v || '0')

  const itemsTotal = items.reduce((sum, it) => {
    const rate = d(it.rate)
    if (['PKT', 'BOX', 'PCS'].includes(it.unit)) return sum + d(it.pkg_count) * rate
    return sum + d(it.charged_weight || it.actual_weight) * rate
  }, 0)
  const chargesTotal = d(freight) + d(labourCharge) + d(deliveryCharge) + d(agentCharge) + d(taxiCharge) + d(biltyCharge) + d(cod)
  const grandTotal   = itemsTotal + chargesTotal

  function validateStep(): string | null {
    if (step === 0 && !toCity)             return 'Please select a destination city.'
    if (step === 1 && !senderName.trim())  return 'Please enter sender name.'
    if (step === 2 && !receiverName.trim()) return 'Please enter receiver name.'
    return null
  }

  function goNext() {
    const err = validateStep()
    if (err) { Alert.alert('Required', err); return }
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else handleSubmit()
  }

  function handleSubmit() {
    if (!toCity)             return Alert.alert('Required', 'Please select a destination city.')
    if (!senderName.trim())  return Alert.alert('Required', 'Please enter sender name.')
    if (!receiverName.trim()) return Alert.alert('Required', 'Please enter receiver name.')

    const payload: Omit<BookingFormData, 'company_id' | 'branch_id'> = {
      booking_type: bookingType,
      to_city: toCity,
      to_location_master_id: toCityId,

      sender_party_id:  senderPartyId,
      sender_name:      senderName.trim(),
      sender_mobile:    senderMobile.trim() || undefined,
      sender_gstin:     senderGstin.trim()  || undefined,
      sender_address:   senderExtra.address.trim() || undefined,
      invoices:         senderExtra.invoices.filter(inv => inv.inv_no || inv.eway_bill),
      crossing_agent_lr:   senderExtra.crossing_agent_lr.trim()   || undefined,
      crossing_agent_name: senderExtra.crossing_agent_name.trim() || undefined,
      insurance: senderExtra.insurance.policy_no ? senderExtra.insurance : undefined,

      receiver_party_id: receiverPartyId,
      receiver_name:     receiverName.trim(),
      receiver_mobile:   receiverMobile.trim() || undefined,
      receiver_gstin:    receiverGstin.trim()  || undefined,
      receiver_address:  receiverExtra.address.trim() || undefined,

      items: items
        .filter(it => it.description.trim() || it.pkg_count || it.consignment_name)
        .map(it => ({
          pkg_count:       it.pkg_count    ? parseInt(it.pkg_count)  : undefined,
          consignment_id:  it.consignment_id  || undefined,
          description:     it.description.trim() || undefined,
          unit:            it.unit || 'PKT',
          actual_weight:   it.actual_weight  ? d(it.actual_weight)  : undefined,
          charged_weight:  it.charged_weight ? d(it.charged_weight) : undefined,
          rate:            it.rate           ? d(it.rate)           : undefined,
        })),

      freight:         d(freight),
      labour_charge:   d(labourCharge),
      delivery_charge: d(deliveryCharge),
      agent_charge:    d(agentCharge),
      taxi_charge:     d(taxiCharge),
      bilty_charge:    d(biltyCharge),
      cod:             d(cod),
      grand_total:     grandTotal,
      gst_paid_by:     gstPaidBy,
      remarks:         remarks.trim() || undefined,
    }

    createBooking(payload, {
      onSuccess: () => Alert.alert('Success', 'Booking created successfully.', [{ text: 'OK', onPress: () => router.back() }]),
      onError:   () => Alert.alert('Error', 'Failed to create booking. Please try again.'),
    })
  }

  const { bottom: bottomInset } = useSafeAreaInsets()
  const isLastStep = step === STEPS.length - 1

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>

        {/* Header */}
        <View style={{
          backgroundColor: colors.card,
          paddingTop: 12,
          paddingBottom: 0,
          paddingHorizontal: 16,
          borderBottomWidth: 1, borderBottomColor: colors.border,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 12 }}>
            <TouchableOpacity onPress={() => step > 0 ? setStep(s => s - 1) : router.back()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={{ fontSize: typography.size.xl, fontWeight: typography.weight.extrabold, color: colors.foreground, flex: 1 }}>
              New Booking
            </Text>
          </View>
          <StepIndicator steps={STEPS} current={step} onPress={i => setStep(i)} />
        </View>

        {/* Step content */}
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Step 0: Booking Info */}
          {step === 0 && (
            <SectionCard>
              <SectionTitle title="Booking Info" />
              <SegmentControl
                label="Booking Type"
                options={BOOKING_TYPE_OPTIONS}
                value={bookingType}
                onChange={setBookingType}
                required
              />
              <CityPicker
                value={toCity}
                onSelect={(name, id) => { setToCity(name); setToCityId(id) }}
                required
              />
            </SectionCard>
          )}

          {/* Step 1: Sender */}
          {step === 1 && (
            <SectionCard>
              <SectionTitle title="Sender Details" />
              <PartyCombobox
                label="Sender Name"
                value={senderName}
                onChange={setSenderName}
                onSelect={party => {
                  setSenderName(party.legal_name)
                  setSenderMobile(party.contacts?.[0]?.phone ?? '')
                  setSenderGstin(party.gst_number ?? '')
                  setSenderPartyId(party.id)
                }}
                required
              />
              <FormField
                label="Mobile"
                value={senderMobile}
                onChangeText={setSenderMobile}
                placeholder="10-digit mobile"
                keyboardType="phone-pad"
              />
              <FormField
                label="GSTIN"
                value={senderGstin}
                onChangeText={setSenderGstin}
                placeholder="GST number (optional)"
                autoCapitalize="characters"
              />
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 14 }} />
              <SenderSection value={senderExtra} onChange={setSenderExtra} />
            </SectionCard>
          )}

          {/* Step 2: Receiver */}
          {step === 2 && (
            <SectionCard>
              <SectionTitle title="Receiver Details" />
              <PartyCombobox
                label="Receiver Name"
                value={receiverName}
                onChange={setReceiverName}
                onSelect={party => {
                  setReceiverName(party.legal_name)
                  setReceiverMobile(party.contacts?.[0]?.phone ?? '')
                  setReceiverGstin(party.gst_number ?? '')
                  setReceiverPartyId(party.id)
                }}
                required
              />
              <FormField
                label="Mobile"
                value={receiverMobile}
                onChangeText={setReceiverMobile}
                placeholder="10-digit mobile"
                keyboardType="phone-pad"
              />
              <FormField
                label="GSTIN"
                value={receiverGstin}
                onChangeText={setReceiverGstin}
                placeholder="GST number (optional)"
                autoCapitalize="characters"
              />
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 14 }} />
              <ReceiverSection value={receiverExtra} onChange={setReceiverExtra} />
            </SectionCard>
          )}

          {/* Step 3: Items */}
          {step === 3 && (
            <SectionCard>
              <SectionTitle title="Items" />
              <ItemsEditor items={items} onChange={setItems} />
            </SectionCard>
          )}

          {/* Step 4: Charges + Summary */}
          {step === 4 && (
            <>
              <SectionCard>
                <SectionTitle title="Charges" />
                <ChargeRow label="Freight (₹)"         value={freight}        onChange={setFreight} />
                <ChargeRow label="Labour Charge (₹)"   value={labourCharge}   onChange={setLabourCharge} />
                <ChargeRow label="Delivery Charge (₹)" value={deliveryCharge} onChange={setDeliveryCharge} />
                <ChargeRow label="Agent Charge (₹)"    value={agentCharge}    onChange={setAgentCharge} />
                <ChargeRow label="Taxi Charge (₹)"     value={taxiCharge}     onChange={setTaxiCharge} />
                <ChargeRow label="Bilty Charge (₹)"    value={biltyCharge}    onChange={setBiltyCharge} />
                <ChargeRow label="COD (₹)"             value={cod}            onChange={setCod} />
                <SegmentControl
                  label="GST Paid By"
                  options={GST_OPTIONS}
                  value={gstPaidBy}
                  onChange={setGstPaidBy}
                />
              </SectionCard>

              <SectionCard>
                <SectionTitle title="Remarks" />
                <FormField
                  label="Remarks"
                  value={remarks}
                  onChangeText={setRemarks}
                  placeholder="Optional notes..."
                  multiline
                />
              </SectionCard>

              <SectionCard>
                <SectionTitle title="Summary" />
                {[
                  ['Items Total',   itemsTotal],
                  ['Charges Total', chargesTotal],
                ].map(([label, amt]) => (
                  <View key={label as string} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
                    <Text style={{ color: colors.mutedFg, fontSize: typography.size.sm }}>{label}</Text>
                    <Text style={{ color: colors.foreground, fontSize: typography.size.sm, fontWeight: typography.weight.medium }}>
                      ₹{(amt as number).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                ))}
                <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.foreground }}>Grand Total</Text>
                  <Text style={{ fontSize: typography.size.md, fontWeight: typography.weight.extrabold, color: colors.primary }}>
                    ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </SectionCard>
            </>
          )}

        </ScrollView>

        {/* Footer nav */}
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: colors.card,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: bottomInset + 12,
          borderTopWidth: 1, borderTopColor: colors.border,
          flexDirection: 'row', gap: 10,
        }}>
          {step > 0 && (
            <TouchableOpacity
              onPress={() => setStep(s => s - 1)}
              style={{
                flex: 1, paddingVertical: 13, borderRadius: radius.xl,
                backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: typography.weight.semibold, color: colors.mutedFg, fontSize: typography.size.base }}>
                Back
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={goNext}
            disabled={isPending}
            style={{
              flex: 2, paddingVertical: 13, borderRadius: radius.xl,
              backgroundColor: colors.primary,
              alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
              ...shadow.colored(colors.primary),
            }}
          >
            {isPending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name={isLastStep ? 'checkmark-circle' : 'arrow-forward'} size={18} color="#fff" />
            }
            <Text style={{ color: '#fff', fontWeight: typography.weight.bold, fontSize: typography.size.base }}>
              {isLastStep ? 'Create Booking' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  )
}

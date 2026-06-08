import { useState, useEffect } from 'react'
import {
  ScrollView, View, Text, TouchableOpacity,
  Alert, KeyboardAvoidingView,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useCreateBooking } from '@hooks/useBookings'
import { useCreditInfo } from '@hooks/useCreditInfo'
import { useAppSelector } from '@/src/store/hooks'
import type { BookingType, BookingFormData } from '@/src/types/booking'
import type { PartyAddress } from '@/src/services/partyService'
import { colors, radius, typography } from '@/src/theme'
import { BookingFooterBar } from '@/src/components/form/BookingFooterBar'
import { StepIndicator } from '@/src/components/form/StepIndicator'
import { SegmentControl } from '@/src/components/form/SegmentControl'
import { CityPicker } from '@/src/components/form/CityPicker'
import { PartyCombobox } from '@/src/components/form/PartyCombobox'
import { FormField } from '@/src/components/form/FormField'
import { GstinField } from '@/src/components/form/GstinField'
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
    <FormField label={label} value={value} onChangeText={onChange} placeholder="0" keyboardType="numeric" />
  )
}

export default function BookingCreateScreen() {
  const { mutate: createBooking, isPending } = useCreateBooking()
  const activeBranch = useAppSelector(s => s.workspace.activeBranch)
  const { data: creditInfo } = useCreditInfo(activeBranch?.id)

  const [step, setStep] = useState(0)
  const [stepError, setStepError] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => { setStepError(null) }, [step])

  // Step 0 — Booking info
  const [bookingType,   setBookingType]   = useState<BookingType>('PAID')
  const [toCity,        setToCity]        = useState('')
  const [toCityId,      setToCityId]      = useState<number | null>(null)
  const [ewayBillNo,    setEwayBillNo]    = useState('')
  const [billPartyId,   setBillPartyId]   = useState<string | null>(null)
  const [billPartyName, setBillPartyName] = useState('')

  // Step 1 — Sender
  const [senderName,           setSenderName]           = useState('')
  const [senderMobile,         setSenderMobile]         = useState('')
  const [senderGstin,          setSenderGstin]          = useState('')
  const [senderPartyId,        setSenderPartyId]        = useState<string | null>(null)
  const [senderExtra,          setSenderExtra]          = useState<SenderExtra>(emptySenderExtra())
  const [senderSavedAddresses, setSenderSavedAddresses] = useState<PartyAddress[]>([])

  // Step 2 — Receiver
  const [receiverName,           setReceiverName]           = useState('')
  const [receiverMobile,         setReceiverMobile]         = useState('')
  const [receiverGstin,          setReceiverGstin]          = useState('')
  const [receiverPartyId,        setReceiverPartyId]        = useState<string | null>(null)
  const [receiverExtra,          setReceiverExtra]          = useState<ReceiverExtra>(emptyReceiverExtra())
  const [receiverSavedAddresses, setReceiverSavedAddresses] = useState<PartyAddress[]>([])

  // Step 3 — Items
  const [items, setItems] = useState<ItemDraft[]>([emptyItem()])

  // Step 4 — Charges
  const [freight,        setFreight]        = useState('')
  const [labourCharge,   setLabourCharge]   = useState('')
  const [deliveryCharge, setDeliveryCharge] = useState('')
  const [agentCharge,    setAgentCharge]    = useState('')
  const [taxiCharge,     setTaxiCharge]     = useState('')
  const [biltyCharge,    setBiltyCharge]    = useState('')

  // Persistent bottom bar state
  const [gstPaidBy, setGstPaidBy] = useState('Exempt')
  const [remarks,   setRemarks]   = useState('')
  const [payMode,   setPayMode]   = useState('Cash')

  const d = (v: string) => parseFloat(v || '0')

  const itemsTotal = items.reduce((sum, it) => {
    const rate = d(it.rate)
    if (['PKT', 'BOX', 'PCS'].includes(it.unit)) return sum + d(it.pkg_count) * rate
    return sum + d(it.charged_weight || it.actual_weight) * rate
  }, 0)
  const chargesTotal = d(freight) + d(labourCharge) + d(deliveryCharge) + d(agentCharge) + d(taxiCharge) + d(biltyCharge) + d(senderExtra.cod)
  const grandTotal   = itemsTotal + chargesTotal

  function handleBookingTypeChange(t: BookingType) {
    setBookingType(t)
    if (t === 'TBB' || t === 'FOC') setGstPaidBy('Exempt')
    if (t !== 'TBB') { setBillPartyId(null); setBillPartyName('') }
  }

  function toggleGst(val: string) {
    const isLocked = bookingType === 'TBB' || bookingType === 'FOC'
    if (isLocked) return
    setGstPaidBy(prev => prev === val ? '' : val)
  }

  function validateStep(): string | null {
    if (step === 0 && !toCity)                                    return 'Please select a destination city.'
    if (step === 0 && bookingType === 'TBB' && !billPartyId)      return 'Bill Party is required for TBB booking.'
    if (step === 1 && !senderName.trim())                         return 'Sender name is required.'
    if (step === 2 && !receiverName.trim())                       return 'Receiver name is required.'
    return null
  }

  function goNext() {
    const err = validateStep()
    if (err) { setStepError(err); return }
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else handleSubmit()
  }

  function handleSubmit() {
    if (!toCity)              { setStepError('Please select a destination city.'); setStep(0); return }
    if (!senderName.trim())   { setStepError('Sender name is required.'); setStep(1); return }
    if (!receiverName.trim()) { setStepError('Receiver name is required.'); setStep(2); return }
    if (!gstPaidBy)           { setStepError('GST Paid By is required.'); return }
    if (gstPaidBy === 'Sender'   && !senderGstin.trim())   { setStepError('Sender GSTIN is required when GST is paid by Sender.'); setStep(1); return }
    if (gstPaidBy === 'Receiver' && !receiverGstin.trim()) { setStepError('Receiver GSTIN is required when GST is paid by Receiver.'); setStep(2); return }

    const payload: Omit<BookingFormData, 'company_id' | 'branch_id'> = {
      booking_type:          bookingType,
      to_city:               toCity,
      to_location_master_id: toCityId,
      eway_bill_no:          ewayBillNo.trim() || undefined,
      pay_mode:              bookingType === 'PAID' ? payMode : null,
      bill_party_id:         bookingType === 'TBB' ? billPartyId : null,

      sender_party_id:   senderPartyId,
      sender_name:       senderName.trim(),
      sender_mobile:     senderMobile.trim()  || undefined,
      sender_gstin:      senderGstin.trim()   || undefined,
      sender_address:    senderExtra.address.trim() || undefined,
      invoices:          senderExtra.invoices.filter(inv => inv.inv_no || inv.eway_bill),
      crossing_agent_lr: senderExtra.crossing_agent_lr.trim() || undefined,
      crossing_agent_id: senderExtra.crossing_agent_id || undefined,
      insurance:         senderExtra.insurance.policy_no ? senderExtra.insurance : undefined,

      receiver_party_id:    receiverPartyId,
      receiver_name:        receiverName.trim(),
      receiver_mobile:      receiverMobile.trim() || undefined,
      receiver_gstin:       receiverGstin.trim()  || undefined,
      receiver_address:     receiverExtra.address.trim() || undefined,
      receiver_address_type: receiverExtra.address_type || undefined,

      items: items
        .filter(it => it.description.trim() || it.pkg_count || it.consignment_name)
        .map(it => ({
          pkg_count:      it.pkg_count      ? parseInt(it.pkg_count)  : undefined,
          consignment_id: it.consignment_id || undefined,
          description:    it.description.trim() || undefined,
          unit:           it.unit || 'PKT',
          actual_weight:  it.actual_weight  ? d(it.actual_weight)  : undefined,
          charged_weight: it.charged_weight ? d(it.charged_weight) : undefined,
          rate:           it.rate           ? d(it.rate)           : undefined,
        })),

      freight:         d(freight),
      labour_charge:   d(labourCharge),
      delivery_charge: d(deliveryCharge),
      agent_charge:    d(agentCharge),
      taxi_charge:     d(taxiCharge),
      bilty_charge:    d(biltyCharge),
      cod:             d(senderExtra.cod),
      grand_total:     grandTotal,
      gst_paid_by:     gstPaidBy || undefined,
      remarks:         remarks.trim() || undefined,
    }

    createBooking(payload, {
      onSuccess: () => Alert.alert('Success', 'Booking created successfully.', [{ text: 'OK', onPress: () => router.back() }]),
      onError:   () => setStepError('Failed to create booking. Please try again.'),
    })
  }

  const isLastStep = step === STEPS.length - 1

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <View style={{ flex: 1, backgroundColor: colors.background }}>

        {/* Header */}
        <View style={{
          backgroundColor: colors.card,
          paddingTop: 12, paddingBottom: 0, paddingHorizontal: 16,
          borderBottomWidth: 1, borderBottomColor: colors.border,
        }}>
          {/* Row 1: back + title */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <TouchableOpacity onPress={() => step > 0 ? setStep(s => s - 1) : router.back()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={{ fontSize: typography.size.xl, fontWeight: typography.weight.extrabold, color: colors.foreground, flex: 1 }}>
              New Booking
            </Text>
          </View>

          {/* Row 2: branch · date · time · credit */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {activeBranch && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryMuted, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Ionicons name="business-outline" size={11} color={colors.primary} />
                <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: colors.primary }}>
                  {activeBranch.branch_name}
                </Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.muted, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Ionicons name="calendar-outline" size={11} color={colors.mutedFg} />
              <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.medium, color: colors.mutedFg }}>
                {now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.muted, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Ionicons name="time-outline" size={11} color={colors.mutedFg} />
              <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.medium, color: colors.mutedFg }}>
                {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Text>
            </View>
            {creditInfo && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: (creditInfo.credit_remaining ?? Infinity) === 0 ? '#fee2e2' : '#d1fae5', borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Ionicons name="wallet-outline" size={11} color={(creditInfo.credit_remaining ?? Infinity) === 0 ? colors.destructive : colors.success} />
                <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: (creditInfo.credit_remaining ?? Infinity) === 0 ? colors.destructive : colors.success }}>
                  {creditInfo.credit_remaining == null ? 'Unlimited' : `₹${creditInfo.credit_remaining.toLocaleString('en-IN')}`}
                  {creditInfo.credit_limit != null ? ` / ₹${creditInfo.credit_limit.toLocaleString('en-IN')}` : ''}
                </Text>
              </View>
            )}
          </View>

          <StepIndicator steps={STEPS} current={step} onPress={i => setStep(i)} />
        </View>

        {/* Step content */}
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          style={{ flex: 1 }}
        >

          {/* Inline error banner */}
          {stepError && (
            <View style={{
              backgroundColor: '#fee2e2', borderRadius: radius.lg,
              padding: 12, marginBottom: 12,
              flexDirection: 'row', alignItems: 'center', gap: 8,
              borderWidth: 1, borderColor: '#fca5a5',
            }}>
              <Ionicons name="alert-circle" size={16} color={colors.destructive} />
              <Text style={{ color: colors.destructive, fontSize: typography.size.sm, flex: 1, fontWeight: typography.weight.medium }}>
                {stepError}
              </Text>
            </View>
          )}

          {/* Step 0: Booking Info */}
          {step === 0 && (
            <SectionCard>
              <SectionTitle title="Booking Info" />
              <SegmentControl
                label="Booking Type"
                options={BOOKING_TYPE_OPTIONS}
                value={bookingType}
                onChange={handleBookingTypeChange}
                required
                colorMap={{
                  PAID:   { bg: colors.bookingType.PAID.bg,   border: colors.bookingType.PAID.border,   text: colors.bookingType.PAID.text },
                  TO_PAY: { bg: colors.bookingType.TO_PAY.bg, border: colors.bookingType.TO_PAY.border, text: colors.bookingType.TO_PAY.text },
                  TBB:    { bg: colors.bookingType.TBB.bg,    border: colors.bookingType.TBB.border,    text: colors.bookingType.TBB.text },
                  FOC:    { bg: colors.bookingType.FOC.bg,    border: colors.bookingType.FOC.border,    text: colors.bookingType.FOC.text },
                }}
              />
              <CityPicker
                value={toCity}
                onSelect={(name, id) => { setToCity(name); setToCityId(id) }}
                required
              />
              {bookingType === 'TBB' && (
                <PartyCombobox
                  label="Bill Party"
                  value={billPartyName}
                  onChange={setBillPartyName}
                  onSelect={party => { setBillPartyName(party.legal_name); setBillPartyId(party.id) }}
                  required
                />
              )}
              <FormField
                label="E-Way Bill No."
                value={ewayBillNo}
                onChangeText={setEwayBillNo}
                placeholder="12-digit EWB number"
                keyboardType="numeric"
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
                  setSenderSavedAddresses(party.partyAddresses ?? [])
                  setSenderExtra(prev => ({ ...prev, address: '' }))
                }}
                required
              />
              <FormField label="Mobile" value={senderMobile} onChangeText={setSenderMobile} placeholder="10-digit mobile" keyboardType="phone-pad" />
              <GstinField value={senderGstin} onChangeText={setSenderGstin} />
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 14 }} />
              <SenderSection value={senderExtra} onChange={setSenderExtra} savedAddresses={senderSavedAddresses} />
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
                  setReceiverSavedAddresses(party.partyAddresses ?? [])
                  setReceiverExtra(prev => ({ ...prev, address: '' }))
                }}
                required
              />
              <FormField label="Mobile" value={receiverMobile} onChangeText={setReceiverMobile} placeholder="10-digit mobile" keyboardType="phone-pad" />
              <GstinField value={receiverGstin} onChangeText={setReceiverGstin} />
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 14 }} />
              <ReceiverSection value={receiverExtra} onChange={setReceiverExtra} savedAddresses={receiverSavedAddresses} />
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
              </SectionCard>

              <SectionCard>
                <SectionTitle title="Summary" />
                {([['Items Total', itemsTotal], ['Charges Total', chargesTotal]] as const).map(([label, amt]) => (
                  <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
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

        <BookingFooterBar
          bookingType={bookingType}
          grandTotal={grandTotal}
          gstPaidBy={gstPaidBy}
          onGstToggle={toggleGst}
          remarks={remarks}
          onRemarksChange={setRemarks}
          payMode={payMode}
          onPayModeChange={setPayMode}
          isLastStep={isLastStep}
          showBack={step > 0}
          isPending={isPending}
          onBack={() => setStep(s => s - 1)}
          onContinue={goNext}
        />

      </View>
    </KeyboardAvoidingView>
  )
}

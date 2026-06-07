import { useState, useMemo, useRef } from 'react'
import {
  ScrollView, View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal, Pressable,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useCreateBooking } from '@hooks/useBookings'
import { useCities } from '@hooks/useCities'
import type { BookingType, BookingFormData, GstPaidBy } from '@/src/types/booking'

const BOOKING_TYPES: BookingType[] = ['PAID', 'TO_PAY', 'TBB', 'FOC']
const GST_PAID_BY: GstPaidBy[] = ['SENDER', 'RECEIVER', 'AGENT']

interface ItemDraft {
  pkg_count: string
  description: string
  unit: string
  actual_weight: string
  charged_weight: string
  rate: string
}

const emptyItem = (): ItemDraft => ({
  pkg_count: '', description: '', unit: 'PKT', actual_weight: '', charged_weight: '', rate: '',
})

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={{ fontSize: 12, fontWeight: '700', color: '#71717a', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 4 }}>
      {title}
    </Text>
  )
}

function Field({
  label, value, onChangeText, placeholder, keyboardType, multiline,
}: {
  label: string
  value: string
  onChangeText: (v: string) => void
  placeholder?: string
  keyboardType?: 'default' | 'numeric' | 'phone-pad'
  multiline?: boolean
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 12, fontWeight: '500', color: '#52525b', marginBottom: 4 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor="#a1a1aa"
        keyboardType={keyboardType ?? 'default'}
        multiline={multiline}
        style={{
          backgroundColor: 'white', borderRadius: 10, paddingHorizontal: 12,
          paddingVertical: multiline ? 10 : 11, fontSize: 14, color: '#09090b',
          borderWidth: 1, borderColor: '#e4e4e7',
          minHeight: multiline ? 72 : undefined, textAlignVertical: multiline ? 'top' : undefined,
        }}
      />
    </View>
  )
}

function SegmentControl<T extends string>({
  label, options, value, onChange,
}: { label: string; options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 12, fontWeight: '500', color: '#52525b', marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            style={{
              paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
              backgroundColor: value === opt ? '#2563eb' : 'white',
              borderWidth: 1, borderColor: value === opt ? '#2563eb' : '#e4e4e7',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: value === opt ? 'white' : '#52525b' }}>
              {opt.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

function CityPicker({
  value, onSelect,
}: {
  value: string
  onSelect: (name: string, id: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { data: cities = [], isLoading } = useCities()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return cities.slice(0, 50)
    return cities.filter(c => c.location.toLowerCase().includes(q)).slice(0, 50)
  }, [cities, search])

  function handleSelect(name: string, id: number) {
    onSelect(name, id)
    setOpen(false)
    setSearch('')
  }

  return (
    <View style={{ marginBottom: 12, zIndex: 100 }}>
      <Text style={{ fontSize: 12, fontWeight: '500', color: '#52525b', marginBottom: 4 }}>To City</Text>

      <View style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'white', borderRadius: 10, paddingHorizontal: 12,
        borderWidth: 1, borderColor: open ? '#2563eb' : '#e4e4e7',
      }}>
        <Ionicons name="location-outline" size={15} color="#a1a1aa" style={{ marginRight: 6 }} />
        <TextInput
          value={open ? search : value}
          onChangeText={v => { setSearch(v); if (!open) setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => { setOpen(false); setSearch('') }, 150)}
          placeholder="Search destination city..."
          placeholderTextColor="#a1a1aa"
          style={{ flex: 1, paddingVertical: 11, fontSize: 14, color: '#09090b' }}
        />
        {open && search.length > 0
          ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="#a1a1aa" />
            </TouchableOpacity>
          ) : (
            <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={15} color="#a1a1aa" />
          )
        }
      </View>

      {open && (
        <View style={{
          position: 'absolute', top: 64, left: 0, right: 0,
          backgroundColor: 'white', borderRadius: 10,
          borderWidth: 1, borderColor: '#e4e4e7',
          maxHeight: 220, zIndex: 200, elevation: 10,
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
        }}>
          {isLoading ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#2563eb" />
            </View>
          ) : filtered.length === 0 ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <Text style={{ color: '#a1a1aa', fontSize: 13 }}>No cities found</Text>
            </View>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {filtered.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleSelect(item.location, item.id)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 11,
                    borderBottomWidth: index < filtered.length - 1 ? 1 : 0,
                    borderBottomColor: '#f4f4f5',
                    backgroundColor: item.location === value ? '#eff6ff' : 'white',
                    flexDirection: 'row', alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 14, color: '#09090b', flex: 1, fontWeight: item.location === value ? '700' : '400' }}>
                    {item.location}
                  </Text>
                  {item.location === value && <Ionicons name="checkmark" size={16} color="#2563eb" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  )
}

function ItemRow({
  index, item, onChange, onRemove, canRemove,
}: {
  index: number
  item: ItemDraft
  onChange: (i: number, field: keyof ItemDraft, v: string) => void
  onRemove: (i: number) => void
  canRemove: boolean
}) {
  const total = (parseFloat(item.actual_weight || '0') * parseFloat(item.rate || '0')).toFixed(2)
  return (
    <View style={{ backgroundColor: '#f9f9f9', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e4e4e7' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#09090b' }}>Item {index + 1}</Text>
        {canRemove && (
          <TouchableOpacity onPress={() => onRemove(index)}>
            <Ionicons name="trash-outline" size={16} color="#dc2626" />
          </TouchableOpacity>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: '#71717a', marginBottom: 3 }}>Pkg Count</Text>
          <TextInput value={item.pkg_count} onChangeText={v => onChange(index, 'pkg_count', v)} placeholder="0"
            placeholderTextColor="#a1a1aa" keyboardType="numeric"
            style={{ backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: '#09090b', borderWidth: 1, borderColor: '#e4e4e7' }} />
        </View>
        <View style={{ flex: 2 }}>
          <Text style={{ fontSize: 11, color: '#71717a', marginBottom: 3 }}>Description</Text>
          <TextInput value={item.description} onChangeText={v => onChange(index, 'description', v)} placeholder="Goods description"
            placeholderTextColor="#a1a1aa"
            style={{ backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: '#09090b', borderWidth: 1, borderColor: '#e4e4e7' }} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: '#71717a', marginBottom: 3 }}>Unit</Text>
          <TextInput value={item.unit} onChangeText={v => onChange(index, 'unit', v)} placeholder="PKT"
            placeholderTextColor="#a1a1aa"
            style={{ backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: '#09090b', borderWidth: 1, borderColor: '#e4e4e7' }} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: '#71717a', marginBottom: 3 }}>Act. Weight</Text>
          <TextInput value={item.actual_weight} onChangeText={v => onChange(index, 'actual_weight', v)} placeholder="0"
            placeholderTextColor="#a1a1aa" keyboardType="numeric"
            style={{ backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: '#09090b', borderWidth: 1, borderColor: '#e4e4e7' }} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: '#71717a', marginBottom: 3 }}>Ch. Weight</Text>
          <TextInput value={item.charged_weight} onChangeText={v => onChange(index, 'charged_weight', v)} placeholder="0"
            placeholderTextColor="#a1a1aa" keyboardType="numeric"
            style={{ backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: '#09090b', borderWidth: 1, borderColor: '#e4e4e7' }} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: '#71717a', marginBottom: 3 }}>Rate</Text>
          <TextInput value={item.rate} onChangeText={v => onChange(index, 'rate', v)} placeholder="0"
            placeholderTextColor="#a1a1aa" keyboardType="numeric"
            style={{ backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: '#09090b', borderWidth: 1, borderColor: '#e4e4e7' }} />
        </View>
      </View>
      <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '600', marginTop: 8, textAlign: 'right' }}>
        Total: ₹{parseFloat(total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </Text>
    </View>
  )
}

export default function BookingCreateScreen() {
  const { mutate: createBooking, isPending } = useCreateBooking()

  const [bookingType, setBookingType] = useState<BookingType>('PAID')
  const [toCity, setToCity] = useState('')
  const [toCityId, setToCityId] = useState<number | null>(null)
  const [senderName, setSenderName] = useState('')
  const [senderMobile, setSenderMobile] = useState('')
  const [senderAddress, setSenderAddress] = useState('')
  const [receiverName, setReceiverName] = useState('')
  const [receiverMobile, setReceiverMobile] = useState('')
  const [receiverAddress, setReceiverAddress] = useState('')
  const [items, setItems] = useState<ItemDraft[]>([emptyItem()])
  const [freight, setFreight] = useState('')
  const [labourCharge, setLabourCharge] = useState('')
  const [deliveryCharge, setDeliveryCharge] = useState('')
  const [agentCharge, setAgentCharge] = useState('')
  const [taxiCharge, setTaxiCharge] = useState('')
  const [biltyCharge, setBiltyCharge] = useState('')
  const [cod, setCod] = useState('')
  const [gstPaidBy, setGstPaidBy] = useState<GstPaidBy>('SENDER')
  const [remarks, setRemarks] = useState('')

  const d = (v: string) => parseFloat(v || '0')
  const itemsTotal = items.reduce((sum, it) => sum + d(it.actual_weight) * d(it.rate), 0)
  const chargesTotal = d(freight) + d(labourCharge) + d(deliveryCharge) + d(agentCharge) + d(taxiCharge) + d(biltyCharge) + d(cod)
  const grandTotal = itemsTotal + chargesTotal

  function updateItem(i: number, field: keyof ItemDraft, v: string) {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: v } : item))
  }

  function handleSubmit() {
    if (!toCity) return Alert.alert('Validation', 'Please select a destination city.')
    if (!senderName.trim()) return Alert.alert('Validation', 'Please enter sender name.')
    if (!receiverName.trim()) return Alert.alert('Validation', 'Please enter receiver name.')

    const payload: Omit<BookingFormData, 'company_id' | 'branch_id'> = {
      booking_type: bookingType,
      to_city: toCity,
      to_location_master_id: toCityId,
      sender_name: senderName.trim(),
      sender_mobile: senderMobile.trim() || undefined,
      sender_address: senderAddress.trim() || undefined,
      receiver_name: receiverName.trim(),
      receiver_mobile: receiverMobile.trim() || undefined,
      receiver_address: receiverAddress.trim() || undefined,
      items: items
        .filter(it => it.description.trim() || it.pkg_count)
        .map(it => ({
          pkg_count: it.pkg_count ? parseInt(it.pkg_count) : undefined,
          description: it.description.trim() || undefined,
          unit: it.unit || 'PKT',
          actual_weight: it.actual_weight ? d(it.actual_weight) : undefined,
          charged_weight: it.charged_weight ? d(it.charged_weight) : undefined,
          rate: it.rate ? d(it.rate) : undefined,
          total: d(it.actual_weight) * d(it.rate) || undefined,
        })),
      freight: d(freight),
      labour_charge: d(labourCharge),
      delivery_charge: d(deliveryCharge),
      agent_charge: d(agentCharge),
      taxi_charge: d(taxiCharge),
      bilty_charge: d(biltyCharge),
      cod: d(cod),
      grand_total: grandTotal,
      gst_paid_by: gstPaidBy,
      remarks: remarks.trim() || undefined,
    }

    createBooking(payload, {
      onSuccess: () => {
        Alert.alert('Success', 'Booking created successfully.', [{ text: 'OK', onPress: () => router.back() }])
      },
      onError: () => {
        Alert.alert('Error', 'Failed to create booking. Please try again.')
      },
    })
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, backgroundColor: '#f4f4f5' }}>
        <View style={{ backgroundColor: 'white', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f4f4f5' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={22} color="#09090b" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#09090b', flex: 1 }}>New Booking</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending}
            style={{ backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            {isPending
              ? <ActivityIndicator size="small" color="white" />
              : <Ionicons name="checkmark" size={16} color="white" />
            }
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title="Booking Info" />
            <SegmentControl label="Type" options={BOOKING_TYPES} value={bookingType} onChange={setBookingType} />
            <CityPicker
              value={toCity}
              onSelect={(name, id) => { setToCity(name); setToCityId(id) }}
            />
          </View>

          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title="Sender" />
            <Field label="Name" value={senderName} onChangeText={setSenderName} />
            <Field label="Mobile" value={senderMobile} onChangeText={setSenderMobile} keyboardType="phone-pad" />
            <Field label="Address" value={senderAddress} onChangeText={setSenderAddress} multiline />
          </View>

          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title="Receiver" />
            <Field label="Name" value={receiverName} onChangeText={setReceiverName} />
            <Field label="Mobile" value={receiverMobile} onChangeText={setReceiverMobile} keyboardType="phone-pad" />
            <Field label="Address" value={receiverAddress} onChangeText={setReceiverAddress} multiline />
          </View>

          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title="Items" />
            {items.map((item, i) => (
              <ItemRow key={i} index={i} item={item} onChange={updateItem} onRemove={idx => setItems(prev => prev.filter((_, j) => j !== idx))} canRemove={items.length > 1} />
            ))}
            <TouchableOpacity onPress={() => setItems(prev => [...prev, emptyItem()])} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 }}>
              <Ionicons name="add-circle-outline" size={18} color="#2563eb" />
              <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 13 }}>Add Item</Text>
            </TouchableOpacity>
          </View>

          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title="Charges" />
            <Field label="Freight (₹)" value={freight} onChangeText={setFreight} keyboardType="numeric" />
            <Field label="Labour Charge (₹)" value={labourCharge} onChangeText={setLabourCharge} keyboardType="numeric" />
            <Field label="Delivery Charge (₹)" value={deliveryCharge} onChangeText={setDeliveryCharge} keyboardType="numeric" />
            <Field label="Agent Charge (₹)" value={agentCharge} onChangeText={setAgentCharge} keyboardType="numeric" />
            <Field label="Taxi Charge (₹)" value={taxiCharge} onChangeText={setTaxiCharge} keyboardType="numeric" />
            <Field label="Bilty Charge (₹)" value={biltyCharge} onChangeText={setBiltyCharge} keyboardType="numeric" />
            <Field label="COD (₹)" value={cod} onChangeText={setCod} keyboardType="numeric" />
            <SegmentControl label="GST Paid By" options={GST_PAID_BY} value={gstPaidBy} onChange={setGstPaidBy} />
          </View>

          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title="Summary" />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
              <Text style={{ color: '#71717a', fontSize: 13 }}>Items Total</Text>
              <Text style={{ color: '#09090b', fontSize: 13, fontWeight: '500' }}>₹{itemsTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
              <Text style={{ color: '#71717a', fontSize: 13 }}>Charges Total</Text>
              <Text style={{ color: '#09090b', fontSize: 13, fontWeight: '500' }}>₹{chargesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
            </View>
            <View style={{ height: 1, backgroundColor: '#e4e4e7', marginVertical: 8 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#09090b' }}>Grand Total</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#2563eb' }}>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
            </View>
          </View>

          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <SectionHeader title="Remarks" />
            <Field label="Remarks" value={remarks} onChangeText={setRemarks} multiline placeholder="Optional notes..." />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  )
}

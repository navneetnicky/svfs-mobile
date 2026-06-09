import { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Modal, ActivityIndicator, Dimensions, StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius, typography } from '@/src/theme'

const SCREEN_HEIGHT = Dimensions.get('window').height
const DROP_MAX_HEIGHT = 220

type DropPos = { top: number; left: number; width: number }

type Props<T> = {
  label: string
  value: string
  required?: boolean
  icon?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  items: T[]
  keyExtractor: (item: T) => string
  renderItem: (item: T) => React.ReactElement
  onSelect: (item: T) => void
  onQueryChange: (q: string) => void
  onClose?: (query: string) => void
  loading?: boolean
}

export function Autocomplete<T>({
  label, value, required, icon, placeholder, searchPlaceholder, emptyText,
  items, keyExtractor, renderItem, onSelect, onQueryChange, onClose, loading,
}: Props<T>) {
  const [visible, setVisible] = useState(false)
  const [query, setQuery] = useState('')
  const [pos, setPos] = useState<DropPos>({ top: 0, left: 0, width: 300 })
  const triggerRef = useRef<View>(null)

  function open() {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const spaceBelow = SCREEN_HEIGHT - (y + height)
      const top = spaceBelow >= DROP_MAX_HEIGHT + 8
        ? y + height + 4
        : y - DROP_MAX_HEIGHT - 4
      setPos({ top, left: x, width })
      setQuery(value)
      onQueryChange(value)
      setVisible(true)
    })
  }

  function close() {
    onClose?.(query)
    setVisible(false)
  }

  function handleQueryChange(q: string) {
    setQuery(q)
    onQueryChange(q)
  }

  function handleSelect(item: T) {
    onSelect(item)
    setVisible(false)
  }

  return (
    <>
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
          <Text style={{ fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: colors.mutedFg }}>
            {label}
          </Text>
          {required && <Text style={{ color: colors.destructive, marginLeft: 2 }}>*</Text>}
        </View>
        <TouchableOpacity
          ref={triggerRef}
          onPress={open}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: colors.card, borderRadius: radius.lg,
            paddingHorizontal: 12, paddingVertical: 11,
            borderWidth: 1, borderColor: visible ? colors.primary : colors.border,
          }}
        >
          {icon && (
            <Ionicons name={icon as any} size={15} color={colors.subtleFg} style={{ marginRight: 6 }} />
          )}
          <Text style={{
            flex: 1, fontSize: typography.size.base,
            color: value ? colors.foreground : colors.subtleFg,
          }}>
            {value || placeholder || `Select ${label.toLowerCase()}...`}
          </Text>
          <Ionicons name={visible ? 'chevron-up' : 'chevron-down'} size={15} color={colors.subtleFg} />
        </TouchableOpacity>
      </View>

      <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
        {/* backdrop */}
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={close} />

        {/* dropdown */}
        <View style={{
          position: 'absolute',
          top: pos.top, left: pos.left, width: pos.width,
          maxHeight: DROP_MAX_HEIGHT,
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          borderWidth: 1, borderColor: colors.border,
          overflow: 'hidden',
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        }}>
          {/* search row */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            paddingHorizontal: 12,
            borderBottomWidth: 1, borderBottomColor: colors.border,
            backgroundColor: colors.card,
          }}>
            <Ionicons name="search-outline" size={14} color={colors.subtleFg} style={{ marginRight: 6 }} />
            <TextInput
              value={query}
              onChangeText={handleQueryChange}
              placeholder={searchPlaceholder || `Search ${label.toLowerCase()}...`}
              placeholderTextColor={colors.subtleFg}
              style={{
                flex: 1, paddingVertical: 10,
                fontSize: typography.size.base, color: colors.foreground,
              }}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => handleQueryChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color={colors.subtleFg} />
              </TouchableOpacity>
            )}
          </View>

          {/* results */}
          {loading ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : items.length === 0 ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <Text style={{ color: colors.subtleFg, fontSize: typography.size.sm }}>
                {emptyText ?? 'No results found'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={keyExtractor}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelect(item)} activeOpacity={0.7}>
                  {renderItem(item)}
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      </Modal>
    </>
  )
}

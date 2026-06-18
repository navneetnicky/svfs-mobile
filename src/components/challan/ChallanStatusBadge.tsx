import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ChallanStatus } from '@/src/types/challan'
import { typography } from '@/src/theme'

type Props = { status: ChallanStatus }

const CONFIG = {
  dispatched: { label: 'Dispatched', icon: 'truck-outline' as const, bg: '#e0f2fe', text: '#075985', icon_color: '#075985' },
  received:   { label: 'Received',   icon: 'checkmark-circle-outline' as const, bg: '#d1fae5', text: '#065f46', icon_color: '#10b981' },
}

export function ChallanStatusBadge({ status }: Props) {
  const cfg = CONFIG[status] ?? CONFIG.dispatched
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: cfg.bg, borderRadius: 999,
      paddingHorizontal: 8, paddingVertical: 3,
      alignSelf: 'flex-start',
    }}>
      <Ionicons name={cfg.icon} size={11} color={cfg.icon_color} />
      <Text style={{ fontSize: typography.size.xs, fontWeight: typography.weight.semibold, color: cfg.text }}>
        {cfg.label}
      </Text>
    </View>
  )
}

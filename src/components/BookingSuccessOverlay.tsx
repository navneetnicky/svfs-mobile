import { useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withDelay, withTiming, withSequence,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'

const SW = Dimensions.get('window').width

// Confetti particles (pre-computed positions so they don't shift on re-render)
const CONF = [
  { id: 0,  tx: -75,  ty: -100, w: 9,  h: 4, color: '#075985', rot: 32,  delay: 460 },
  { id: 1,  tx: 55,   ty: -118, w: 6,  h: 3, color: '#34d399', rot: -22, delay: 480 },
  { id: 2,  tx: 108,  ty: -50,  w: 11, h: 4, color: '#0ea5e9', rot: 50,  delay: 450 },
  { id: 3,  tx: 94,   ty: 44,   w: 7,  h: 3, color: '#075985', rot: -40, delay: 500 },
  { id: 4,  tx: 40,   ty: 108,  w: 9,  h: 4, color: '#34d399', rot: 64,  delay: 470 },
  { id: 5,  tx: -44,  ty: 114,  w: 6,  h: 5, color: '#0ea5e9', rot: -54, delay: 490 },
  { id: 6,  tx: -104, ty: 50,   w: 8,  h: 3, color: '#075985', rot: 26,  delay: 462 },
  { id: 7,  tx: -116, ty: -30,  w: 7,  h: 4, color: '#34d399', rot: -44, delay: 515 },
  { id: 8,  tx: 20,   ty: -135, w: 5,  h: 3, color: '#fbbf24', rot: 60,  delay: 472 },
  { id: 9,  tx: 124,  ty: -10,  w: 6,  h: 4, color: '#fbbf24', rot: -28, delay: 530 },
  { id: 10, tx: 70,   ty: 95,   w: 8,  h: 3, color: '#fbbf24', rot: 44,  delay: 478 },
  { id: 11, tx: -84,  ty: -84,  w: 5,  h: 4, color: '#0ea5e9', rot: -64, delay: 508 },
  { id: 12, tx: -32,  ty: -128, w: 7,  h: 3, color: '#34d399', rot: 18,  delay: 494 },
  { id: 13, tx: 82,   ty: -90,  w: 6,  h: 4, color: '#075985', rot: -32, delay: 520 },
  { id: 14, tx: -118, ty: 12,   w: 8,  h: 3, color: '#fbbf24', rot: 52,  delay: 466 },
  { id: 15, tx: 32,   ty: 122,  w: 5,  h: 5, color: '#0ea5e9', rot: -72, delay: 510 },
] as const

function Confetti({ p }: { p: (typeof CONF)[number] }) {
  const tx      = useSharedValue(0)
  const ty      = useSharedValue(0)
  const opacity = useSharedValue(0)
  const rot     = useSharedValue(0)

  useEffect(() => {
    opacity.value = withDelay(p.delay, withSequence(
      withTiming(1, { duration: 60 }),
      withDelay(680, withTiming(0, { duration: 480 }))
    ))
    tx.value  = withDelay(p.delay, withSpring(p.tx, { damping: 18, stiffness: 85 }))
    ty.value  = withDelay(p.delay, withSpring(p.ty, { damping: 18, stiffness: 85 }))
    rot.value = withDelay(p.delay, withTiming(p.rot, { duration: 1100 }))
  }, [])

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${rot.value}deg` },
    ],
  }))

  return (
    <Animated.View style={[{
      position: 'absolute',
      width: p.w, height: p.h,
      borderRadius: 2,
      backgroundColor: p.color,
    }, style]} />
  )
}

function RingPulse({ delay, color, size }: { delay: number; color: string; size: number }) {
  const scale   = useSharedValue(0.5)
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withDelay(delay, withSequence(
      withTiming(0.65, { duration: 80 }),
      withTiming(0, { duration: 1000 })
    ))
    scale.value = withDelay(delay, withTiming(3.2, { duration: 1080 }))
  }, [])

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[{
      position: 'absolute',
      width: size, height: size,
      borderRadius: size / 2,
      borderWidth: 2,
      borderColor: color,
    }, style]} />
  )
}

// LR number — simple fade + subtle slide, no per-character bounce
function LRNumber({ lrNumber, delay }: { lrNumber: string; delay: number }) {
  const opacity = useSharedValue(0)
  const y       = useSharedValue(8)

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 320 }))
    y.value       = withDelay(delay, withTiming(0, { duration: 320 }))
  }, [])

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }))

  return (
    <Animated.Text style={[s.lrChar, style]}>
      LR # {lrNumber}
    </Animated.Text>
  )
}

type Props = { lrNumber: string; onDone: () => void }

export function BookingSuccessOverlay({ lrNumber, onDone }: Props) {
  const backdropOpacity = useSharedValue(0)

  const cardY       = useSharedValue(340)
  const cardOpacity = useSharedValue(0)

  const badgeScale  = useSharedValue(0)
  const badgeRotate = useSharedValue(-20)

  // Stamp: gentle scale from 1.5 (not 5), well-damped so it doesn't thrash
  const stampScale   = useSharedValue(1.5)
  const stampOpacity = useSharedValue(0)

  const btnOpacity = useSharedValue(0)
  const btnY       = useSharedValue(18)

  useEffect(() => {
    backdropOpacity.value = withTiming(1, { duration: 250 })

    cardOpacity.value = withDelay(100, withTiming(1, { duration: 180 }))
    cardY.value       = withDelay(100, withSpring(0, { damping: 17, stiffness: 230 }))

    badgeScale.value  = withDelay(380, withSpring(1, { damping: 12, stiffness: 260 }))
    badgeRotate.value = withDelay(380, withSpring(0, { damping: 14, stiffness: 220 }))

    // Stamp fades in while scaling down from 1.5 — confident, not violent
    stampOpacity.value = withDelay(660, withTiming(1, { duration: 180 }))
    stampScale.value   = withDelay(660, withSpring(1, { damping: 18, stiffness: 280 }))

    btnOpacity.value = withDelay(1300, withTiming(1, { duration: 380 }))
    btnY.value       = withDelay(1300, withTiming(0, { duration: 320 }))

    const t = setTimeout(onDone, 5000)
    return () => clearTimeout(t)
  }, [])

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }))
  const cardStyle     = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }))
  const badgeStyle    = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }, { rotate: `${badgeRotate.value}deg` }],
  }))
  const stampStyle    = useAnimatedStyle(() => ({
    opacity: stampOpacity.value,
    transform: [{ scale: stampScale.value }],
  }))
  const btnStyle      = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
    transform: [{ translateY: btnY.value }],
  }))

  return (
    <Animated.View style={[StyleSheet.absoluteFill, s.root, backdropStyle]}>
      <View style={[StyleSheet.absoluteFill, s.backdrop]} />

      <Animated.View style={[s.card, cardStyle]}>

        {/* Header band */}
        <View style={s.header}>
          <Animated.View style={badgeStyle}>
            <View style={s.badge}>
              <Ionicons name="checkmark-done" size={38} color="#fff" />
            </View>
          </Animated.View>
          <Text style={s.headerLabel}>Booking Confirmed</Text>
        </View>

        {/* Ticket perforation */}
        <View style={s.perfRow}>
          <View style={s.perfHole} />
          <View style={s.perfLine} />
          <View style={[s.perfHole, { marginLeft: -10, marginRight: 0 }]} />
        </View>

        {/* Stamp + confetti zone */}
        <View style={s.stampZone}>
          <View style={s.burstAnchor}>
            {CONF.map(p => <Confetti key={p.id} p={p} />)}
            <RingPulse delay={440} color="#34d399" size={88} />
            <RingPulse delay={600} color="#0ea5e9" size={72} />
          </View>

          <Animated.View style={[s.stamp, stampStyle]}>
            <Text style={s.stampText}>BOOKED</Text>
          </Animated.View>
        </View>

        {/* LR number */}
        <View style={s.lrRow}>
          <LRNumber lrNumber={lrNumber} delay={900} />
        </View>

        <View style={s.divider} />

        {/* Done button */}
        <Animated.View style={[s.btnWrap, btnStyle]}>
          <TouchableOpacity onPress={onDone} style={s.btn} activeOpacity={0.8}>
            <Text style={s.btnText}>Done</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  backdrop: {
    backgroundColor: 'rgba(6, 20, 36, 0.90)',
  },
  card: {
    width: SW - 44,
    backgroundColor: '#fff',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 28 },
    shadowOpacity: 0.45,
    shadowRadius: 48,
    elevation: 28,
  },
  header: {
    backgroundColor: '#075985',
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  perfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
  },
  perfHole: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f0f9ff',
    marginLeft: -11,
  },
  perfLine: {
    flex: 1,
    borderTopWidth: 1.5,
    borderTopColor: '#bae6fd',
    borderStyle: 'dashed',
    marginHorizontal: 6,
  },
  stampZone: {
    backgroundColor: '#f8fafc',
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burstAnchor: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stamp: {
    borderWidth: 3.5,
    borderColor: '#059669',
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 7,
  },
  stampText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 7,
  },
  lrRow: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingBottom: 24,
  },
  lrChar: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0c2d3c',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0f2fe',
    marginHorizontal: 20,
  },
  btnWrap: {
    padding: 20,
  },
  btn: {
    backgroundColor: '#075985',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
})

const s = styles

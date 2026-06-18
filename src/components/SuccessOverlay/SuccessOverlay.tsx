import { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withDelay, withTiming, withSequence,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { CONF, type ConfettiParticle } from './constants'
import { s } from './styles'

export type SuccessOverlayProps = {
  referenceNumber: string
  referenceLabel?: string
  headerLabel: string
  stampText: string
  headerColor: string
  stampColor: string
  doneLabel?: string
  onDone: () => void
}

function Confetti({ p }: { p: ConfettiParticle }) {
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

function RefNumber({ label, number, color, delay }: {
  label: string
  number: string
  color: string
  delay: number
}) {
  const opacity = useSharedValue(0)
  const y       = useSharedValue(8)

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 320 }))
    y.value       = withDelay(delay, withTiming(0, { duration: 320 }))
  }, [])

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
    alignItems: 'center',
  }))

  return (
    <Animated.View style={style}>
      <Text style={s.refLabel}>{label}</Text>
      <Text style={[s.refNumber, { color }]}>{number}</Text>
    </Animated.View>
  )
}

export function SuccessOverlay({
  referenceNumber,
  referenceLabel = 'Ref #',
  headerLabel,
  stampText,
  headerColor,
  stampColor,
  doneLabel = 'Done',
  onDone,
}: SuccessOverlayProps) {
  const backdropOpacity = useSharedValue(0)
  const cardY           = useSharedValue(340)
  const cardOpacity     = useSharedValue(0)
  const badgeScale      = useSharedValue(0)
  const badgeRotate     = useSharedValue(-20)
  const stampScale      = useSharedValue(1.5)
  const stampOpacity    = useSharedValue(0)
  const btnOpacity      = useSharedValue(0)
  const btnY            = useSharedValue(18)

  useEffect(() => {
    backdropOpacity.value = withTiming(1, { duration: 250 })

    cardOpacity.value = withDelay(100, withTiming(1, { duration: 180 }))
    cardY.value       = withDelay(100, withSpring(0, { damping: 17, stiffness: 230 }))

    badgeScale.value  = withDelay(380, withSpring(1, { damping: 12, stiffness: 260 }))
    badgeRotate.value = withDelay(380, withSpring(0, { damping: 14, stiffness: 220 }))

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

        {/* Header */}
        <View style={[s.header, { backgroundColor: headerColor }]}>
          <Animated.View style={badgeStyle}>
            <View style={s.badge}>
              <Ionicons name="checkmark-done" size={38} color="#fff" />
            </View>
          </Animated.View>
          <Text style={s.headerLabel}>{headerLabel}</Text>
        </View>

        {/* Ticket perforation */}
        <View style={s.perfRow}>
          <View style={s.perfHole} />
          <View style={s.perfLine} />
          <View style={[s.perfHole, { marginLeft: -10, marginRight: 0 }]} />
        </View>

        {/* Stamp + confetti */}
        <View style={s.stampZone}>
          <View style={s.burstAnchor}>
            {CONF.map(p => <Confetti key={p.id} p={p} />)}
            <RingPulse delay={440} color="#34d399" size={88} />
            <RingPulse delay={600} color={headerColor} size={72} />
          </View>

          <Animated.View style={[s.stamp, { borderColor: stampColor }, stampStyle]}>
            <Text style={[s.stampText, { color: stampColor }]}>{stampText}</Text>
          </Animated.View>
        </View>

        {/* Reference number */}
        <View style={s.refRow}>
          <RefNumber
            label={referenceLabel}
            number={referenceNumber}
            color={headerColor}
            delay={900}
          />
        </View>

        <View style={s.divider} />

        {/* Done button */}
        <Animated.View style={[s.btnWrap, btnStyle]}>
          <TouchableOpacity
            onPress={onDone}
            style={[s.btn, { backgroundColor: headerColor }]}
            activeOpacity={0.8}
          >
            <Text style={s.btnText}>{doneLabel}</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

      </Animated.View>
    </Animated.View>
  )
}

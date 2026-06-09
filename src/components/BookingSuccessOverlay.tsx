import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withDelay, withTiming, runOnJS,
} from 'react-native-reanimated'
import { colors, typography } from '@/src/theme'

type Props = {
  lrNumber: string
  onDone: () => void
}

export function BookingSuccessOverlay({ lrNumber, onDone }: Props) {
  const circleScale  = useSharedValue(0)
  const checkScale   = useSharedValue(0)
  const textOpacity  = useSharedValue(0)

  useEffect(() => {
    circleScale.value = withSpring(1, { damping: 12, stiffness: 180 })
    checkScale.value  = withDelay(280, withSpring(1, { damping: 10, stiffness: 200 }))
    textOpacity.value = withDelay(480, withTiming(1, { duration: 300 }))

    const timer = setTimeout(() => runOnJS(onDone)(), 2600)
    return () => clearTimeout(timer)
  }, [])

  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: circleScale.value }] }))
  const checkStyle  = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }))
  const textStyle   = useAnimatedStyle(() => ({ opacity: textOpacity.value }))

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.circle, circleStyle]}>
        <Animated.View style={checkStyle}>
          {/* Checkmark built from two rotated views */}
          <View style={styles.checkWrap}>
            <View style={styles.checkShort} />
            <View style={styles.checkLong} />
          </View>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.textBlock, textStyle]}>
        <Text style={styles.title}>Booking Created!</Text>
        <Text style={styles.lr}>LR #{lrNumber}</Text>
      </Animated.View>
    </View>
  )
}

const CHECK_COLOR = '#fff'

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  checkWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkShort: {
    position: 'absolute',
    width: 14,
    height: 4,
    backgroundColor: CHECK_COLOR,
    borderRadius: 2,
    bottom: 11,
    left: 5,
    transform: [{ rotate: '45deg' }],
  },
  checkLong: {
    position: 'absolute',
    width: 26,
    height: 4,
    backgroundColor: CHECK_COLOR,
    borderRadius: 2,
    bottom: 15,
    right: 4,
    transform: [{ rotate: '-55deg' }],
  },
  textBlock: {
    marginTop: 28,
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.foreground,
  },
  lr: {
    fontSize: typography.size.base,
    color: colors.mutedFg,
    fontWeight: typography.weight.medium,
  },
})

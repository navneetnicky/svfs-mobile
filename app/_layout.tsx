import "../global.css";
import { useEffect, useRef, useState } from 'react'
import { Appearance, Platform, View, Text, Animated, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Force light mode — theme toggle is not implemented yet
if (Platform.OS !== 'web') Appearance.setColorScheme('light')
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Stack, Redirect } from 'expo-router'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import * as SecureStore from 'expo-secure-store'
import 'react-native-reanimated'

import { store } from '@/src/store'
import { hydrateAuth } from '@/src/store/authSlice'
import { useAppSelector } from '@/src/store/hooks'
import { GluestackUIProvider } from '@/src/components/ui/gluestack-ui-provider'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient()

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(app)',
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    if (error) throw error
  }, [error])

  // Hydrate auth — localStorage on web, SecureStore on native
  useEffect(() => {
    async function hydrate() {
      let token: string | null = null
      let userRaw: string | null = null
      if (Platform.OS === 'web') {
        token = localStorage.getItem('token')
        userRaw = localStorage.getItem('user')
      } else {
        token = await SecureStore.getItemAsync('token')
        userRaw = await SecureStore.getItemAsync('user')
      }
      if (token && userRaw) {
        store.dispatch(hydrateAuth({ token, user: JSON.parse(userRaw) }))
      } else {
        store.dispatch(hydrateAuth(null))
      }
    }
    hydrate()
  }, [])

  if (!loaded) return null

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppNavigator />
      </QueryClientProvider>
    </Provider>
  )
}

const SCREEN_WIDTH = Dimensions.get('window').width
const SPLASH_MIN_MS = 2800

function JSSplashScreen() {
  const truckX  = useRef(new Animated.Value(-120)).current
  const titleY  = useRef(new Animated.Value(20)).current
  const titleOp = useRef(new Animated.Value(0)).current
  const roadOp  = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(roadOp,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(titleOp, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
      Animated.timing(titleY,  { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
    ]).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(truckX, { toValue: SCREEN_WIDTH + 120, duration: 2000, useNativeDriver: true }),
        Animated.timing(truckX, { toValue: -120, duration: 0, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: '#1d4ed8', alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ alignItems: 'center', marginBottom: 80, opacity: titleOp, transform: [{ translateY: titleY }] }}>
        <Text style={{ fontSize: 42, fontWeight: '900', color: 'white', letterSpacing: 2 }}>SVFS</Text>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', letterSpacing: 1, marginTop: 6 }}>
          Smart Vehicle Freight System
        </Text>
      </Animated.View>

      <Animated.View style={{ position: 'absolute', bottom: 160, left: 0, right: 0, opacity: roadOp }}>
        <View style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.15)' }} />
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <View key={i} style={{ height: 3, flex: 1, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 }} />
          ))}
        </View>
        <View style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.15)', marginTop: 8 }} />
        <Animated.View style={{ position: 'absolute', top: -28, transform: [{ translateX: truckX }] }}>
          <MaterialCommunityIcons name="truck-delivery" size={52} color="white" />
        </Animated.View>
      </Animated.View>

      <Animated.View style={{ position: 'absolute', bottom: 100, opacity: roadOp }}>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>Loading...</Text>
      </Animated.View>
    </View>
  )
}

function AppNavigator() {
  const { token, isHydrating } = useAppSelector((s) => s.auth)
  const [minTimeDone, setMinTimeDone] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMinTimeDone(true), SPLASH_MIN_MS)
    return () => clearTimeout(t)
  }, [])

  const showingSplash = isHydrating || !minTimeDone

  useEffect(() => {
    if (!showingSplash) SplashScreen.hideAsync()
  }, [showingSplash])

  if (showingSplash) return <JSSplashScreen />

  return (
    <GluestackUIProvider mode="light">
      <ThemeProvider value={DefaultTheme}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(app)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="booking" />
            <Stack.Screen name="+not-found" />
          </Stack>
          {!token && <Redirect href="/(auth)/login" />}
        </SafeAreaView>
      </ThemeProvider>
    </GluestackUIProvider>
  )
}

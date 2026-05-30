import "../global.css";
import { useEffect } from 'react'
import { Platform } from 'react-native'
import { Stack, Redirect } from 'expo-router'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import * as SecureStore from 'expo-secure-store'
import 'react-native-reanimated'

import { store } from '@/src/store'
import { hydrateAuth } from '@/src/store/authSlice'
import { useAppSelector } from '@/src/store/hooks'
import { useColorScheme } from '@/components/useColorScheme'
import { GluestackUIProvider } from '@/src/components/ui/gluestack-ui-provider'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient()

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
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

function AppNavigator() {
  const colorScheme = useColorScheme()
  const { token, isHydrating } = useAppSelector((s) => s.auth)

  // Keep splash screen visible while reading SecureStore
  useEffect(() => {
    if (!isHydrating) {
      SplashScreen.hideAsync()
    }
  }, [isHydrating])

  if (isHydrating) return null

  return (
    <GluestackUIProvider mode={colorScheme === 'dark' ? 'dark' : 'light'}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        {!token && <Redirect href="/(auth)/login" />}
      </ThemeProvider>
    </GluestackUIProvider>
  )
}

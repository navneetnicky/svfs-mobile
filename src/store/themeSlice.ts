import { createSlice } from '@reduxjs/toolkit'
import { Appearance, Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

type Theme = 'light' | 'dark'

const initialTheme: Theme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'

function persistTheme(theme: Theme) {
  if (Platform.OS === 'web') {
    localStorage.setItem('app_theme', theme)
  } else {
    SecureStore.setItemAsync('app_theme', theme)
  }
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: { theme: initialTheme } as { theme: Theme },
  reducers: {
    toggleTheme(state) {
      const next: Theme = state.theme === 'light' ? 'dark' : 'light'
      state.theme = next
      persistTheme(next)
    },
    setTheme(state, action: { payload: Theme }) {
      state.theme = action.payload
      persistTheme(action.payload)
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer

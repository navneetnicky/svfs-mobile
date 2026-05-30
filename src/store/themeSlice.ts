import { createSlice } from '@reduxjs/toolkit'
import { Appearance } from 'react-native'

type Theme = 'light' | 'dark'

const initialTheme: Theme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'

const themeSlice = createSlice({
  name: 'theme',
  initialState: { theme: initialTheme } as { theme: Theme },
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    setTheme(state, action: { payload: Theme }) {
      state.theme = action.payload
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import type { AuthUser, LoginResponse } from '@/src/types/auth'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isHydrating: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isHydrating: true,
}

function persist(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value)
  } else {
    SecureStore.setItemAsync(key, value)
  }
}

function remove(key: string) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key)
  } else {
    SecureStore.deleteItemAsync(key)
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<LoginResponse>) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isHydrating = false
      persist('token', action.payload.token)
      persist('user', JSON.stringify(action.payload.user))
    },
    logout(state) {
      state.user = null
      state.token = null
      state.isHydrating = false
      remove('token')
      remove('user')
    },
    hydrateAuth(state, action: PayloadAction<LoginResponse | null>) {
      if (action.payload) {
        state.user = action.payload.user
        state.token = action.payload.token
      }
      state.isHydrating = false
    },
    updatePermissions(state, action: PayloadAction<string[]>) {
      if (state.user) {
        state.user.permissions = action.payload
        persist('user', JSON.stringify(state.user))
      }
    },
  },
})

export const { setCredentials, logout, hydrateAuth, updatePermissions } = authSlice.actions
export default authSlice.reducer

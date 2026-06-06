import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

export interface WorkspaceBranch {
  id: string
  branch_name: string
  branch_code: string
}

interface WorkspaceState {
  branches: WorkspaceBranch[]
  activeBranch: WorkspaceBranch | null
}

function persistActiveBranch(id: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem('activeBranchId', id)
  } else {
    SecureStore.setItemAsync('activeBranchId', id)
  }
}

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: { branches: [], activeBranch: null } as WorkspaceState,
  reducers: {
    setWorkspace(
      state,
      action: PayloadAction<{ branches: WorkspaceBranch[]; activeBranchId?: string | null }>
    ) {
      state.branches = action.payload.branches
      const { branches, activeBranchId } = action.payload
      state.activeBranch =
        (activeBranchId && branches.find(b => b.id === activeBranchId)) ||
        branches[0] ||
        null
    },
    setActiveBranch(state, action: PayloadAction<WorkspaceBranch>) {
      state.activeBranch = action.payload
      persistActiveBranch(action.payload.id)
    },
  },
})

export const { setWorkspace, setActiveBranch } = workspaceSlice.actions
export default workspaceSlice.reducer

import React from 'react'
import { RefreshControl, type RefreshControlProps } from 'react-native'
import { colors } from '@/src/theme'

export function useRefreshControl(isRefetching: boolean, refetch: () => void): React.ReactElement<RefreshControlProps> {
  return React.createElement(RefreshControl, { refreshing: isRefetching, onRefresh: refetch, colors: [colors.primary], tintColor: colors.primary })
}

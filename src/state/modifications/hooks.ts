import { useAppSelector } from 'state/hooks'

import { AppState } from '../types'

export function useTokenBalances(): AppState['modifications']['tokenBalances'] {
  return useAppSelector((state) => state.modifications.tokenBalances)
}
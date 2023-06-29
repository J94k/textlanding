import { useAppSelector } from 'state/hooks'

import { AppState } from '../types'

const NO_EXISTING_ID = -1

export function useNativeBalance(
  chainId: number = NO_EXISTING_ID
): AppState['modifications']['nativeBalances'][typeof chainId] {
  return useAppSelector((state) => state.modifications.nativeBalances[chainId])
}

export function useTokenBalances(): AppState['modifications']['tokenBalances'] {
  return useAppSelector((state) => state.modifications.tokenBalances)
}

export function useChainTokenBalances(
  chainId: number = NO_EXISTING_ID
): AppState['modifications']['tokenBalances'][typeof chainId] {
  return useAppSelector((state) => state.modifications.tokenBalances[chainId]) || {}
}

export function useChainTokenBalance(
  chainId: number = NO_EXISTING_ID,
  addr: string
): AppState['modifications']['tokenBalances'][typeof chainId][typeof addr] {
  return useAppSelector((state) => state.modifications.tokenBalances[chainId]?.[addr]) || {}
}

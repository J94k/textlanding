import { createReducer } from '@reduxjs/toolkit'

import {
  addNativeBalance,
  increaseNativeBalance,
  reduceNativeBalance,
  addTokenBalances,
  addTokenBalance,
  increaseTokenBalance,
  reduceTokenBalance,
} from './actions'
import { getBalanceFormats, addBalance, subtractBalance } from './utils'

const NATIVE_CURRENCY_DECIMALS = 18

interface ModificationsState {
  readonly nativeBalances: {
    [chainId: number]: {
      balance: string
      weiBalance: string
    }
  }
  readonly tokenBalances: {
    [chainId: number]: {
      [addr: string]: {
        addr: string
        decimals: number
        balance: string
        weiBalance: string
      }
    }
  }
}

const initialState: ModificationsState = {
  nativeBalances: {},
  tokenBalances: {},
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addNativeBalance, (state, { payload: { chainId, balance } }) => {
      const { balance: newBalance, weiBalance } = getBalanceFormats(balance, NATIVE_CURRENCY_DECIMALS)

      state.nativeBalances[chainId] = {
        balance: newBalance,
        weiBalance,
      }
    })
    .addCase(increaseNativeBalance, (state, { payload: { chainId, amountToAdd } }) => {
      const { balance: newBalance, weiBalance } = addBalance(
        state.nativeBalances[chainId]?.balance || 0,
        amountToAdd,
        NATIVE_CURRENCY_DECIMALS
      )

      state.nativeBalances[chainId] = {
        balance: newBalance,
        weiBalance,
      }
    })
    .addCase(reduceNativeBalance, (state, { payload: { chainId, amountToRemove } }) => {
      const { balance: newBalance, weiBalance } = subtractBalance(
        state.nativeBalances[chainId]?.balance || 0,
        amountToRemove,
        NATIVE_CURRENCY_DECIMALS
      )

      state.nativeBalances[chainId] = {
        balance: newBalance,
        weiBalance,
      }
    })
    .addCase(addTokenBalances, (state, { payload: { chainId, tokenBalances } }) => {
      const newBalances: ModificationsState['tokenBalances'][typeof chainId] = {}

      tokenBalances.forEach(({ addr, decimals, balance }) => {
        const { balance: newBalance, weiBalance } = getBalanceFormats(balance, decimals)

        newBalances[addr] = {
          addr,
          decimals,
          balance: newBalance,
          weiBalance,
        }
      })

      state.tokenBalances[chainId] = newBalances
    })
    .addCase(addTokenBalance, (state, { payload: { chainId, addr, decimals, balance } }) => {
      if (!state.tokenBalances[chainId]) state.tokenBalances[chainId] = {}

      const { balance: newBalance, weiBalance } = getBalanceFormats(balance, decimals)

      state.tokenBalances[chainId][addr] = {
        addr,
        decimals,
        balance: newBalance,
        weiBalance,
      }
    })
    .addCase(increaseTokenBalance, (state, { payload: { chainId, addr, decimals, amountToAdd } }) => {
      if (!state.tokenBalances[chainId]) state.tokenBalances[chainId] = {}

      const { balance: newBalance, weiBalance } = addBalance(
        state.tokenBalances[chainId]?.[addr]?.balance || 0,
        amountToAdd,
        decimals
      )

      state.tokenBalances[chainId][addr] = {
        addr,
        decimals,
        balance: newBalance,
        weiBalance,
      }
    })
    .addCase(reduceTokenBalance, (state, { payload: { chainId, addr, decimals, amountToRemove } }) => {
      if (!state.tokenBalances[chainId]) state.tokenBalances[chainId] = {}

      const { balance: newBalance, weiBalance } = subtractBalance(
        state.tokenBalances[chainId]?.[addr]?.balance || 0,
        amountToRemove,
        decimals
      )

      state.tokenBalances[chainId][addr] = {
        addr,
        decimals,
        balance: newBalance,
        weiBalance,
      }
    })
)

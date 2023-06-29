import { BigNumber } from 'ethers'
import JSBI from 'jsbi'
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

const NATIVE_CURRENCY_DECIMALS = 18

interface ModificationsState {
  readonly nativeBalances: {
    [chainId: number]: {
      balance: number
      BNBalance: string
      JSBIBalance: JSBI
    }
  }
  readonly tokenBalances: {
    [chainId: number]: {
      [addr: string]: {
        addr: string
        decimals: number
        balance: number
        BNBalance: string
        JSBIBalance: JSBI
      }
    }
  }
}

const initialState: ModificationsState = {
  nativeBalances: {},
  tokenBalances: {},
}

const getBalanceFormats = (balance: number, decimals: number) => {
  const BNBalance = BigNumber.from(JSBI.BigInt(balance * 10 ** decimals).toString()).toString()
  const JSBIBalance = JSBI.BigInt(BNBalance)

  return {
    BNBalance,
    JSBIBalance,
  }
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addNativeBalance, (state, { payload: { chainId, balance } }) => {
      const { BNBalance, JSBIBalance } = getBalanceFormats(balance, NATIVE_CURRENCY_DECIMALS)

      state.nativeBalances[chainId] = {
        balance,
        BNBalance,
        JSBIBalance,
      }
    })
    .addCase(increaseNativeBalance, (state, { payload: { chainId, amountToAdd } }) => {
      const newBalance = (state.nativeBalances[chainId]?.balance || 0) + amountToAdd
      const { BNBalance, JSBIBalance } = getBalanceFormats(newBalance, NATIVE_CURRENCY_DECIMALS)

      state.nativeBalances[chainId] = {
        balance: newBalance,
        BNBalance,
        JSBIBalance,
      }
    })
    .addCase(reduceNativeBalance, (state, { payload: { chainId, amountToRemove } }) => {
      let newBalance = (state.nativeBalances[chainId]?.balance || 0) - amountToRemove
      newBalance = newBalance > 0 ? newBalance : 0
      const { BNBalance, JSBIBalance } = getBalanceFormats(newBalance, NATIVE_CURRENCY_DECIMALS)

      state.nativeBalances[chainId] = {
        balance: newBalance,
        BNBalance,
        JSBIBalance,
      }
    })
    .addCase(addTokenBalances, (state, { payload: { chainId, tokenBalances } }) => {
      const newBalances: ModificationsState['tokenBalances'][typeof chainId] = {}

      tokenBalances.forEach(({ addr, decimals, balance }) => {
        const { BNBalance, JSBIBalance } = getBalanceFormats(balance, decimals)

        newBalances[addr] = {
          addr,
          decimals,
          balance,
          BNBalance,
          JSBIBalance,
        }
      })

      state.tokenBalances[chainId] = newBalances
    })
    .addCase(addTokenBalance, (state, { payload: { chainId, addr, decimals, balance } }) => {
      const { BNBalance, JSBIBalance } = getBalanceFormats(balance, decimals)

      if (!state.tokenBalances[chainId]) state.tokenBalances[chainId] = {}

      state.tokenBalances[chainId][addr] = {
        addr,
        decimals,
        balance,
        BNBalance,
        JSBIBalance,
      }
    })
    .addCase(increaseTokenBalance, (state, { payload: { chainId, addr, decimals, amountToAdd } }) => {
      if (!state.tokenBalances[chainId]) state.tokenBalances[chainId] = {}

      const oldBalance = state.tokenBalances[chainId]?.[addr].balance || 0
      const newBalance = oldBalance + amountToAdd
      const { BNBalance, JSBIBalance } = getBalanceFormats(newBalance, decimals)

      state.tokenBalances[chainId][addr] = {
        addr,
        decimals,
        balance: newBalance,
        BNBalance,
        JSBIBalance,
      }
    })
    .addCase(reduceTokenBalance, (state, { payload: { chainId, addr, decimals, amountToRemove } }) => {
      if (!state.tokenBalances[chainId]) state.tokenBalances[chainId] = {}

      const oldBalance = state.tokenBalances[chainId]?.[addr].balance || 0

      if (oldBalance > 0) {
        let newBalance = oldBalance - amountToRemove
        newBalance = newBalance < 0 ? 0 : newBalance

        const { BNBalance, JSBIBalance } = getBalanceFormats(newBalance, decimals)

        state.tokenBalances[chainId][addr] = {
          addr,
          decimals,
          balance: newBalance,
          BNBalance,
          JSBIBalance,
        }
      }
    })
)

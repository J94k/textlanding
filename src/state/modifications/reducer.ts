import { BigNumber } from 'ethers'
import JSBI from 'jsbi'
import { createReducer } from '@reduxjs/toolkit'

import { addTokenBalances, addTokenBalance, increaseTokenBalance, reduceTokenBalance } from './actions'

export interface ModificationsState {
  readonly tokenBalances: {
    [addr: string]: {
      addr: string
      decimals: number
      balance: number
      BNBalance: string
      JSBIBalance: JSBI
    }
  }
}

const initialState: ModificationsState = {
  tokenBalances: {},
}

const makeBalances = (balance: number, decimals: number) => {
  const BNBalance = BigNumber.from(balance).mul(BigNumber.from(10).pow(decimals)).toString()
  const JSBIBalance = JSBI.BigInt(BNBalance)

  return {
    BNBalance,
    JSBIBalance,
  }
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addTokenBalances, (state, { payload: tokenBalances }) => {
      const newBalances: ModificationsState['tokenBalances'] = {}

      tokenBalances.forEach(({ addr, decimals, balance }) => {
        const { BNBalance, JSBIBalance } = makeBalances(balance, decimals)

        newBalances[addr] = {
          addr,
          decimals,
          balance,
          BNBalance,
          JSBIBalance,
        }
      })

      state.tokenBalances = newBalances
    })
    .addCase(addTokenBalance, (state, { payload: { addr, decimals, balance } }) => {
      const { BNBalance, JSBIBalance } = makeBalances(balance, decimals)

      state.tokenBalances[addr] = {
        addr,
        decimals,
        balance,
        BNBalance,
        JSBIBalance,
      }
    })
    .addCase(increaseTokenBalance, (state, { payload: { addr, decimals, amountToAdd } }) => {
      const oldBalance = state.tokenBalances[addr].balance

      if (typeof oldBalance === 'number') {
        const newBalance = oldBalance + amountToAdd
        const { BNBalance, JSBIBalance } = makeBalances(newBalance, decimals)

        state.tokenBalances[addr] = {
          addr,
          decimals,
          balance: newBalance,
          BNBalance,
          JSBIBalance,
        }
      }
    })
    .addCase(reduceTokenBalance, (state, { payload: { addr, decimals, amountToRemove } }) => {
      const oldBalance = state.tokenBalances[addr].balance

      if (typeof oldBalance === 'number') {
        const newBalance = oldBalance - amountToRemove
        const { BNBalance, JSBIBalance } = makeBalances(newBalance, decimals)

        state.tokenBalances[addr] = {
          addr,
          decimals,
          balance: newBalance,
          BNBalance,
          JSBIBalance,
        }
      }
    })
)

import { createReducer } from '@reduxjs/toolkit'
import { addTokenBalances, addTokenBalance } from './actions'

export interface ModificationsState {
  readonly tokenBalances: {
    [addr: string]: {
      addr: string
      balance?: number
    }
  }
}

const initialState: ModificationsState = {
  tokenBalances: {},
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addTokenBalances, (state, { payload: tokenBalances }) => {
      const newBalances: ModificationsState['tokenBalances'] = {}

      tokenBalances.forEach(({ addr, balance }) => {
        newBalances[addr] = {
          addr,
          balance,
        }
      })

      state.tokenBalances = newBalances
    })
    .addCase(addTokenBalance, (state, { payload: { addr, balance } }) => {
      state.tokenBalances[addr] = {
        addr,
        balance,
      }
    })
)

import { createAction } from '@reduxjs/toolkit'

export const addTokenBalances = createAction<{
  addr: string
  balance?: number
}[]>(
  'modifications/addTokenBalances'
)

export const addTokenBalance = createAction<{
  addr: string,
  balance?: number
}>(
  'modifications/addTokenBalance'
)
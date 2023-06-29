import { createAction } from '@reduxjs/toolkit'

export const addTokenBalances = createAction<
  {
    addr: string
    decimals: number
    balance: number
  }[]
>('modifications/addTokenBalances')

export const addTokenBalance = createAction<{
  addr: string
  decimals: number
  balance: number
}>('modifications/addTokenBalance')

export const increaseTokenBalance = createAction<{
  addr: string
  decimals: number
  amountToAdd: number
}>('modifications/increaseTokenBalance')

export const reduceTokenBalance = createAction<{
  addr: string
  decimals: number
  amountToRemove: number
}>('modifications/reduceTokenBalance')

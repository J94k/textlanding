import { createAction } from '@reduxjs/toolkit'

export const addNativeBalance = createAction<{
  chainId: number
  balance: number | string
}>('modifications/addNativeBalance')

export const increaseNativeBalance = createAction<{
  chainId: number
  amountToAdd: number | string
}>('modifications/increaseNativeBalance')

export const reduceNativeBalance = createAction<{
  chainId: number
  amountToRemove: number | string
}>('modifications/reduceNativeBalance')

export const addTokenBalances = createAction<{
  chainId: number
  tokenBalances: {
    addr: string
    decimals: number
    balance: number | string
  }[]
}>('modifications/addTokenBalances')

export const addTokenBalance = createAction<{
  chainId: number
  addr: string
  decimals: number
  balance: number | string
}>('modifications/addTokenBalance')

export const increaseTokenBalance = createAction<{
  chainId: number
  addr: string
  decimals: number
  amountToAdd: number | string
}>('modifications/increaseTokenBalance')

export const reduceTokenBalance = createAction<{
  chainId: number
  addr: string
  decimals: number
  amountToRemove: number | string
}>('modifications/reduceTokenBalance')

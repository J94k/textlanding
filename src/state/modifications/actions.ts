import { createAction } from '@reduxjs/toolkit'

export const addNativeBalance = createAction<{
  chainId: number
  balance: number
}>('modifications/addNativeBalance')

export const increaseNativeBalance = createAction<{
  chainId: number
  amountToAdd: number
}>('modifications/increaseNativeBalance')

export const reduceNativeBalance = createAction<{
  chainId: number
  amountToRemove: number
}>('modifications/reduceNativeBalance')

export const addTokenBalances = createAction<{
  chainId: number
  tokenBalances: {
    addr: string
    decimals: number
    balance: number
  }[]
}>('modifications/addTokenBalances')

export const addTokenBalance = createAction<{
  chainId: number
  addr: string
  decimals: number
  balance: number
}>('modifications/addTokenBalance')

export const increaseTokenBalance = createAction<{
  chainId: number
  addr: string
  decimals: number
  amountToAdd: number
}>('modifications/increaseTokenBalance')

export const reduceTokenBalance = createAction<{
  chainId: number
  addr: string
  decimals: number
  amountToRemove: number
}>('modifications/reduceTokenBalance')

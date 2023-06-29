import { useMemo } from 'react'
import { batch } from 'react-redux'
import { Trade } from '@uniswap/router-sdk'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { useAppDispatch } from 'state/hooks'
import {
  increaseNativeBalance,
  reduceNativeBalance,
  increaseTokenBalance,
  reduceTokenBalance,
} from 'state/modifications/actions'

import { useBlankTransaction } from './useBlankTransaction'

// returns a function that will perform local balance changes
// and replace swap with empty transaction
export function useFakeSwapCallback(trade: Trade<Currency, Currency, TradeType> | undefined, allowedSlippage: Percent) {
  const dispatch = useAppDispatch()
  const { callback: blankTransactionCallback } = useBlankTransaction(trade, allowedSlippage)

  const callback = useMemo(() => {
    if (!trade || !blankTransactionCallback) return null

    return async (): Promise<string | undefined> => {
      try {
        const { inputAmount, outputAmount } = trade
        const { currency: inputCurrency } = inputAmount
        const exactInput = inputAmount.toExact()
        const { currency: outputCurrency } = outputAmount
        const exactOutput = outputAmount.toExact()

        const hash = await blankTransactionCallback()

        batch(() => {
          dispatch(
            outputCurrency.isNative
              ? increaseNativeBalance({
                  chainId: outputCurrency.chainId,
                  amountToAdd: Number(exactOutput),
                })
              : increaseTokenBalance({
                  chainId: outputCurrency.chainId,
                  addr: outputCurrency.address,
                  decimals: outputCurrency.decimals,
                  amountToAdd: Number(exactOutput),
                })
          )
          dispatch(
            inputCurrency.isNative
              ? reduceNativeBalance({
                  chainId: inputCurrency.chainId,
                  amountToRemove: Number(exactInput),
                })
              : reduceTokenBalance({
                  chainId: inputCurrency.chainId,
                  addr: inputCurrency.address,
                  decimals: inputCurrency.decimals,
                  amountToRemove: Number(exactInput),
                })
          )
        })

        return hash
      } catch (error) {
        console.group('%c fail on fake swap', 'color: red')
        console.error(error)
        console.groupEnd()
        return
      }
    }
  }, [dispatch, trade, blankTransactionCallback])

  return { callback }
}

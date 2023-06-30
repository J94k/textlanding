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
import { useTransactionAdder } from 'state/transactions/hooks'

import { currencyId } from '../utils/currencyId'
import { TransactionInfo, TransactionType } from '../state/transactions/types'
import { useBlankTransaction } from './useBlankTransaction'
import useTransactionDeadline from './useTransactionDeadline'

// returns a function that will perform local balance changes
// and replace swap with empty transaction
export function useFakeSwapCallback(trade: Trade<Currency, Currency, TradeType> | undefined, allowedSlippage: Percent) {
  const dispatch = useAppDispatch()
  const { callback: blankTransactionCallback } = useBlankTransaction()
  const deadline = useTransactionDeadline()
  const addTransaction = useTransactionAdder()

  const callback = useMemo(() => {
    if (!trade || !blankTransactionCallback) return null

    return async () => {
      const txResponse = await blankTransactionCallback()
      const info: TransactionInfo = {
        type: TransactionType.SWAP,
        inputCurrencyId: currencyId(trade.inputAmount.currency),
        outputCurrencyId: currencyId(trade.outputAmount.currency),
        ...(trade.tradeType === TradeType.EXACT_INPUT
          ? {
              tradeType: TradeType.EXACT_INPUT,
              inputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
              expectedOutputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
              minimumOutputCurrencyAmountRaw: trade.minimumAmountOut(allowedSlippage).quotient.toString(),
            }
          : {
              tradeType: TradeType.EXACT_OUTPUT,
              maximumInputCurrencyAmountRaw: trade.maximumAmountIn(allowedSlippage).quotient.toString(),
              outputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
              expectedInputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
            }),
      }

      if (txResponse) {
        addTransaction(txResponse, info, deadline?.toNumber())

        const { inputAmount, outputAmount } = trade
        const { currency: inputCurrency } = inputAmount
        const exactInput = inputAmount.toExact()
        const { currency: outputCurrency } = outputAmount
        const exactOutput = outputAmount.toExact()

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
      }

      return txResponse?.hash
    }
  }, [dispatch, trade, blankTransactionCallback, deadline, addTransaction, allowedSlippage])

  return { callback }
}

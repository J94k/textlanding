import { batch } from 'react-redux'
import { Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useMemo } from 'react'
import { useAppDispatch } from 'state/hooks'
import {
  increaseNativeBalance,
  reduceNativeBalance,
  increaseTokenBalance,
  reduceTokenBalance,
} from 'state/modifications/actions'

import { TransactionType } from '../state/transactions/types'
import { useCurrencyBalance } from '../state/connection/hooks'
import { useTransactionAdder } from '../state/transactions/hooks'
import { useBlankTransaction } from './useBlankTransaction'

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
}

// returns a function that will perform local balance
// changes for wrap/unwrap actions
export function useFakeWrapCallback(
  inputCurrency: Currency | undefined | null,
  outputCurrency: Currency | undefined | null,
  typedValue: string | undefined
) {
  const { chainId, account } = useWeb3React()
  const dispatch = useAppDispatch()
  const { callback: blankTransactionCallback } = useBlankTransaction(true)
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency ?? undefined)
  const inputAmount = useMemo(
    () => tryParseCurrencyAmount(typedValue, inputCurrency ?? undefined),
    [inputCurrency, typedValue]
  )
  const addTransaction = useTransactionAdder()

  const callback = useMemo(() => {
    if (!chainId || !inputCurrency || !outputCurrency || !blankTransactionCallback || !inputAmount) return null

    return async () => {
      const txResponse = await blankTransactionCallback()

      if (txResponse) {
        addTransaction(txResponse, {
          type: TransactionType.WRAP,
          unwrapped: outputCurrency.isNative,
          currencyAmountRaw: inputAmount?.quotient.toString(),
          chainId,
        })

        const exactAmount = inputAmount?.toExact()

        batch(() => {
          dispatch(
            outputCurrency.isNative
              ? increaseNativeBalance({
                  chainId,
                  amountToAdd: exactAmount,
                })
              : increaseTokenBalance({
                  chainId,
                  addr: outputCurrency.address,
                  decimals: outputCurrency.decimals,
                  amountToAdd: exactAmount,
                })
          )
          dispatch(
            inputCurrency.isNative
              ? reduceNativeBalance({
                  chainId,
                  amountToRemove: exactAmount,
                })
              : reduceTokenBalance({
                  chainId,
                  addr: inputCurrency.address,
                  decimals: inputCurrency.decimals,
                  amountToRemove: exactAmount,
                })
          )
        })
      }

      return txResponse?.hash
    }
  }, [chainId, inputCurrency, outputCurrency, inputAmount, balance, addTransaction, blankTransactionCallback, dispatch])

  return { callback }
}

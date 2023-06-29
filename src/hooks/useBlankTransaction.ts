import { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Trade } from '@uniswap/router-sdk'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'

import { currencyId } from '../utils/currencyId'
import { TransactionInfo, TransactionType } from '../state/transactions/types'
import { useTransactionAdder } from '../state/transactions/hooks'
import useTransactionDeadline from './useTransactionDeadline'

// empty transaction with zero assets sent to a connected wallet
export function useBlankTransaction(trade: Trade<Currency, Currency, TradeType> | undefined, allowedSlippage: Percent) {
  const { account, chainId, provider } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const deadline = useTransactionDeadline()

  const callback = useMemo(() => {
    if (!account || !chainId || !provider || !trade) return null

    const tx = {
      from: account,
      to: account,
      value: 0,
    }

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

    return async (): Promise<string | undefined> => {
      try {
        const response = await provider
          .getSigner()
          .sendTransaction({ ...tx })
          .then((response) => response)

        addTransaction(response, info, deadline?.toNumber())
        return response.hash
      } catch (error) {
        console.group('%c fail on blank tx', 'color: red')
        console.error(error)
        console.groupEnd()
        return
      }
    }
  }, [account, chainId, provider, trade, allowedSlippage, addTransaction, deadline])

  return {
    callback,
  }
}

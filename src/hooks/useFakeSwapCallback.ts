import { useMemo } from 'react'
import { Trade } from '@uniswap/router-sdk'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'

import { useBlankTransaction } from './useBlankTransaction'

// perform balance changes after swap locally and replace swap with empty transaction
export function useFakeSwapCallback(trade: Trade<Currency, Currency, TradeType> | undefined, allowedSlippage: Percent) {
  const { callback: blankTransactionCallback } = useBlankTransaction(trade, allowedSlippage)

  const callback = useMemo(() => {
    if (!blankTransactionCallback) return

    return async (): Promise<string | undefined> => {
      try {
        const hash = await blankTransactionCallback()

        // change balances

        return hash
      } catch (error) {
        console.group('%c fail on fake swap', 'color: red')
        console.error(error)
        console.groupEnd()
        return
      }
    }
  }, [blankTransactionCallback])

  return { callback }
}

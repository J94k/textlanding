import { Percent, TradeType } from '@uniswap/sdk-core'
import { UNIVERSAL_ROUTER_ADDRESS } from '@uniswap/universal-router-sdk'
import { useWeb3React } from '@web3-react/core'
import { useCallback } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { isUniswapXTrade } from 'state/routing/utils'
import { useAddOrder } from 'state/signatures/hooks'
import { UniswapXOrderDetails } from 'state/signatures/types'
import { useModifiedTokens, useNativeBalance, useSetModifiedToken, useSetNativeBalance } from 'state/user/hooks'
import { addBalance, formatBalance, subtractBalance } from 'utils/balances'

import { useTransactionAdder } from '../state/transactions/hooks'
import {
  ExactInputSwapTransactionInfo,
  ExactOutputSwapTransactionInfo,
  TransactionType,
} from '../state/transactions/types'
import { currencyId } from '../utils/currencyId'
import { useBlankTransaction } from './useBlankTransaction'
import { SwapResult } from './useSwapCallback'
import useTransactionDeadline from './useTransactionDeadline'

export function useFakeSwapCallback(
  trade: InterfaceTrade | undefined,
  fiatValues: { amountIn?: number; amountOut?: number; feeUsd?: number },
  allowedSlippage: Percent // in bips
) {
  const deadline = useTransactionDeadline()
  const addTransaction = useTransactionAdder()
  const addOrder = useAddOrder()
  const { account, chainId } = useWeb3React()
  const { callback: blankTransactionCallback } = useBlankTransaction(
    chainId ? UNIVERSAL_ROUTER_ADDRESS(chainId) : undefined
  )

  const modifiedTokens = useModifiedTokens(chainId)
  const setModifiedToken = useSetModifiedToken()
  const nativeBalance = useNativeBalance(chainId)
  const setNativeBalance = useSetNativeBalance()

  const swapCallback = useCallback(async () => {
    if (!blankTransactionCallback) throw new Error('missing transaction callback')
    if (!trade) throw new Error('missing trade')
    if (!account || !chainId) throw new Error('wallet must be connected to swap')

    const response = await blankTransactionCallback()

    const { inputAmount, outputAmount } = trade
    const { currency: inputCurrency } = inputAmount
    const exactInput = inputAmount.toExact()
    const { currency: outputCurrency } = outputAmount
    const exactOutput = outputAmount.toExact()

    if (inputCurrency.isNative) {
      setNativeBalance(
        chainId,
        nativeBalance ? subtractBalance(nativeBalance.balance, exactInput, 18) : formatBalance(exactInput, 18)
      )
    } else {
      const inputToken = modifiedTokens?.[inputCurrency.address]
      if (inputToken) {
        setModifiedToken(chainId, inputCurrency.address, {
          address: inputCurrency.address,
          ...subtractBalance(inputToken.balance, exactInput, inputCurrency.decimals),
        })
      } else {
        setModifiedToken(chainId, inputCurrency.address, {
          address: inputCurrency.address,
          ...formatBalance(exactInput, inputCurrency.decimals),
        })
      }
    }

    if (outputCurrency.isNative) {
      setNativeBalance(
        chainId,
        nativeBalance ? addBalance(nativeBalance?.balance, exactOutput, 18) : formatBalance(exactOutput, 18)
      )
    } else {
      const outputToken = modifiedTokens?.[outputCurrency.address]
      if (outputToken) {
        setModifiedToken(chainId, outputCurrency.address, {
          ...outputToken,
          ...addBalance(outputToken.balance, exactOutput, outputCurrency.decimals),
        })
      } else {
        setModifiedToken(chainId, outputCurrency.address, {
          address: outputCurrency.address,
          ...formatBalance(exactOutput, outputCurrency.decimals),
        })
      }
    }

    return { response }
  }, [
    account,
    chainId,
    trade,
    blankTransactionCallback,
    modifiedTokens,
    nativeBalance,
    setModifiedToken,
    setNativeBalance,
  ])

  return useCallback(async () => {
    if (!trade) throw new Error('missing trade')
    if (!account || !chainId) throw new Error('wallet must be connected to swap')
    if (!deadline) throw new Error('missing transaction deadline')

    const result = await swapCallback()

    const swapInfo: ExactInputSwapTransactionInfo | ExactOutputSwapTransactionInfo = {
      type: TransactionType.SWAP,
      inputCurrencyId: currencyId(trade.inputAmount.currency),
      outputCurrencyId: currencyId(trade.outputAmount.currency),
      isUniswapXOrder: isUniswapXTrade(trade),
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

    if (result) {
      if (isUniswapXTrade(trade)) {
        addOrder(
          account,
          // orderHash {
          //   indexed: true,
          //   internalType: "bytes32",
          //   name: "orderHash",
          //   type: "bytes32",
          // },
          result.response.hash, // result.response.orderHash,
          chainId,
          deadline.toNumber(),
          swapInfo as UniswapXOrderDetails['swapInfo']
        )
      } else {
        addTransaction(result.response, swapInfo, deadline?.toNumber())
      }
    }

    return result as SwapResult
  }, [account, addOrder, addTransaction, allowedSlippage, chainId, deadline, swapCallback, trade])
}

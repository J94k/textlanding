import { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { UNIVERSAL_ROUTER_ADDRESS } from '@uniswap/universal-router-sdk'

// empty transaction with zero assets
export function useBlankTransaction(toRouter?: boolean) {
  const { account, chainId, provider } = useWeb3React()

  const callback = useMemo(() => {
    if (!account || !chainId || !provider) return null

    const tx = {
      from: account,
      to: toRouter ? UNIVERSAL_ROUTER_ADDRESS(chainId) || account : account,
      value: 0,
    }

    return async () => {
      const response = await provider
        .getSigner()
        .sendTransaction({ ...tx })
        .then((response) => response)

      await provider.waitForTransaction(response.hash)

      return response
    }
  }, [toRouter, account, chainId, provider])

  return {
    callback,
  }
}

import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'

export function useBlankTransaction(to: string | undefined) {
  const { account, chainId, provider } = useWeb3React()

  const callback = useMemo(() => {
    if (!to || !chainId || !provider) return null

    return async () => {
      const res = await provider
        .getSigner()
        .sendTransaction({
          from: account,
          to,
          value: 0,
        })
        .then((res) => res)

      return res
    }
  }, [to, account, chainId, provider])

  return { callback }
}

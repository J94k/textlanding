import { useWeb3React } from '@web3-react/core'
import { useEffect } from 'react'

import { useModifiedTokens, useNativeBalance } from './hooks'

export default function Loader() {
  const { chainId } = useWeb3React()
  const nativeBalance = useNativeBalance(chainId)
  const modifiedTokens = useModifiedTokens(chainId)

  useEffect(() => {
    if (!nativeBalance) {
      //
    }
    if (modifiedTokens) {
      //
    }
  }, [])

  return null
}

import { useEffect } from 'react'
import { useAppDispatch } from 'state/hooks'
import * as storage from 'lib/services/storage'

import { addTokenBalances } from './actions'
import { useTokenBalances } from './hooks'

const TOKEN_BALANCES_KEY = 'tokenBalances'

export default function Updater(): null {
  const dispatch = useAppDispatch()
  const tokenBalances = useTokenBalances()

  // retrieve saved balances
  useEffect(() => {
    const tokenBalances = storage.get(TOKEN_BALANCES_KEY)

    if (tokenBalances) {
      Object.keys(tokenBalances).forEach((chainId) => {
        dispatch(addTokenBalances({ chainId: Number(chainId), tokenBalances: tokenBalances[chainId] }))
      })
    }
  }, [])

  // @todo fix: save balances in the storage on changes
  // useEffect(() => {
  //   storage.add(TOKEN_BALANCES_KEY, tokenBalances)
  // }, [storage, tokenBalances])

  return null
}

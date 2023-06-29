import { useEffect } from 'react'
import { useAppDispatch } from 'state/hooks'
import * as storage from 'lib/services/storage'

import { addTokenBalances } from './actions'
import { useTokenBalances } from './hooks'

const TOKEN_BALANCES_KEY = 'tokenBalances'

export default function Updater(): null {
  const dispatch = useAppDispatch()
  const balances = useTokenBalances()

  // retrieve saved balances on loading
  useEffect(() => {
    const sBalances = storage.get(TOKEN_BALANCES_KEY)

    if (sBalances) {
      dispatch(addTokenBalances(Object.values(sBalances)))
    }
  }, [])

  // @todo fix: save balances in the storage on changes
  useEffect(() => {
    storage.add(TOKEN_BALANCES_KEY, balances)
  }, [storage, balances])

  return null
}

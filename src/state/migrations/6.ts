import { PersistState } from 'redux-persist'
import { UserState } from 'state/user/reducer'

type PersistAppStateV6 = {
  _persist: PersistState
} & { user?: UserState }

export const migration6 = (state: PersistAppStateV6 | undefined) => {
  if (!state) return state

  return {
    ...state,
    user: {
      ...state.user,
      modifiedTokens: {},
      nativeBalance: {},
    },
    _persist: {
      ...state._persist,
      version: 5,
    },
  }
}

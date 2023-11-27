export interface SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
}

export interface ModifiedToken {
  address: string
  balance: string
  weiBalance: string
}

export interface ModifiedTokens {
  [address: string]: ModifiedToken
}

export interface SerializedPair {
  token0: SerializedToken
  token1: SerializedToken
}

export enum SlippageTolerance {
  Auto = 'auto',
}

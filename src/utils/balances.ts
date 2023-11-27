import Big from 'big.js'

type Balance = number | string

type Formats = {
  balance: string
  weiBalance: string
}

export function formatBalance(balance: Balance, decimals: number): Formats {
  const nb = Big(Number(balance)).toFixed()

  return {
    balance: nb,
    weiBalance: Big(nb).mul(Big(10).pow(decimals)).toFixed(),
  }
}

export function addBalance(balance: Balance, amountToAdd: Balance, decimals: number): Formats {
  const nb = Big(Number(balance)).plus(amountToAdd).toFixed(decimals)

  return {
    balance: nb,
    weiBalance: Big(nb).mul(Big(10).pow(decimals)).toFixed(),
  }
}

export function subtractBalance(balance: Balance, amountToSubtract: Balance, decimals: number): Formats {
  let nb = Big(Number(balance)).minus(amountToSubtract).toFixed(decimals)
  if (Big(nb).lt(0)) nb = Big(0).toFixed()

  return {
    balance: nb,
    weiBalance: Big(nb).mul(Big(10).pow(decimals)).toFixed(),
  }
}

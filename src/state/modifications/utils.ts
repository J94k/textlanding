import Big from 'big.js'

type Balance = number | string

type BalanceFormats = {
  balance: string
  weiBalance: string
}

export function getBalanceFormats(balance: Balance, decimals: number): BalanceFormats {
  const newBalance = Big(Number(balance)).toFixed()
  const weiBalance = Big(newBalance).mul(Big(10).pow(decimals)).toFixed()

  return {
    balance: newBalance,
    weiBalance,
  }
}

export function addBalance(balance: Balance, amountToAdd: Balance, decimals: number): BalanceFormats {
  const newBalance = Big(Number(balance)).plus(amountToAdd).toFixed(decimals)
  const weiBalance = Big(newBalance).mul(Big(10).pow(decimals)).toFixed()

  return {
    balance: newBalance,
    weiBalance,
  }
}

export function subtractBalance(balance: Balance, amountToSubtract: Balance, decimals: number): BalanceFormats {
  let newBalance = Big(Number(balance)).minus(amountToSubtract).toFixed(decimals)

  if (Big(newBalance).lt(0)) newBalance = Big(0).toFixed()

  const weiBalance = Big(newBalance).mul(Big(10).pow(decimals)).toFixed()

  return {
    balance: newBalance,
    weiBalance,
  }
}

import Big from 'big.js'
import { Currency} from '@uniswap/sdk-core'
import { TokenBalances } from 'lib/hooks/useTokenList/sorting'

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

export const getBalanceValue = (
  currency: Currency,
  customNativeBalance: { balance: string, weiBalance: string } | null,
  customBalances: { [addr: string]: { balance: string, weiBalance: string } },
  balances: TokenBalances
): string => {
  let v;
  if (currency.isNative && customNativeBalance) {
    v = customNativeBalance.balance;
  } else {
    const balanceKey = currency.isToken ? currency.address : '';
    const customBalanceObj = customBalances[balanceKey];
    v = customBalanceObj?.balance || balances[balanceKey]?.balance || '0';
  }
  return String(v);
};

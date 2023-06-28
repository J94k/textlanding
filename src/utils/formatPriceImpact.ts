import { Percent } from '@uniswap/sdk-core'

export default function formatPriceImpact(priceImpact: Percent) {
  // return `${priceImpact.multiply(-1).toFixed(2)}%`
  return '0.50%'
}

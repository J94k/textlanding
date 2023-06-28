import { useState } from 'react'
import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import { AutoRow } from 'components/Row'
import { ThemedText } from 'theme'
import { useAppDispatch } from 'state/hooks'
import { addTokenBalances } from 'state/modifications/actions'
import { useTokenBalances } from 'state/modifications/hooks'

// @todo move it somewhere else from the component
const EVM_ADDRESS_REGEXP = /^0x[A-Fa-f0-9]{40}$/

const Wrapper = styled.div`
  border: 1px solid blue;
`

export function TokenBalances() {
  const dispatch = useAppDispatch()
  const currentBalances = useTokenBalances()
  const [tokens, setTokens] = useState<
    {
      // @todo add chainId in props
      addr: string
      balance?: number
    }[]
  >(Object.values(currentBalances))

  const [newAddr, setNewAddr] = useState('')
  const [newBalance, setNewBalance] = useState('')

  const onAddrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddr(event.target.value)
  }

  const onBalanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewBalance(event.target.value)
  }

  const onDelete = (dI: number) => {
    setTokens((curState) => curState.filter((_, i) => i !== dI))
  }

  const onAdd = () => {
    if (newAddr.match(new RegExp(EVM_ADDRESS_REGEXP)) && typeof Number(newBalance) === 'number') {
      setTokens((curState) => [
        ...curState,
        {
          addr: newAddr,
          balance: Number(newBalance),
        },
      ])
    }
  }

  const onSave = () => {
    dispatch(addTokenBalances(tokens))
  }

  return (
    <Wrapper>
      <ThemedText.SubHeaderSmall color="primary">
        <Trans>Token balances</Trans>
      </ThemedText.SubHeaderSmall>
      <div>
        {tokens.map(({ addr, balance }, i) => (
          <AutoRow key={addr}>
            <input type="text" defaultValue={addr} disabled />
            <input type="number" defaultValue={balance} disabled />
            <button onClick={() => onDelete(i)}>x</button>
          </AutoRow>
        ))}

        <AutoRow>
          <label>
            Address:
            <input type="text" value={newAddr} required onChange={onAddrChange} />
          </label>
          <label>
            Balance:
            <input
              type="number"
              value={newBalance}
              min={0}
              max={Number.MAX_SAFE_INTEGER}
              required
              onChange={onBalanceChange}
            />
          </label>
        </AutoRow>
      </div>
      <AutoRow>
        <button onClick={onAdd}>Add</button>
        <button onClick={onSave}>Save</button>
      </AutoRow>
    </Wrapper>
  )
}

import { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { shortenAddress } from 'utils'
import { useDefaultActiveTokens } from 'hooks/Tokens'
import { useAppDispatch } from 'state/hooks'
import { addTokenBalances } from 'state/modifications/actions'
import { useTokenBalances } from 'state/modifications/hooks'

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

const StyledLock = styled.div<{ isLocked?: boolean }>`
  ${({ isLocked }) =>
    isLocked &&
    `
    pinter-events: none;
    opacity: 0.5;
  `}
`

const StyledTokensList = styled.div`
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
`

const StyledTokensListRow = styled.div`
  padding: 6px;
  display: flex;
  align-items: center;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.backgroundOutline};
  }

  > *:nth-child(1),
  > *:nth-child(2) {
    width: 45%;
    padding: 0 8px;
  }
`

const StyledLabel = styled.span`
  opacity: 0.6;
`

const StyledInput = styled.input`
  width: 100%;
  padding: 4px 8px;
  font-size: inherit;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  color: inherit;
  background-color: ${({ theme }) => theme.accentTextLightPrimary};

  &:disabled {
    border: none;
    background-color: transparent;
  }
`

const StyledActionButton = styled.button<{ isSecondary?: boolean; isPrimary?: boolean }>`
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: inherit;
  border: none;
  background-color: ${({ isPrimary, isSecondary, theme }) =>
    isPrimary ? theme.accentAction : isSecondary ? theme.accentActionSoft : 'transparent'};
`

const StyledInputZone = styled.div`
  margin: 12px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  input {
    width: 49%;
  }
`

const StyledNotice = styled.div<{ isError?: boolean; isWarning?: boolean }>`
  margin: 12px 0;
  padding: 8px;
  border-radius: 8px;
  font-weight: 600;
  background-color: ${({ theme, isError, isWarning }) =>
    isError ? theme.accentFailure : isWarning ? theme.accentWarning : theme.accentSuccessSoft};
  color: ${({ theme }) => theme.white};
`

const StyledActionZone = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  button {
    width: 49%;
  }
`

export function TokenBalances() {
  const { chainId, account } = useWeb3React()
  const dispatch = useAppDispatch()
  const activeTokens = useDefaultActiveTokens(chainId)
  const currentBalances = useTokenBalances()

  const [currentError, setCurrentError] = useState<string>('')
  const [tokens, setTokens] = useState(
    Object.values(currentBalances).map(({ addr, decimals, balance }) => ({ addr, decimals, balance }))
  )
  const [newAddr, setNewAddr] = useState('')
  const [newBalance, setNewBalance] = useState('')

  // WMatic 0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889 123

  const onAddrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentError('')
    setNewAddr(event.target.value)
  }

  const onBalanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewBalance(event.target.value)
  }

  const onDelete = (dI: number) => {
    setTokens((curState) => curState.filter((_, i) => i !== dI))
  }

  const onAdd = () => {
    if (!newAddr.match(new RegExp(ADDRESS_REGEX))) {
      return setCurrentError('Invalid address')
    }
    if (typeof Number(newBalance) !== 'number') {
      return setCurrentError('Invalid balance')
    }

    const activeToken = activeTokens[newAddr]

    if (!activeToken) {
      return setCurrentError('No such active token')
    }

    setTokens((curState) => [
      ...curState,
      {
        addr: newAddr,
        balance: Number(newBalance),
        decimals: activeToken.decimals,
      },
    ])
    setNewAddr('')
    setNewBalance('')
    setCurrentError('')
  }

  const onSave = () => {
    dispatch(addTokenBalances(tokens))
  }

  return (
    <>
      <ThemedText.SubHeaderSmall color="primary">
        <Trans>Token balances</Trans>
      </ThemedText.SubHeaderSmall>

      <StyledLock isLocked={!account}>
        {!account && <StyledNotice isWarning>First, connect your wallet to set the token balance</StyledNotice>}
        <StyledTokensList>
          <StyledTokensListRow>
            <StyledLabel>Address</StyledLabel>
            <StyledLabel>Balance</StyledLabel>
            <StyledLabel></StyledLabel>
          </StyledTokensListRow>
          {tokens.map(({ addr, balance }: { addr: string; balance?: number }, i) => (
            <StyledTokensListRow key={addr}>
              <StyledInput type="text" defaultValue={shortenAddress(addr)} disabled />
              <StyledInput type="number" defaultValue={balance} disabled />
              <StyledActionButton onClick={() => onDelete(i)}>x</StyledActionButton>
            </StyledTokensListRow>
          ))}
        </StyledTokensList>

        <StyledInputZone>
          <StyledInput type="text" value={newAddr} onChange={onAddrChange} placeholder="Address" required />
          <StyledInput
            type="number"
            value={newBalance}
            min={0}
            max={Number.MAX_SAFE_INTEGER}
            onChange={onBalanceChange}
            placeholder="Balance"
            required
          />
        </StyledInputZone>

        {currentError && <StyledNotice isError>{currentError}</StyledNotice>}

        <StyledActionZone>
          <StyledActionButton onClick={onAdd} isSecondary>
            Add
          </StyledActionButton>
          <StyledActionButton onClick={onSave} isPrimary>
            Save
          </StyledActionButton>
        </StyledActionZone>
      </StyledLock>
    </>
  )
}

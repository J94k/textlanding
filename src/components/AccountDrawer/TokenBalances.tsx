import { useState } from 'react'
import { batch } from 'react-redux'
import { useWeb3React } from '@web3-react/core'
import styled, { css } from 'styled-components/macro'
import { shortenAddress } from 'utils'
import { nativeOnChain } from '../../constants/tokens'
import { useDefaultActiveTokens } from 'hooks/Tokens'
import { useAppDispatch } from 'state/hooks'
import { addNativeBalance, addTokenBalances } from 'state/modifications/actions'
import { useNativeBalance, useChainTokenBalances } from 'state/modifications/hooks'

const StyledWrapper = styled.div`
  margin-bottom: 24px;
`

const StyledLock = styled.div<{ isLocked?: boolean }>`
  ${({ isLocked }) =>
    isLocked &&
    `
    pinter-events: none;
    opacity: 0.5;
  `}
`

const StyledTokensList = styled.div`
  max-height: 500px;
  overflow-y: auto;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
`

const StyledTokensListRow = styled.div<{ isHorizontal?: boolean }>`
  padding: 6px;
  display: flex;
  align-items: center;
  ${({ isHorizontal }) =>
    !isHorizontal &&
    css`
      flex-direction: column;
      align-items: flex-start;
    `}

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.backgroundOutline};
  }
`

const StyledRowHeader = styled.div`
  display: flex;
  align-items: center;
`

const StyledLabel = styled.span<{ isSecondary?: boolean }>`
  min-width: 50%;
  color: ${({ theme, isSecondary }) => (isSecondary ? theme.textSecondary : theme.textPrimary)};
`

const StyledInput = styled.input`
  width: 100%;
  padding: 4px 8px;
  font-size: inherit;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  color: inherit;
  background-color: ${({ theme }) => theme.backgroundInteractive};

  &:disabled {
    border: none;
    background-color: transparent;
  }
`

const StyledSaveButton = styled.button`
  width: 100%;
  margin-top: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: inherit;
  border: none;
  color: ${({ theme }) => theme.white};
  background-color: ${({ theme }) => theme.accentAction};
`

const StyledNotice = styled.div<{ isWarning?: boolean }>`
  margin: 12px 0;
  padding: 8px;
  border-radius: 8px;
  font-weight: 600;
  background-color: ${({ theme, isWarning }) => (isWarning ? theme.accentWarningSoft : theme.accentSuccessSoft)};
  color: ${({ theme, isWarning }) => (isWarning ? theme.accentWarning : theme.white)};
`

export function TokenBalances() {
  const { chainId, account } = useWeb3React()
  const nativeCurrency = nativeOnChain(chainId || -1)
  const dispatch = useAppDispatch()
  const activeTokens = useDefaultActiveTokens(chainId)
  const currentNativeBalance = useNativeBalance(chainId)
  const currentBalances = useChainTokenBalances(chainId)

  const [nativeBalance, setNativeBalance] = useState(currentNativeBalance?.balance || '')
  const [tokens, setTokens] = useState(
    Object.values(activeTokens).reduce((map, { symbol, address, decimals }) => {
      map[address] = {
        symbol,
        addr: address,
        decimals,
        balance: currentBalances[address]?.balance || '0',
      }

      return map
    }, {} as { [addr: string]: { symbol?: string; addr: string; decimals: number; balance: string } })
  )

  const onNativeBalanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNativeBalance(event.target.value)
  }

  const onBalanceChange = (addr: string, balance: string) => {
    const { decimals } = tokens[addr]
    let b = balance.replace(',', '.')

    if (Number(b) % 1 !== 0) {
      const decimalIndex = b.indexOf('.')

      if (decimalIndex !== -1) {
        const enteredDecimals = b.length - decimalIndex - 1

        if (enteredDecimals > decimals) return
      }
    }

    setTokens((curState) => ({
      ...curState,
      [addr]: {
        ...curState[addr],
        balance: b,
      },
    }))
  }

  const onSave = () => {
    if (!chainId) return

    batch(() => {
      dispatch(addNativeBalance({ chainId, balance: nativeBalance }))
      dispatch(addTokenBalances({ chainId, tokenBalances: Object.values(tokens) }))
    })
  }

  return (
    <StyledWrapper>
      {!account && <StyledNotice isWarning>First, connect your wallet to set the custom balances</StyledNotice>}
      <StyledLock isLocked={!account}>
        <StyledTokensList>
          <StyledTokensListRow isHorizontal>
            <StyledLabel>{nativeCurrency?.symbol || 'Native'}</StyledLabel>
            <StyledInput type="number" value={nativeBalance} onChange={onNativeBalanceChange} />
          </StyledTokensListRow>

          {Object.values(tokens)
            .sort((a, b) => Number(a.balance) - Number(b.balance) || a.addr.localeCompare(b.addr))
            .map(({ symbol, addr, balance }) => (
              <StyledTokensListRow key={addr}>
                <StyledRowHeader>
                  <StyledLabel>{symbol}</StyledLabel>
                  <StyledInput
                    type="number"
                    defaultValue={balance}
                    min={0}
                    max={Number.MAX_SAFE_INTEGER}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => onBalanceChange(addr, event.target.value)}
                    required
                  />
                </StyledRowHeader>
                <StyledLabel isSecondary>{shortenAddress(addr)}</StyledLabel>
              </StyledTokensListRow>
            ))}
        </StyledTokensList>
        <StyledSaveButton onClick={onSave}>Save</StyledSaveButton>
      </StyledLock>
    </StyledWrapper>
  )
}

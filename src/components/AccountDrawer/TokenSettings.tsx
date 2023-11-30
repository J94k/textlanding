import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { nativeOnChain } from 'constants/tokens'
import { useDefaultActiveTokens } from 'hooks/Tokens'
import { useEffect, useState } from 'react'
import { TokenFromList } from 'state/lists/tokenFromList'
import { useModifiedTokens, useNativeBalance, useSetModifiedTokens, useSetNativeBalance } from 'state/user/hooks'
// import { ModifiedTokens } from 'state/user/types'
import styled, { css } from 'styled-components'
import { ThemedText } from 'theme/components'
import { shortenAddress } from 'utils'
import { formatBalance } from 'utils/balances'

interface ModifiedTokens {
  [address: string]: {
    address: string
    balance: string
    weiBalance: string
  }
}

const StyledWrapper = styled.div`
  margin-bottom: 24px;
`

const SectionTitle = styled(ThemedText.SubHeader)`
  color: ${({ theme }) => theme.neutral2};
  padding: 24px 0;
`

const StyledTokensList = styled.div`
  max-height: 500px;
  overflow-y: auto;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surface3};
`

const StyledTokensListRow = styled.div<{ isHorizontal?: boolean }>`
  width: 100%;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${({ isHorizontal }) =>
    !isHorizontal &&
    css`
      flex-direction: column;
      align-items: flex-start;
    `}

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.surface3};
  }
`

const StyledLabel = styled.span<{ isSecondary?: boolean }>`
  min-width: 50%;
  margin-right: auto;
`

const StyledInput = styled.input`
  width: 100%;
  padding: 2px 4px;
  font-size: inherit;
  border-radius: 8px;
  color: inherit;
  border: 1px solid ${({ theme }) => theme.surface3};
  background-color: ${({ theme }) => theme.surface3};

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
  color: ${({ theme }) => theme.accent1};
  background-color: ${({ theme }) => theme.accent2};
`

const StyledMessage = styled.p`
  padding: 8px;
`

const validValue = (v: string, d?: number): boolean => {
  const numV = Number(v)

  if (isNaN(numV) || numV > Number.MAX_SAFE_INTEGER) return false

  if (typeof d === 'number') {
    if (numV % 1 === 0) return true

    const decimalIndex = v.indexOf('.')
    if (decimalIndex !== -1) {
      const enteredDecimals = v.length - decimalIndex - 1
      if (enteredDecimals <= d) return true
    }

    return false
  }

  return true
}

const getFirstFiveTokens = (tokens: ModifiedTokens): ModifiedTokens => {
  return Object.keys(tokens)
    .slice(0, 5)
    .reduce((acc, key) => {
      acc[key] = tokens[key]
      return acc
    }, {} as ModifiedTokens)
}

export default function TokenSettings() {
  const { chainId } = useWeb3React()
  const activeTokens = useDefaultActiveTokens(chainId)
  const nativeCurrency = nativeOnChain(chainId ?? -1)
  const stateNativeBalance = useNativeBalance(chainId)
  const setStateNativeBalance = useSetNativeBalance()
  const modifiedTokens = useModifiedTokens(chainId)
  const setModifiedTokens = useSetModifiedTokens()
  const [tokenFilter, setTokenFilter] = useState<string>('')
  const [tokens, setTokens] = useState<ModifiedTokens>(
    Object.values(activeTokens).reduce((map, { address }) => {
      const mt = modifiedTokens?.[address] ?? {
        balance: '',
        weiBalance: '',
      }
      map[address] = {
        address,
        ...mt,
      }
      return map
    }, {} as { [addr: string]: { address: string; balance: string; weiBalance: string } })
  )
  const [filteredTokens, setFilteredTokens] = useState<ModifiedTokens>({})

  console.group('%cTokens', 'color: brown;')
  console.log('activeTokens', activeTokens)
  console.log('tokens', tokens)
  console.groupEnd()

  useEffect(() => {
    const f = tokenFilter.trim().toLowerCase()
    const filtered = Object.values(tokens).filter((token) => {
      const activeToken = activeTokens[token.address]
      if (!activeToken) return

      const { tokenInfo = {} } = activeToken as TokenFromList
      const { symbol = '', name = '' } = tokenInfo as { symbol?: string; name?: string }
      return symbol.includes(f) || name.includes(f) || token.address.toLowerCase().includes(f)
    })
    console.group('%cFilter', 'color: orange;')
    console.log('tokenFilter', tokenFilter)
    console.log('filtered', filtered)
    console.groupEnd()

    setFilteredTokens(
      getFirstFiveTokens(
        filtered.reduce((acc, token) => {
          acc[token.address] = token
          return acc
        }, {} as ModifiedTokens)
      )
    )
  }, [tokenFilter, tokens, activeTokens])

  const [nativeBalance, setNativeBalance] = useState<{
    balance: string
    weiBalance: string
  }>(
    stateNativeBalance ?? {
      balance: '',
      weiBalance: '',
    }
  )

  const onNativeBalanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const b = event.target.value.replace(',', '.')
    if (!validValue(b, 18)) return

    setNativeBalance({ ...formatBalance(b, 18) })
  }

  const onBalanceChange = (addr: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const b = event.target.value.replace(',', '.')
    const { decimals } = activeTokens[addr]

    if (!validValue(b, decimals)) return

    setTokens((s) => ({
      ...s,
      [addr]: {
        ...s[addr],
        ...formatBalance(b, decimals),
      },
    }))
  }

  const onSave = () => {
    if (chainId) {
      setStateNativeBalance(chainId, nativeBalance)
      setModifiedTokens(chainId, tokens)
    }
  }

  let tokensToUse = getFirstFiveTokens(tokens)
  if (tokenFilter && Object.keys(filteredTokens).length > 0) {
    tokensToUse = filteredTokens
  }

  return (
    <StyledWrapper>
      <SectionTitle>
        <Trans>Balance settings</Trans>
      </SectionTitle>

      <StyledTokensList>
        <StyledTokensListRow isHorizontal>
          <StyledLabel>
            <strong>Token filter</strong>
          </StyledLabel>
          <StyledInput
            type="text"
            value={tokenFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTokenFilter(e.target.value)}
          />
        </StyledTokensListRow>

        <StyledTokensListRow isHorizontal>
          <StyledLabel>{nativeCurrency?.symbol || 'Native'}</StyledLabel>
          <StyledInput type="number" value={nativeBalance.balance} onChange={onNativeBalanceChange} />
        </StyledTokensListRow>

        {tokenFilter && Object.keys(filteredTokens).length === 0 ? (
          <StyledMessage>No matches.</StyledMessage>
        ) : (
          Object.keys(tokensToUse)
            .sort((ka, kb) => {
              const kaToken = tokens[ka]
              const kbToken = tokens[kb]
              return Number(kbToken.balance) - Number(kaToken.balance) || kbToken.address.localeCompare(kaToken.address)
            })
            .map((addr) => {
              const t = activeTokens[addr]
              const { balance } = tokens[addr]
              return (
                <StyledTokensListRow key={`${t.chainId}_${t.symbol}_${addr}`}>
                  <div>
                    <StyledLabel>{t.symbol}</StyledLabel> -{' '}
                    <StyledLabel isSecondary>{shortenAddress(addr)}</StyledLabel>
                  </div>
                  <StyledInput
                    type="number"
                    defaultValue={balance}
                    min={0}
                    max={Number.MAX_SAFE_INTEGER}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => onBalanceChange(addr, event)}
                    required
                  />
                </StyledTokensListRow>
              )
            })
        )}
      </StyledTokensList>
      <StyledSaveButton onClick={onSave}>Save</StyledSaveButton>
    </StyledWrapper>
  )
}

import AnimatedDropdown from 'components/AnimatedDropdown'
import Column from 'components/Column'
import React, { PropsWithChildren, ReactElement } from 'react'
import { ChevronDown } from 'react-feather'
import styled from 'styled-components/macro'

import Row, { RowBetween } from '../Row'

const noop = () => {}

const ButtonContainer = styled(Row)<{ isDisabled?: boolean }>`
  justify-content: flex-end;
  width: unset;
  ${({ isDisabled }) => (isDisabled ? '' : 'cursor: pointer;')}
`

const ExpandIcon = styled(ChevronDown)<{ $isOpen: boolean }>`
  color: ${({ theme }) => theme.textSecondary};
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform ${({ theme }) => theme.transition.duration.medium};
`

const Content = styled(Column)`
  padding-top: ${({ theme }) => theme.grids.md};
`

export default function Expand({
  header,
  button,
  children,
  testId,
  isOpen,
  isIconVisible,
  isPossibleToOpen,
  onToggle,
}: PropsWithChildren<{
  header: ReactElement
  button: ReactElement
  testId?: string
  isOpen: boolean
  isIconVisible?: boolean
  isPossibleToOpen?: boolean
  onToggle: () => void
}>) {
  const onExpand = isPossibleToOpen === false ? noop : onToggle

  return (
    <Column>
      <RowBetween>
        {header}
        <ButtonContainer
          data-testid={testId}
          onClick={onExpand}
          aria-expanded={isOpen}
          isDisabled={isPossibleToOpen === false}
        >
          {button}
          {isIconVisible !== false && <ExpandIcon $isOpen={isOpen} />}
        </ButtonContainer>
      </RowBetween>
      <AnimatedDropdown open={isOpen}>
        <Content gap="md">{children}</Content>
      </AnimatedDropdown>
    </Column>
  )
}

import React from 'react'
import styled from 'styled-components'
import { CreateChatButtonIcon } from '../icons/icons'

interface CreateChatButtonProps {
  theme: 'light' | 'dark'
  onClick: () => void
}

const Button = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  &:focus {
    outline: none;
  }
`

const CreateChatButton: React.FC<CreateChatButtonProps> = ({
  theme,
  onClick,
}) => {
  return (
    <Button onClick={onClick}>
      <CreateChatButtonIcon theme={theme} />
    </Button>
  )
}

export default CreateChatButton

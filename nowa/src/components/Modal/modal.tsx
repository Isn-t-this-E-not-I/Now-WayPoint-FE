import React, { ReactNode, useEffect } from 'react'
import styled from 'styled-components'

interface ModalProps {
  isOpen: boolean
  onClose?: () => void
  children?: ReactNode
  showCloseButton?: boolean
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalBox = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 14px;
  position: relative;
  max-width: 65%;
`

const CloseBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 30px;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: lightgray;
`

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose && onClose()
    }
  }

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalBox>
        {children}
      </ModalBox>
      {showCloseButton && <CloseBtn onClick={onClose}>x</CloseBtn>}
    </Overlay>
  )
}

export default Modal

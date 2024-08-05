import React, { useState, ReactNode, useEffect } from 'react'
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
  background-color: lightblue;
  padding: 10px;
  border: 1px solid blue;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
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

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {}

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalBox>
        {showCloseButton && <CloseBtn onClick={onClose}>Close</CloseBtn>}
        {children}
      </ModalBox>
    </Overlay>
  )
}

export default Modal

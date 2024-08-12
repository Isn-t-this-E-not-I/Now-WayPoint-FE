import React, { ReactNode, useEffect } from 'react'
import styled from 'styled-components'
import { FaX } from 'react-icons/fa6'

interface ModalProps {
  isOpen: boolean
  onClose?: () => void
  children?: ReactNode
  showCloseButton?: boolean
  disableOverlayClick?: boolean
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
`

const CloseBtn = styled.button`
  position: absolute;
  top: 25px;
  right: 25px;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: white;
`

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  showCloseButton = true,
  disableOverlayClick = false,
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
    if (!disableOverlayClick && e.target === e.currentTarget && onClose) {
      onClose()
    }
  }

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalBox>{children}</ModalBox>
      {showCloseButton && (
        <CloseBtn onClick={onClose}>
          <FaX />
        </CloseBtn>
      )}
    </Overlay>
  )
}

export default Modal

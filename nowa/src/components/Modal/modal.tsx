import React, { useState, ReactNode, useEffect } from 'react'
import styled from 'styled-components'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children?: ReactNode
  showCloseButton?: boolean
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalBox = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  position: relative;
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
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalBox>
        {children ? (
          children
        ) : (
          <>
            <h3 className="font-bold text-lg">Hello!</h3>
            <p className="py-4">
              Press ESC key or click the button below to close
            </p>
          </>
        )}
        {showCloseButton && (
          <div className="modal-action">
            <button className="btn" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </ModalBox>
    </Overlay>
  )
}

export default Modal
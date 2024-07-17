import React, { ReactNode } from 'react'
import useModal from '@/hooks/modal'
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
  position: relative;
`

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  showCloseButton = true,
}) => {
  const { isOpen: isOpenHook, open, close } = useModal()

  if (!isOpen && !isOpenHook) return null

  return (
    <Overlay>
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
            <button className="btn" onClick={onClose || close}>
              Close
            </button>
          </div>
        )}
      </ModalBox>
    </Overlay>
  )
}

export default Modal

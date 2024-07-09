import React from 'react'
import useModal from '@/hooks/modal'

const Modal: React.FC = () => {
  const { isOpen, open, close } = useModal()

  return (
    <div>
      <button className="btn" onClick={open}>
        Open Modal
      </button>
      <dialog open={isOpen} className="modal">
        {' '}
        // 모달 외부
        <div className="modal-box">
          <h3 className="font-bold text-lg">Hello!</h3>
          <p className="py-4">
            Press ESC key or click the button below to close
          </p>
          <div className="modal-action">
            <button className="btn" onClick={close}>
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}

export default Modal

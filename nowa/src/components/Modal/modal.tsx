import React, { useState } from 'react'
import useModal from '@/hooks/modal'

interface ModalProps {
  id: string
  title: string
  onAddTag: (tag: string) => void
}

const Modal: React.FC<ModalProps> = ({ id, title, onAddTag }) => {
  const { isOpen, open, close } = useModal()
  const [tagInput, setTagInput] = useState('')

  const handleAddTag = () => {
    if (tagInput.trim()) {
      onAddTag(tagInput.trim())
      setTagInput('')
      close()
    }
  }

  return (
    <div>
      <button className="btn" onClick={open} id={id}>
        {title}
      </button>
      <dialog open={isOpen} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">태그 입력</h3>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="태그를 입력하세요"
          />
          <div className="modal-action">
            <button className="btn" onClick={handleAddTag}>
              추가
            </button>
            <button className="btn" onClick={close}>
              닫기
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}

export default Modal

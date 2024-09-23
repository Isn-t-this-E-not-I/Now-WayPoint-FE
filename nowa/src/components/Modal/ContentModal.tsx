import React, { useEffect } from 'react'
import Modal from '../Modal/modal'
import DetailContent from '@/pages/DetailContent/DetailContent'

interface DetailContentModalProps {
  isOpen: boolean
  onClose: () => void
  postId: number | null
  showCloseButton?: boolean
}

const DetailContentModal: React.FC<DetailContentModalProps> = ({
  isOpen,
  onClose,
  postId,
  showCloseButton = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={showCloseButton}>
      {postId !== null && <DetailContent postId={postId} />}
    </Modal>
  )
}

export default DetailContentModal

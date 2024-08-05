import React from 'react'
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
  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={showCloseButton}>
      {postId !== null && <DetailContent postId={postId} />}
    </Modal>
  )
}

export default DetailContentModal

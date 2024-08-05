import React from 'react'
import Modal from '../Modal/modal'
import styled from 'styled-components'
import DetailContent from '@/pages/DetailContent/DetailContent'

interface DetailContentModalProps {
  isOpen: boolean
  onClose: () => void
  postId: number
  showCloseButton?: boolean
}

const DetailContentModal: React.FC<DetailContentModalProps> = ({
  isOpen,
  onClose,
  postId,
  showCloseButton = true,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
      <DetailContent postId={postId} />
    </Modal>
  )
}

export default DetailContentModal

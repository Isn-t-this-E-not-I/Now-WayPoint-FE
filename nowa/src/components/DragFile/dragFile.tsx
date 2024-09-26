import React from 'react'
import { useDrag, useDrop } from 'react-dnd'

interface DraggableFileProps {
  src: string
  index: number
  moveFile: (dragIndex: number, hoverIndex: number) => void
  handleRemoveFile: (index: number) => void
  handlePreviewClick: (src: string) => void
  selectedOption: string
}

const DraggableFile: React.FC<DraggableFileProps> = ({
  src,
  index,
  moveFile,
  handleRemoveFile,
  handlePreviewClick,
  selectedOption,
}) => {
  const ref = React.useRef<HTMLDivElement>(null)

  // Drag source (드래그 시작)
  const [, drag] = useDrag({
    type: 'file',
    item: { index },
  })

  // Drop target (드롭 가능 영역)
  const [, drop] = useDrop({
    accept: 'file',
    canDrop: (item: { index: number }) => item.index !== index,
    hover(item: { index: number }) {
      if (!ref.current) return
      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) return

      moveFile(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  drag(drop(ref)) // 드래그와 드롭 연결

  return (
    <div
      ref={ref}
      className="file_preview_wrapper"
      onClick={() => handlePreviewClick(src)}
    >
      <div className="image_preview_wrapper">
        {selectedOption === 'MP3' && !src.startsWith('data:') ? (
          <div className="audio_preview">{src}</div>
        ) : (
          <img
            id="image_preview"
            src={src}
            alt={`Image Preview ${index + 1}`}
          />
        )}
        <button
          className="remove_image_button"
          onClick={(e) => {
            e.stopPropagation() // 이벤트 전파 방지
            handleRemoveFile(index)
          }}
        >
          <img
            src="https://www.iconarchive.com/download/i103472/paomedia/small-n-flat/sign-delete.1024.png"
            alt="Remove Icon"
          />
        </button>
      </div>
    </div>
  )
}

export default DraggableFile

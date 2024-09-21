import { useDrag, useDrop } from 'react-dnd'
import React, { FC } from 'react'

interface FilePreviewProps {
  file: File
  index: number
  moveFile: (dragIndex: number, hoverIndex: number) => void
  previewSrc: string
}

const FilePreview: FC<FilePreviewProps> = ({
  file,
  index,
  moveFile,
  previewSrc,
}) => {
  const ref = React.useRef<HTMLDivElement>(null)

  // 드래그 시작
  const [, drag] = useDrag({
    type: 'file',
    item: { index },
  })

  // 드롭
  const [, drop] = useDrop({
    accept: 'file',
    hover(item: { index: number }) {
      if (!ref.current) return
      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) return

      // 순서 변경 함수 호출
      moveFile(dragIndex, hoverIndex)
      item.index = hoverIndex // 드래그 아이템의 위치 업데이트
    },
  })

  drag(drop(ref)) // drag와 drop을 ref에 연결

  return (
    <div ref={ref} className="file_preview_wrapper">
      <img id="image_preview" src={previewSrc} alt={`Preview ${index}`} />
      {/* 기타 컴포넌트 */}
    </div>
  )
}

export default FilePreview

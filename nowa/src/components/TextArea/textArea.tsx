import React from 'react'

interface TextArea {
  id: string
}

const textArea: React.FC<TextArea> = ({ id }) => {
  return (
    <div>
      <textarea
        id={id}
        className="textarea textarea-bordered resize-none"
        placeholder="Bio"
      />
    </div>
  )
}

export default textArea

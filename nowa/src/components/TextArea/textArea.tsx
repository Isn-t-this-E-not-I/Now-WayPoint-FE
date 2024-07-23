import React from 'react'

interface TextareaProps {
  id: string
  text: string
}

const Textarea: React.FC<TextareaProps> = ({ id, text }) => {
  return (
    <div>
      <textarea
        id={id}
        className="textarea textarea-bordered resize-none"
        placeholder={text}
      />
    </div>
  )
}

export default Textarea

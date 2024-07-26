import React from 'react'

interface FileInput {
  id: string
}

const fileInput: React.FC<FileInput> = ({ id }) => {
  return (
    <div>
      <input
        id={id}
        type="file"
        className="file-input file-input-bordered w-full max-w-xs"
      />
    </div>
  )
}

export default fileInput

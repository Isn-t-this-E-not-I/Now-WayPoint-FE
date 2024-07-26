// import React from 'react'

// interface TextArea {
//   id: string
// }

// const textArea: React.FC<TextArea> = ({ id }) => {
//   return (
//     <div>
//       <textarea
//         id={id}
//         className="textarea textarea-bordered resize-none"
//         placeholder="Bio"
//       />
//     </div>
//   )
// }

// export default textArea

import React, { ChangeEvent } from 'react'

interface TextAreaProps {
  id: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ id, placeholder, value, onChange, className }) => {
  return (
    <div>
      <textarea
        id={id}
        className={`textarea textarea-bordered resize-none ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default TextArea;
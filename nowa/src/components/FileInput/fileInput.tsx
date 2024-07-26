import React from 'react';

interface FileInputProps {
  id: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileInput: React.FC<FileInputProps> = ({ id, onChange }) => {
  return (
    <div>
      <input
        id={id}
        type="file"
        className="file-input file-input-bordered w-full max-w-xs"
        onChange={onChange}
      />
    </div>
  );
};

export default FileInput;

// import React from 'react'

// interface FileInput {
//   id: string
// }

// const fileInput: React.FC<FileInput> = ({ id }) => {
//   return (
//     <div>
//       <input
//         id={id}
//         type="file"
//         className="file-input file-input-bordered w-full max-w-xs"
//       />
//     </div>
//   )
// }

// export default fileInput

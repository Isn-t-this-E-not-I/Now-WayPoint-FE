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

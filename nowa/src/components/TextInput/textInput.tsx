import React, { ChangeEvent } from 'react'

interface TextInputProps {
  type: string;
  placeholder: string;
  name?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  value?: string | number;
  className?: string;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const TextInput: React.FC<TextInputProps> = ({ type, placeholder, name, onChange, value, className, onKeyDown }) => {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        onChange={onChange}
        value={value}
        onKeyDown={onKeyDown}
        className={`input input-bordered w-full ${className}`}
      />
    </div>
  )
}

export default TextInput;

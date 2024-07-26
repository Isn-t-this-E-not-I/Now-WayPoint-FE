import React from 'react'

interface SelectProps {
  options: string[]
  selectCount: number
}

const Select: React.FC<SelectProps> = ({ options, selectCount }) => {
  return (
    <div>
      {[...Array(selectCount)].map((_, index) => (
        <div key={index}>
          <select className="select select-bordered w-full max-w-xs">
            <option disabled selected>
              Who shot first?
            </option>
            {options.map((option, i) => (
              <option key={i}>{option}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}

export default Select

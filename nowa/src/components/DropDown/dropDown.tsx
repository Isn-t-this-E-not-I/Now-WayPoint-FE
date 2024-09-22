import React from 'react'

interface DropDownProps {
  buttonText: string
  items: string[]
  id: string
  onItemSelect: (item: string) => void
}

const DropDown: React.FC<DropDownProps> = ({
  buttonText,
  items,
  id,
  onItemSelect,
}) => {
  return (
    <div>
      <div
        id="detail_option_dropdown"
        className="dropdown dropdown-hover dropdown-end"
      >
        <div tabIndex={0} role="button" className="btn m-1" id={id}>
          {buttonText}
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-white rounded-box z-[1] w-32 p-2 shadow"
        >
          {items.map((item, index) => (
            <li key={index}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onItemSelect(item)
                }}
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default DropDown

import React from 'react'
import PropTypes from 'prop-types'

const DropDown = ({ buttonText, items }) => {
  return (
    <div>
      <div className="dropdown dropdown-top dropdown-end">
        <div tabIndex={0} role="button" className="btn m-1">
          {buttonText}
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
        >
          {items.map((item, index) => (
            <li key={index}>
              <a>{item}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

DropDown.propTypes = {
  buttonText: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default DropDown

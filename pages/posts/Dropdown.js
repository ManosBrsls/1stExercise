// Dropdown.js
import React, { useState } from 'react';

const Dropdown = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown">
      <button className="dropdown-toggle" onClick={toggleDropdown}>{title}</button>
      {isOpen && <div className="dropdown-menu">{children}</div>}
    </div>
  );
};

export default Dropdown;

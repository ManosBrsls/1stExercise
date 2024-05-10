// Sidebar.js
import React from 'react';
import Link from 'next/link';
import Dropdown from './Dropdown';

const Sidebar2 = () => {
  return (
    <div className="sidebar">
      <button>Menu 1</button>
      <Dropdown title="Dropdown 1">
        <ul>
          <li>Option 1</li>
          <li>Option 2</li>
          <li>Option 3</li>
        </ul>
      </Dropdown>
      <button>Menu 2</button>
      <Dropdown title="Dropdown 2">
        <ul>
          <li>Option A</li>
          <li>Option B</li>
          <li>Option C</li>
        </ul>
      </Dropdown>
      {/* Add more buttons and dropdowns as needed */}
    </div>
  );
};

export default Sidebar2;

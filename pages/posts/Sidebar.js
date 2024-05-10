import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faChartLine, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { faChartColumn } from '@fortawesome/free-solid-svg-icons/faChartColumn';

const Sidebar = () => {
  return (
    <div style={sidebarStyle}>
      <h2 style={{ marginBottom: '1.5em', color: '#fff', textAlign: 'center' }}>TechBioT</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={menuItemStyle}>
          <Link legacyBehavior href="/">
            <a style={linkStyle}>
              <FontAwesomeIcon icon={faHome} style={iconStyle} fontSize={"3.5em"}/>
              Home
            </a>
          </Link>
        </li>
        <li style={menuItemStyle}>
          <Link legacyBehavior href="/Linechart1">
            <a style={linkStyle}>
              <FontAwesomeIcon icon={faChartLine} style={iconStyle} fontSize={"3.5em"} />
              IMS
            </a>
          </Link>
        </li>
        <li style={menuItemStyle}>
          <Link legacyBehavior href="/Heatmap">
            <a style={linkStyle}>
              <FontAwesomeIcon icon={faChartColumn} style={iconStyle} fontSize={"3.5em"}/>
              GC-IMS
            </a>
          </Link>
        </li>
        
      </ul>
    </div>
  );
};

const sidebarStyle = {
  width: '150px',
  height: '800px',
  background: 'linear-gradient(135deg, #4c4c4c, #111)',
  padding: '20px',
  borderRadius: '10px',
  borderRight: '10px solid #333',
  boxShadow: '5px 0px 15px rgba(0, 0, 0, 0.3)',
  transition: 'width 0.3s ease',
};

const menuItemStyle = {
  marginBottom: '40px',
};

const linkStyle = {
  color: '#fff',
  textDecoration: 'none',
  fontSize: '18px',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  padding: '10px',
  borderRadius: '5px',
  transition: 'background-color 0.3s ease',
};

const iconStyle = {
  marginRight: '4px',
};

export default Sidebar;

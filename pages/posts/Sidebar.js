import React, { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faChartLine } from '@fortawesome/free-solid-svg-icons';
import UploadButton from '../UploadButton';
import styles from "../../styles/Home.module.css";



const Sidebar = ({onDataUpload}) => {
  const handleUpload = (timeData, valueData) => {
    console.log('Data uploaded', timeData, valueData);
    onDataUpload(timeData, valueData);
};

const [isDropDownVisible, setDropDownVisible] = useState(false);

const handleIMSClick = (event) => {
    setDropDownVisible(!isDropDownVisible);
};

const handleUploadButtonClick = (event) => {
    event.stopPropagation();
};

  return (
    <div style={sidebarStyle}>
      <h2 style={{ marginBottom: '1.5em', color: '#fff', textAlign: 'center' }}>TechBioT</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li className={styles.menuItemStyle}>                 
          <Link legacyBehavior href="/">
           <a style={linkStyle}>
            <FontAwesomeIcon icon={faHome} style={iconStyle} />
              Home
            </a>
          </Link>
        </li>
        <li className={styles.menuItemStyle} onClick={handleIMSClick}>
          <a style={linkStyle}>
            <FontAwesomeIcon icon={faChartLine} style={iconStyle} />
              IMS
          </a>
          {isDropDownVisible && (
              <div className={styles.dropdownMenu}>
                  <Link legacyBehavior href="/Linechart1">
                      <a className={styles.dropdownItem}>
                          <span style={dropdownTextStyle}>IMS Graph</span>
                          <FontAwesomeIcon icon={faChartLine} style={{ ...dropdownIconStyle, fontSize: '20px', width: '20px', height: '20px' }} />
                      </a>
                  </Link>
                  <a className={styles.dropdownItem} onClick={handleUploadButtonClick}>
                      <span style={dropdownTextStyle}>Upload File</span>
                          <UploadButton onUpload={handleUpload} />
                  </a>
              </div>
            )}
          </li>
        
      </ul>
    </div>
  );
};

const sidebarStyle = {
  width: '150px',
  height: '800px',
  background: 'linear-gradient(135deg, #4c4c4c, #111)',
  padding: '5px',
  borderRadius: '10px',
  borderRight: '10px solid #333',
  boxShadow: '5px 0px 15px rgba(0, 0, 0, 0.3)',
  transition: 'width 0.9s ease',
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
  marginRight: '8px',
};

const dropdownTextStyle = {
  flexGrow: 1,
  display: 'flex',
  alignItems: 'center',
};

const dropdownIconStyle = {
  marginLeft: '8px',
  display: 'flex',
  alignItems: 'center',
  fontSize: '12px', // Attempting to decrease icon size
  width: '12px', // Explicitly setting width
  height: '12px', // Explicitly setting height
};

export default Sidebar;

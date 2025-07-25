"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faChartLine } from '@fortawesome/free-solid-svg-icons';
import IMSUploadButton from '../ImsUploadButton';
import styles from "../../styles/Home.module.css";
import GCIMSUploadButton from '../GcImsUploadButton';


const Sidebar = ({ onIMSDataSelect, onGCIMSDataUpload  }) => {
  
  const [gcimsDatasets, setGcimsDatasets] = useState({});
  const [imsDatasets, setImsDatasets] = useState({});
  const [isIMSVisible, setIMSVisible] = useState(false);
  const [isGCIMSVisible, setGCIMSVisible] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState('auto');

  // Ref to measure the dropdown content width
  const gcImsDropdownRef = useRef(null);

  useEffect(() => {
    // Adjust sidebar width based on content when GC IMS dropdown is visible
    if (isGCIMSVisible && gcImsDropdownRef.current) {
      const dropdownWidth = gcImsDropdownRef.current.scrollWidth;
      setSidebarWidth(Math.max(150, dropdownWidth + 20) + 'px'); // Ensure min width of 150px
    } else {
      setSidebarWidth('auto'); // Reset to auto when dropdown is closed
    }
  }, [isGCIMSVisible, gcimsDatasets]);

  // Handler for IMS file uploads
  const handleIMSUpload = (filename, buffer) => {
    setImsDatasets((prev) => ({
      ...prev,
      [filename]: buffer,
    }));
    // Optionally, pass the updated file list to a parent component
    // onGCIMSDataSelect(Object.keys(gcimsDatasets)); // if needed
  };

  const handleIMSDatasetClick = (filename, chartNumber) => {
    const buffer = imsDatasets[filename];
    // Call the parent's GC IMS selection handler.
    // You might want to pass additional info such as the chart number.
    onIMSDataSelect(buffer, chartNumber, filename);
  };



  const handleIMSClick = () => {
    setIMSVisible(!isIMSVisible);
  };

  const handleGCIMSClick = () => {
    setGCIMSVisible(!isGCIMSVisible);
  };

  return (
    <div style={{ ...sidebarStyle, width: sidebarWidth }}>
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
          {isIMSVisible && (
            <div className={styles.dropdownMenu} ref={gcImsDropdownRef}>
              <Link legacyBehavior href="/LineVis">
                <a className={styles.dropdownItem}>
                  <span style={dropdownTextStyle}>IMS Graph</span>
                  <FontAwesomeIcon icon={faChartLine} style={{ ...dropdownIconStyle, fontSize: '20px', width: '20px', height: '20px' }} />
                </a>
              </Link>
              <a className={styles.dropdownItem} onClick={(e) => e.stopPropagation()}>
                <span style={dropdownTextStyle}>Upload File</span>
                <IMSUploadButton onUpload={handleIMSUpload} />
              </a>
              {/* List uploaded GC IMS files for selection */}
              {Object.keys(imsDatasets).map((filename) => (
                <div key={filename}>
                  <a
                    className={styles.dropdownItem}
                    onClick={() => handleIMSDatasetClick(filename, 1)}
                  >
                    <span style={dropdownTextStyle}>{filename} - Chart 1</span>
                  </a>
                  <a
                    className={styles.dropdownItem}
                    onClick={() => handleIMSDatasetClick(filename, 2)}
                  >
                    <span style={dropdownTextStyle}>{filename} - Chart 2</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </li>
        <li className={styles.menuItemStyle} onClick={handleGCIMSClick}>
          <a style={linkStyle}>
            <FontAwesomeIcon icon={faChartLine} style={iconStyle} />
            GC-IMS
          </a>
          {isGCIMSVisible && (
            <div className={styles.dropdownMenu} ref={gcImsDropdownRef}>
              <Link legacyBehavior href="/HeatmapVis">
                <a className={styles.dropdownItem}>
                  <span style={dropdownTextStyle}>GC-IMS Graph</span>
                  <FontAwesomeIcon icon={faChartLine} style={{ ...dropdownIconStyle, fontSize: '20px', width: '20px', height: '20px' }} />
                </a>
              </Link>
              <a className={styles.dropdownItem} onClick={(e) => e.stopPropagation()}>
                <span style={dropdownTextStyle}>Upload File</span>
                <GCIMSUploadButton onUpload={onGCIMSDataUpload} />
              </a>
            </div>
          )}
        </li>
      </ul>
    </div>
  );
};

const sidebarStyle = {
  minWidth: '150px',
  maxWidth: '300px',
  height: '100vh',
  background: 'linear-gradient(135deg, #4c4c4c, #111)',
  padding: '5px',
  borderRadius: '10px',
  borderRight: '10px solid #333',
  boxShadow: '5px 0px 15px rgba(0, 0, 0, 0.3)',
  overflowY: 'auto',
  position: 'relative',
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
  fontSize: "78px"
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
  fontSize: '12px',
  width: '12px',
  height: '12px',
};

export default Sidebar;

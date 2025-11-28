"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faChartLine } from '@fortawesome/free-solid-svg-icons';
import IMSUploadButton from '../ImsUploadButton';
import styles from "../../styles/Home.module.css";
import GCIMSUploadButton from '../GcImsUploadButton';

const Sidebar = ({ onIMSDataSelect, onGCIMSDataUpload, imsUploadRef }) => {
  const [gcimsDatasets, setGcimsDatasets] = useState({});
  const [imsDatasets, setImsDatasets] = useState({});
  const [isIMSVisible, setIMSVisible] = useState(false);
  const [isGCIMSVisible, setGCIMSVisible] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState('auto');

  const gcImsDropdownRef = useRef(null);

  useEffect(() => {
    if ((isGCIMSVisible || isIMSVisible) && gcImsDropdownRef.current) {
      const dropdownWidth = gcImsDropdownRef.current.scrollWidth;
      setSidebarWidth(Math.max(200, dropdownWidth + 40) + 'px');
    } else {
      setSidebarWidth('auto');
    }
  }, [isGCIMSVisible, isIMSVisible, gcimsDatasets, imsDatasets]);

  // Handler for IMS file uploads
const handleIMSUpload = (filename, buffer, totalCount) => {
  setImsDatasets((prev) => {
    const updated = {
      ...prev,
      [filename]: buffer,
    };

    // AUTO-PLOT if ONLY ONE FILE is uploaded
    if (Object.keys(updated).length === 1 && totalCount === 1) {
      onIMSDataSelect(buffer, 1, filename);
    }

    return updated;
  });
};

  const handleIMSDatasetClick = (filename, chartNumber) => {
    const buffer = imsDatasets[filename];
    onIMSDataSelect(buffer, chartNumber, filename);
  };

  const handleIMSClick = () => setIMSVisible(!isIMSVisible);
  const handleGCIMSClick = () => setGCIMSVisible(!isGCIMSVisible);

  return (
    <div style={{ ...sidebarStyle, width: sidebarWidth }}>
      <h2 style={{ marginBottom: '1.5em', color: '#fff', textAlign: 'center' }}>TeChBioT</h2>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li className={styles.menuItemStyle}>
          <Link legacyBehavior href="/">
            <a style={linkStyle}>
              <FontAwesomeIcon icon={faHome} style={iconStyle} />
              Home
            </a>
          </Link>
        </li>

        {/* ================= IMS MENU ================= */}
        <li className={styles.menuItemStyle} onClick={handleIMSClick}>
          <a style={linkStyle}>
            <FontAwesomeIcon icon={faChartLine} style={iconStyle} />
            IMS
          </a>

          {isIMSVisible && (
            <div className={styles.dropdownMenu} ref={gcImsDropdownRef}>
              
              {/* IMS Graph Link */}
              <Link legacyBehavior href="/LineVis">
                <a className={styles.dropdownItem}>
                  <span style={dropdownTextStyle}>IMS Graph</span>
                  <FontAwesomeIcon icon={faChartLine} style={{ ...dropdownIconStyle, fontSize: '20px', width: '20px', height: '20px' }} />
                </a>
              </Link>

              {/* Upload Button — UPDATED WITH NEW REF */}
              <a className={styles.dropdownItem} onClick={(e) => e.stopPropagation()}>
                <span style={dropdownTextStyle}>Upload File</span>

                {/* ref added here */}
                <IMSUploadButton 
                  ref={imsUploadRef}
                  onUpload={handleIMSUpload}
                />
              </a>

              {/* List uploaded IMS files */}
              {Object.keys(imsDatasets).map((filename) => (
                <div key={filename}>
                  <a
                    className={styles.dropdownItem}
                    onClick={() => handleIMSDatasetClick(filename, 1)}
                  >
                    <span style={fileNameLabelStyle}>{filename} - Chart 1</span>
                  </a>
                  <a
                    className={styles.dropdownItem}
                    onClick={() => handleIMSDatasetClick(filename, 2)}
                  >
                    <span style={fileNameLabelStyle}>{filename} - Chart 2</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </li>

        {/* ================= GC-IMS MENU ================= */}
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


// styles
const sidebarStyle = {
  minWidth: '200px',
  maxWidth: '200px', 
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
  fontSize: '20px',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  padding: '10px',
  borderRadius: '5px',
  transition: 'background-color 0.3s ease',
};

const iconStyle = {
  marginRight: '6px',
  fontSize: '120px',
};

const dropdownTextStyle = {
  flexGrow: 1,
  display: 'flex',
  alignItems: 'center',
};

// new style for filenames
const fileNameLabelStyle = {
  whiteSpace: 'normal',    // allow wrapping
  wordBreak: 'break-all',  // break long strings
  display: 'block',        // block for wrapping
  maxWidth: '100%',
  color: '#fff',
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
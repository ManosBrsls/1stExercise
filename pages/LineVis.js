"use client";
import React, { useState } from 'react';
import ndarray from 'ndarray';
import {
  getDomain, LineVis
} from '@h5web/lib';
import * as jsfive from 'jsfive';
import '@h5web/lib/dist/styles.css';
import Sidebar from "./posts/Sidebar";
import styles from "../styles/Home.module.css";
import { useEffect } from 'react';
import { data } from 'autoprefixer';

function CustomLineVis() {
  const [lineData, setLineData] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [domain, setDomain] = useState(null);
  
  const values = [
    [0, 1, 2],
    [3, 4, 5],
  ];

    const flatValues = values.flat(Infinity);
    const dataArray = ndarray(flatValues, [2,3]);
    console.log("1:",dataArray)
    const newArray = Array.from(dataArray.data)
    console.log("2:", newArray)
  
    const handleSliderChange = (event) => {
      const newIndex = parseInt(event.target.value, 10);
      setSelectedIndex(newIndex);
      // console.log(values)

      const selectedRow = values[newIndex];
      console.log(selectedRow)

      const selectedDataArray = ndarray(selectedRow.slice(), [selectedRow.length]);
      
      const overallDomain = getDomain(dataArray); 
      setDomain(overallDomain);
    
    setLineData(selectedDataArray);
    console.log(`Selected Index: ${selectedIndex}`);
    console.log(`Selected Line Data: ${selectedRow}`);
  };

  return (
    <div className={styles.container2}>
      <div className={styles.card} style={{ borderRadius: "40px", backgroundColor: "#084072", marginLeft: "350px", marginTop: "50px", cursor: "pointer" }}>
        {lineData && (
          <div style={{ display: 'flex', height: '30rem', width: '55rem', backgroundColor: "#084072" }}>
            <LineVis
              key={selectedIndex}
              className={styles.container6}
              dataArray={lineData}
              domain={domain}
              scaleType={'linear'}
              curveType="OnlyLine"
              
            />
          </div>
        )}
            <div style={{ marginTop: '20px' }}>
              <label htmlFor="row-slider" style={{ color: "#fff" }}>Select Row:</label>
              <input
                id="row-slider"
                type="range"
                min="0"
                max={1}
                value={selectedIndex}
                onChange={handleSliderChange}
              />
            </div>
      </div>
    </div>
  );
}

export default CustomLineVis;
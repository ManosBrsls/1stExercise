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

function CustomLineVis() {
  const [heatmapData, setHeatmapData] = useState(null);
  const [realData, setRealData] = useState(null)
  const [domainData, setDomainData] = useState(null);
  const [lineData, setLineData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scaleType, setScaleType] = useState('linear');
  const [showGrid, setShowGrid] = useState(false);

  const handleGCIMSDataUpload = (filename, buffer) => {
    try {

      const h5File = new jsfive.File(buffer);

      const valuesDataset = h5File.get('valuedataset');

      const newvalueDataset = Array.from(valuesDataset.value)

      const dataArray = ndarray(newvalueDataset, newvalueDataset.shape);

      setRealData(dataArray)
      
      const newArray = [];
      
      

      // Use dataArray.shape[0] if you want to iterate over the first dimension
      for (let i = 0; i < dataArray.data.length; i += 10) {
        console.log("Hi!!!!");
        newArray.push(dataArray.data[i]);
      }
      
      console.log('New:', newArray);
      
      const dataArray2 = ndarray(newArray, newArray.shape)

      const domain = getDomain(dataArray2);
      console.log(domain)

      setHeatmapData(dataArray2);
      setDomainData(domain)
      setLineData(dataArray2); // Use the copied line data

    } catch (err) {
      console.error("Error processing file:", err);
      setError('Error processing file.');
    }
  };



  const handleSliderChange = (event) => {
    const newIndex = parseInt(event.target.value, 10);
    setSelectedIndex(newIndex);

    console.log(realData.data.length)

    const newArray2 = []

    for (let i = newIndex; i < realData.data.length; i += 10){
      newArray2.push(realData.data[i])
    }

    const finalArray = ndarray(newArray2, newArray2.shape)

    const newDomain = getDomain(finalArray)
    console.log("NewArray2", newArray2)

    setHeatmapData(finalArray)
    setDomainData(newDomain)


  };

  return (
    <div className={styles.container2}>
      <Sidebar onGCIMSDataUpload={handleGCIMSDataUpload} />
      <div className={styles.card} style={{ borderRadius: "40px", backgroundColor: "#084072", marginLeft: "350px", marginTop: "50px", cursor: "pointer" }}>
        { heatmapData && (
          <div style={{ display: 'flex', height: '30rem', width: '55rem', backgroundColor: "#084072" }}>
            <LineVis
              key={selectedIndex}
              className={styles.container6}
              dataArray={heatmapData}
              domain={domainData}
              scaleType={scaleType}
              curveType="OnlyLine"
              showGrid={showGrid}
            />
          </div>
        )}
              <div style={{ marginTop: '20px' }}>
              <label htmlFor="row-slider" style={{ color: "#fff" }}>Select Row:</label>
              <input
                id="row-slider"
                type="range"
                min="0"
                max="9"
                value={selectedIndex}
                onChange={handleSliderChange}
              />
            </div>
      </div>
    </div>
  );
}

export default CustomLineVis;
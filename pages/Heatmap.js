"use client";

import React, { useState } from 'react';
import ndarray from 'ndarray';
import { HeatmapVis, getDomain, Toolbar, DomainWidget, ColorMapSelector, ScaleSelector, Separator, ToggleBtn, SnapshotBtn } from '@h5web/lib';
import * as jsfive from 'jsfive';
import '@h5web/lib/dist/styles.css';
import Sidebar from "./posts/Sidebar";
import styles from "../styles/Home.module.css";
import { FaTh } from 'react-icons/fa';
import "@fortawesome/fontawesome-svg-core/styles.css";  


function HeatmapUploader() {
  const [heatmapData, setHeatmapData] = useState(null);
  const [error, setError] = useState(null);
  const [customDomain, setCustomDomain] = useState([null, null]);
  const [colorMap, setColorMap] = useState('Viridis');
  const [invertColorMap, setInvertColorMap] = useState(false);
  const [scaleType, setScaleType] = useState('linear');
  const [showGrid, setShowGrid] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      setError("No file selected");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = function(evt) {
        const buffer = evt.target.result;
        const h5File = new jsfive.File(buffer);

        const driftTimeDataset = h5File.get('drift_time').value;
        const retTimeDataset = h5File.get('ret_time').value;
        const valuesDataset = h5File.get('values').value;

        if (!Array.isArray(driftTimeDataset) || !Array.isArray(retTimeDataset) || !Array.isArray(valuesDataset)) {
          throw new Error('One or more datasets are not arrays');
        }

        const driftTime = Array.from(driftTimeDataset);
        const retTime = Array.from(retTimeDataset);
        const values = Array.from(valuesDataset);

        const shape = [retTime.length, driftTime.length];
        const flatValues = values.flat(Infinity);
        const dataArray = ndarray(flatValues, shape);
        const domain = getDomain(dataArray);

        setHeatmapData({ dataArray, domain });
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError(`Failed to process file: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <div className={styles.container2}>
      <Sidebar onDataUpload={handleFileUpload}/>
      <div className={styles.card}
          style={{
            borderRadius: "40px",
            backgroundColor: "#084072",
            marginLeft: "350px",
            marginTop: "50px",
            cursor: "pointer",
          }}
        >
        <input type="file" id="datafile" onChange={handleFileUpload} accept=".hdf5" />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {heatmapData && (
          <div >
            <Toolbar className={styles.container4} >
              <DomainWidget
                customDomain={customDomain}
                dataDomain={heatmapData.domain}
                onCustomDomainChange={setCustomDomain}
                scaleType={scaleType}
                
              />
              <Separator />
              <SnapshotBtn  />
              <Separator />
              <ColorMapSelector
                onInversionChange={setInvertColorMap}
                onValueChange={setColorMap}
                value={colorMap}
                
              />
              <Separator />
              <ScaleSelector
                onScaleChange={setScaleType}
                options={['linear', 'log', 'symlog']}
                value={scaleType}
                
              />
              <Separator />
              <ToggleBtn
                icon={FaTh} 
                label="Grid"
                onToggle={() => setShowGrid(!showGrid)}
                
              />
              <Separator />
            </Toolbar>
            <div  style={{ display: 'flex', height: '30rem', width: '55rem', backgroundColor: "#084072" }}>
              <HeatmapVis
                className={styles.container5}
                dataArray={heatmapData.dataArray} 
                domain={customDomain[0] === null ? heatmapData.domain : customDomain} 
                aspect="auto"
                showGrid={showGrid}
                colorMap={colorMap}
                scaleType={scaleType}
                invertColorMap={invertColorMap}
                interactions={{
                  selectToZoom: {
                    modifierKey: "Shift"
                  },
                  xAxisZoom: false,
                  yAxisZoom: false
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeatmapUploader;

"use client";
import React, { useState } from 'react';
import ndarray from 'ndarray';
import { HeatmapVis, getDomain, Toolbar, DomainWidget, ColorMapSelector, ScaleSelector, Separator, ToggleBtn, SnapshotBtn, LineVis } from '@h5web/lib';
import * as jsfive from 'jsfive';
import '@h5web/lib/dist/styles.css';
import Sidebar from "./posts/Sidebar";
import styles from "../styles/Home.module.css";
import { FaTh, FaWaveSquare } from 'react-icons/fa';
import "@fortawesome/fontawesome-svg-core/styles.css";  

function HeatmapUploader() {
  const [heatmapData, setHeatmapData] = useState(null);
  const [lineData, setLineData] = useState(null); 
  const [error, setError] = useState(null);
  const [customDomain, setCustomDomain] = useState([null, null]);
  const [colorMap, setColorMap] = useState('Viridis');
  const [invertColorMap, setInvertColorMap] = useState(false);
  const [scaleType, setScaleType] = useState('linear');
  const [showGrid, setShowGrid] = useState(false);
  const [viewMode, setViewMode] = useState('heatmap');

  
  const handleGCIMSDataUpload = (filename, buffer) => {
    try {
      
      const h5File = new jsfive.File(buffer);

      const driftTimeDataset = h5File.get('drift_time');
      const retTimeDataset = h5File.get('ret_time');
      const valuesDataset = h5File.get('values');

      
      
      const dataArray = ndarray(valuesDataset.value, valuesDataset.shape);
      const driftTimeArray = ndarray(driftTimeDataset.value, driftTimeDataset.shape);
      const retTimeArray = ndarray(retTimeDataset.value, retTimeDataset.shape);
      
      // Get the domain (min and max values) of the data for scaling the heatmap
      const domain = getDomain(dataArray);
      
      // Store the data and domain in state
      setHeatmapData({ dataArray, domain, driftTimeArray, retTimeArray });

      // Optionally, set default line data (e.g., first row of the heatmap)
      const defaultLineData = dataArray.pick(0, null); 
      setLineData(defaultLineData);

    } catch (err) {
      console.error("Error processing file:", err);
      setError('Error processing file.');
    }
  };

  // // Function to handle line selection (for example, a row from the heatmap)
  // const handleLineSelection = (index) => {
  //   if (heatmapData) {
  //     const selectedLineData = heatmapData.dataArray.pick(index, 550); // Pick the row at 'index'
  //     setLineData(selectedLineData);
  //   }
  // };

  return (
    <div className={styles.container2}>
      <Sidebar onGCIMSDataUpload={handleGCIMSDataUpload} />
      <div className={styles.card}
        style={{
          borderRadius: "40px",
          backgroundColor: "#084072",
          marginLeft: "350px",
          marginTop: "50px",
          cursor: "pointer",
        }}
      >
        {heatmapData && (
          <div>
            <Toolbar className={styles.container4}>
              <DomainWidget
                customDomain={customDomain}
                dataDomain={heatmapData.domain}
                onCustomDomainChange={setCustomDomain}
                scaleType={scaleType}
              />
              <Separator />
              <SnapshotBtn />
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
              <ToggleBtn
                icon={FaWaveSquare} // Icon to toggle between heatmap and line plot
                label="Toggle View"
                onToggle={() => setViewMode(viewMode === 'heatmap' ? 'line' : 'heatmap')}
              />
              <Separator />
            </Toolbar>

            <div style={{ display: 'flex', height: '30rem', width: '55rem', backgroundColor: "#084072" }}>
              {viewMode === 'heatmap' ? (
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
            ) : (viewMode === 'line' && lineData && (
                <LineVis
                  className={styles.container6}
                  dataArray={lineData}
                  domain={[0, 50]}
                  scaleType={scaleType}
                  abscissaParams={{
                    values: heatmapData.driftTimeArray,  // Use drift_time as x-axis for line plot
                    label: 'Drift Time'
                  }}
                />
            )
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default HeatmapUploader;



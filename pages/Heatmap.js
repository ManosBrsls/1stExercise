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
      const driftTimeDataset = h5File.get('drift_time').value;
      const retTimeDataset = h5File.get('ret_time').value;
      const valuesDataset = h5File.get('values').value;

      if (!Array.isArray(driftTimeDataset) || !Array.isArray(retTimeDataset) || !Array.isArray(valuesDataset)) {
        throw new Error('One or more datasets are not arrays');
      }

      const driftTime = Array.from(driftTimeDataset);
      const retTime = Array.from(retTimeDataset);
      const values = Array.from(valuesDataset);

      // console.log(driftTime)
      // console.log(retTime)
      // console.log(values)

      const shape = [retTime.length, driftTime.length];
      console.log(shape)
      const flatValues = values.flat(Infinity);
      
      const dataArray = ndarray(flatValues, shape);
      const domain = getDomain(dataArray);

      console.log(dataArray)
      const firstRowOfValues = values.slice(0, driftTime.length);
      console.log(firstRowOfValues)
      

      setHeatmapData({ dataArray, domain, firstRowOfValues});
    } catch (err) {
      console.error('Failed to process file:', err);
      setError(err.message);
    }
    
  };

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
                  domain={ heatmapData.domain}
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
              ) : (viewMode === 'line'  &&  (
                  <LineVis
                    className={styles.container5}
                    abscissaParams={{
                      values: heatmapData.values,
                      label: 'Drift Time',
                    }}
                    ordinatesParams={[
                      {
                        values: heatmapData.firstRowOfValues,
                        label: 'Retention Time',
                      }
                    ]}
                    dataArray={heatmapData.dataArray}
                    domain={customDomain[0] === null ? heatmapData.domain : customDomain}
                    scaleType={scaleType}
                    curveType="OnlyLine"
                    showErrors={false}
                  />
                )
              )}
            </div>
          </div>
        )}
        {error && <div className={styles.error}>Error: {error}</div>}
      </div>
    </div>
  );
};

export default HeatmapUploader;

"use client";
import  { React, useState } from 'react';
import ndarray from 'ndarray';
import {
  HeatmapVis, getDomain, Toolbar, DomainWidget, ColorMapSelector, ScaleSelector, Separator,
  ToggleBtn, SnapshotBtn, LineVis
} from '@h5web/lib';
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [customDomain, setCustomDomain] = useState([null, null]);
  const [customDomain2, setCustomDomain2] = useState([null, null]);
  const [colorMap, setColorMap] = useState('Viridis');
  const [invertColorMap, setInvertColorMap] = useState(false);
  const [scaleType, setScaleType] = useState('linear');
  const [showGrid, setShowGrid] = useState(false);
  const [viewMode, setViewMode] = useState('heatmap');
  const [lineDomain, setLineDomain] = useState([null, null]);

  


  const handleGCIMSDataUpload = (filename, buffer) => {
  try {
    const h5File = new jsfive.File(buffer);

    const driftTimeDataset = h5File.get('drift_time');
    const retTimeDataset = h5File.get('ret_time');
    const valuesDataset = h5File.get('values');
    
    // Convert valuesDataset to a 2D ndarray directly
    const dataArray = ndarray(valuesDataset.value, valuesDataset.shape);
    
    // Extract other arrays (1D for drift time and retention time)
    const driftTimeArray = ndarray(driftTimeDataset.value, driftTimeDataset.shape);
    const retTimeArray = ndarray(retTimeDataset.value, retTimeDataset.shape);


    const rowDataArray = Array.from(dataArray.data.slice(
      selectedIndex * dataArray.shape[1],
      (selectedIndex + 1) * dataArray.shape[1]
    ));

  
    
    // Set domain based on the overall data range in the 2D array
    const overallDomain = getDomain(dataArray);
    
    //todo fix set line domain
    setLineDomain(getDomain(rowDataArray));
    setCustomDomain(overallDomain);
    
    // Set the 2D data array as heatmap data
    setHeatmapData({dataArray,domain1: overallDomain,retTimeArray,driftTimeArray,});
  
    // Initialize the lineData with the first row of the 2D table
    const initialLineData = dataArray.pick(selectedIndex, null);
    console.log("init:",initialLineData)
    setLineData(initialLineData);

  } catch (err) {
    console.error("Error processing file:", err);
    setError('Error processing file.');
  }
  };
  
const handleSliderChange = (event) => {
  const newIndex = parseInt(event.target.value, 10);
  setSelectedIndex(newIndex);

  // Extract the data for the selected row by slicing manually
  const rowDataArray = Array.from(heatmapData.dataArray.data.slice(
    newIndex * heatmapData.dataArray.shape[1],
    (newIndex + 1) * heatmapData.dataArray.shape[1]
  ));

  // Create a new ndarray for the selected row
  const selectedLineData = ndarray(rowDataArray, [rowDataArray.length]);

  // Update lineData with the newly created row-specific ndarray
  setLineData(selectedLineData);

  // (Optional) Adjust the domain if needed to fit the selected row's range:
  const rowDomain = getDomain(selectedLineData);
  setLineDomain(rowDomain);
  setCustomDomain2(rowDomain);

  console.log("Selected Row Data:", selectedLineData);
};

  return (
    <div className={styles.container2}>
      <Sidebar onGCIMSDataUpload={handleGCIMSDataUpload} />
      <div className={styles.card} style={{ borderRadius: "40px", backgroundColor: "#084072", marginLeft: "350px", marginTop: "50px", cursor: "pointer" }}>
        {heatmapData && (
          <>
            {viewMode === 'heatmap' ? (
              <>
                {/* Heatmap Toolbar */}
                <Toolbar className={styles.container4}>
                  <DomainWidget
                    customDomain={customDomain}
                    dataDomain={heatmapData.domain1}
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
                  <ToggleBtn icon={FaTh} label="Grid" onToggle={() => setShowGrid(!showGrid)} />
                  <Separator />
                  <ToggleBtn icon={FaWaveSquare} label="Toggle View" onToggle={() => setViewMode('line')} />
                </Toolbar>
                <div style={{ display: 'flex', height: '30rem', width: '55rem', backgroundColor: "#084072" }}>
                  <HeatmapVis
                    className={styles.container5}
                    dataArray={heatmapData.dataArray}
                    domain={customDomain[0] === null ? heatmapData.domain1 : customDomain}
                    aspect="auto"
                    showGrid={showGrid}
                    colorMap={colorMap}
                    xLabels={heatmapData.retTimeArray}
                    yLabels={heatmapData.driftTimeArray}
                    scaleType={scaleType}
                    invertColorMap={invertColorMap}
                    interactions={{
                      selectToZoom: { modifierKey: "Shift" },
                      xAxisZoom: false,
                      yAxisZoom: false
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <Toolbar className={styles.container4}>
                  <DomainWidget
                    customDomain={customDomain2}
                    dataDomain={lineDomain}
                    onCustomDomainChange={setCustomDomain2}
                    scaleType={scaleType}
                  />
                  <Separator />
                  <SnapshotBtn />
                  <Separator />
                  <ToggleBtn icon={FaTh} label="Grid" onToggle={() => setShowGrid(!showGrid)} />
                  <Separator />
                  <Separator />
                  <ScaleSelector
                    onScaleChange={setScaleType}
                    options={['linear', 'log', 'symlog']}
                    value={scaleType}
                  />
                  <Separator />
                  <ToggleBtn icon={FaWaveSquare} label="Heatmap View" onToggle={() => setViewMode('heatmap')} />
                </Toolbar>
                <div style={{ display: 'flex', height: '30rem', width: '55rem', backgroundColor: "#084072" }}>
                  <LineVis
                    key={selectedIndex}
                    className={styles.container6}
                    dataArray={lineData}
                    domain={lineDomain}
                    scaleType={'linear'}
                    curveType='OnlyLine'
                    showGrid={showGrid}
                      abscissaParams={{
                      values: heatmapData.driftTimeArray,
                      label: 'Drift Time'
                    }}
                  />
                </div>
              </>
            )}
            <div style={{ marginTop: '20px' }}>
              <label htmlFor="row-slider" style={{ color: "#fff" }}>Select Row:</label>
              <input
                id="row-slider"
                type="range"
                min="0"
                max={heatmapData.dataArray.shape[0] - 1}
                value={selectedIndex}
                onChange={handleSliderChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HeatmapUploader;


  // const handleGCIMSDataUpload = (filename, buffer) => {
  //   try {
  //     const h5File = new jsfive.File(buffer);

  //     const driftTimeDataset = h5File.get('drift_time');
  //     const retTimeDataset = h5File.get('ret_time');
  //     const valuesDataset = h5File.get('values');
      
  //     const valArray = Array.from(valuesDataset.value)

  //     // console.log(valuesDataset.shape)
      
    
  //     const flatValues = valArray.flat(Infinity)

  //     const dataArray = ndarray(flatValues, valuesDataset.shape);

  //     // console.log( dataArray.step(549))
      
  //     // console.log(ndarray(valuesDataset.value))

  //     const driftTimeArray = ndarray(driftTimeDataset.value, driftTimeDataset.shape);
      
  //     const retTimeArray = ndarray(retTimeDataset.value, retTimeDataset.shape);

  //     const domain1 = getDomain(dataArray);

  //     setHeatmapData({ dataArray, domain1, retTimeArray, driftTimeArray,valArray });
  //     setLineData(dataArray.data.slice(selectedIndex, driftTimeArray.data.length));

  //     console.log(ndarray(dataArray.data, [2822, 549]))

  //     const initialLineData = dataArray.pick(selectedIndex, null);
  //     console.log("asd:",initialLineData)
  //     setLineData(initialLineData);
      
  //   } catch (err) {
  //     console.error("Error processing file:", err);
  //     setError('Error processing file.');
  //   }

    
  // };

  // const handleSliderChange = (event) => {
  //   const newIndex = parseInt(event.target.value, 10);
  //   console.log(newIndex)
  //   setSelectedIndex(newIndex)
  //   // const selectedRow = heatmapData.valArray.value[newIndex];
  //   // console.log(selectedRow)
  //   // const selectedDataArray = ndarray(selectedRow.slice(), [selectedRow.length])
    
  //   const selectedRowData = heatmapData.dataArray.value[newIndex].data.slice();
  //   const selectedLineData = ndarray(selectedRowData, [selectedRowData.length]);

  //   // const selectedLineData = heatmapData.dataArray.pick(newIndex, null);

  //   setLineData(selectedLineData); 
    
  //   console.log(selectedLineData); 
  //   console.log(selectedLineData.data); 
    
  // };
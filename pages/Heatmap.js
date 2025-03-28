"use client";
import React, { useState, useRef } from "react";
import ndarray from "ndarray";
import {HeatmapVis, getDomain, Toolbar, DomainWidget, ColorMapSelector, ScaleSelector, Separator, ToggleBtn, LineVis,} from "@h5web/lib";
import * as jsfive from "jsfive";
import "@h5web/lib/dist/styles.css";
import Sidebar from "./posts/Sidebar";
import styles from "../styles/Home.module.css";
import { FaCamera, FaChartArea, FaDownload,  FaMap, FaTh, FaChartLine } from "react-icons/fa";
import "@fortawesome/fontawesome-svg-core/styles.css";
import html2canvas from "html2canvas";


function HeatmapUploader() {
  const [heatmapData, setHeatmapData] = useState(null);
  const [chromData, setChromData] = useState(null)
  const [lineData, setLineData] = useState(null);
  const [chromDomain, setChromDomain] = useState(null);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedIndex2, setSelectedIndex2] = useState(0);
  const [customDomain, setCustomDomain] = useState([null, null]);
  const [customDomain2, setCustomDomain2] = useState([null, null]);
  const [customDomain3, setCustomDomain3] = useState([null, null]);
  const [colorMap, setColorMap] = useState("Viridis");
  const [invertColorMap, setInvertColorMap] = useState(false);
  const [scaleType, setScaleType] = useState("linear");
  const [showGrid, setShowGrid] = useState(false);
  const [viewMode, setViewMode] = useState("heatmap");
  const [lineDomain, setLineDomain] = useState([null, null]);

  const heatmapRef = useRef(null);
  const imsSpectra = useRef(null);
  const chromGram = useRef(null);

  
  const [passwordEntered, setPasswordEntered] = useState(false);
  const [authError, setAuthError] = useState(null);


  const correctCredentials = {
    password: "123", // Replace with your desired password
  };



  const handleGCIMSDataUpload = (filename, buffer) => {

    try {
      const h5File = new jsfive.File(buffer);

      const valuesDataset = h5File.get("spectrumPoints");
      const dataArray = ndarray(valuesDataset.value, valuesDataset.shape);

      

      setChromData(dataArray)


      const chromArray = [];

      console.log(dataArray.shape[1])

      for (let i = 0; i < dataArray.data.length; i += dataArray.shape[1] ) {
        
        chromArray.push(dataArray.data[i]);
      }

      console.log(chromArray) 

      const finalChromArray = ndarray(chromArray, chromArray.shape)
      const chromDomain = getDomain(finalChromArray)

      const rowDataArray = Array.from(
        dataArray.data.slice(
          selectedIndex * dataArray.shape[1],
          (selectedIndex + 1) * dataArray.shape[1]
        )
      );

      const heatMapDomain = getDomain(dataArray);
      setLineDomain(getDomain(rowDataArray));

      const initialLineData = dataArray.pick(selectedIndex, null);
      setLineData(initialLineData);
      
      setCustomDomain(heatMapDomain);

      setHeatmapData({dataArray, domain1: heatMapDomain});

      setChromData(finalChromArray)
      setChromDomain(chromDomain)

    } catch (err) {
      console.error("Error processing file:", err);
      setError("Error processing file.");
    }
   
  };


  const handleDownloadImsCSV = () => {
    if (!lineData || !heatmapData) {
      return;
    }
  
    const { dataArray } = heatmapData;
  
    // Assuming `dataArray` contains drift time values in its second dimension (or another mapping).
    // Replace this logic with the actual way you derive drift times.
    const driftTimeArray = Array.from({ length: dataArray.shape[1] }, (_, index) => index); // Replace with actual drift time calculation.
  
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Drift Time (msec),Intensity Values (counts)\n";
  
    lineData.data.forEach((yValue, index) => {
      const xValue = driftTimeArray[index]; // Use the actual drift time values here.
      csvContent += `${xValue},${yValue}\n`;
    });
  
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Ims_Spectra.csv");
  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSnapshot = () => {
    if (heatmapRef.current) {
      const originalOverflow = heatmapRef.current.style.overflow;
      heatmapRef.current.style.overflow = "visible";

      html2canvas(heatmapRef.current, {
        width: heatmapRef.current.scrollWidth,
        height: heatmapRef.current.scrollHeight,
        scale: 1,
      }).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "heatmap_screenshot.png";
        link.click();

        heatmapRef.current.style.overflow = originalOverflow;
      });
    }
  };

  const handleSnapshotIMS = () => {
    if (imsSpectra.current) {
      const originalOverflow = imsSpectra.current.style.overflow;
      imsSpectra.current.style.overflow = "visible";

      html2canvas(imsSpectra.current, {
        width: imsSpectra.current.scrollWidth,
        height: imsSpectra.current.scrollHeight,
        scale: 1,
      }).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "Ims_Spectra_screenshot.png";
        link.click();

        imsSpectra.current.style.overflow = originalOverflow;
      });
    }
  };


  const handleSnapshotGC = () => {
    if (chromGram.current) {
      const originalOverflow = chromGram.current.style.overflow;
      chromGram.current.style.overflow = "visible";

      html2canvas(chromGram.current, {
        width: chromGram.current.scrollWidth,
        height: chromGram.current.scrollHeight,
        scale: 1,
      }).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "GcChrom_Spectra_screenshot.png";
        link.click();

        chromGram.current.style.overflow = originalOverflow;
      });
    }
  };

    const handleImsSliderChange = (event) => {
      const newIndex = parseInt(event.target.value, 10);
      setSelectedIndex(newIndex);
      console.log(heatmapData.dataArray.shape[0])
      const rowDataArray = Array.from(
        heatmapData.dataArray.data.slice(
          newIndex * heatmapData.dataArray.shape[1],
          (newIndex + 1) * heatmapData.dataArray.shape[1]
        )
      );
      // console.log(rowDataArray)
      const selectedLineData = ndarray(rowDataArray, [rowDataArray.length]);
      console.log(selectedLineData)
      setLineData(selectedLineData);
  
      const rowDomain = getDomain(selectedLineData);
      setLineDomain(rowDomain);
      setCustomDomain2(rowDomain);
    };

      const handleGcSliderChange = (event) => {
        const newArray = []
        const newIndex2 = parseInt(event.target.value, 10);
        setSelectedIndex2(newIndex2);
    
        for (let i = newIndex2; i < heatmapData.dataArray.data.length; i += heatmapData.dataArray.shape[1]) {
            
          newArray.push(heatmapData.dataArray.data[i]);
        }
    
        const selectedColumnData = ndarray(newArray, newArray.shape);
        setChromData(selectedColumnData);
    
        const columnDomain = getDomain(selectedColumnData);
        setChromDomain(columnDomain)
        setCustomDomain3(columnDomain)
    
      };


  const handleDownloadChromCSV = () => {
    if (!chromData) {
      return;
    }
  
    // Create CSV data from chromData
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header with drift times
    csvContent += `Retention Time, Intensity Values\n`;
  
    // Add each data point in chromData
    chromData.data.forEach((value, index) => {
      const retTime = heatmapData.retTimeArray.get(index);
      csvContent += `${retTime}, ${value}\n`;
    });
  
    // Create a downloadable link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ChromSpectra.csv");
  
    // Simulate click to start download
    link.click();
  };



  const handleViewChange = (newView) => {
    if (!passwordEntered) {
     
      const enteredPassword = prompt("Enter your password:");

      if (
       
        enteredPassword === correctCredentials.password
      ) {
        setPasswordEntered(true);
        setViewMode(newView);
        setAuthError(null);
      } else {
        setAuthError("Incorrect username or password. Access denied.");
      }
    } else {
      setViewMode(newView);
    }
  };



  return (
    <div className={styles.container2}>
      <Sidebar onGCIMSDataUpload={handleGCIMSDataUpload} />
      <div
        className={styles.card}
        style={{borderRadius: "40px", backgroundColor: "#084072", marginLeft: "200px", cursor: "pointer"}}
      >
        {heatmapData && (
          <>
            {viewMode === "heatmap" ? (
              <>
                <Toolbar className={styles.container4}>
                  <DomainWidget
                    className={styles.container4}
                    customDomain={customDomain}
                    dataDomain={heatmapData.domain1}
                    onCustomDomainChange={setCustomDomain}
                    scaleType={scaleType}
                  />
                  <Separator />
                  <ColorMapSelector
                    className={styles.container4}
                    onInversionChange={() => setInvertColorMap(!invertColorMap)}
                    onValueChange={setColorMap}
                    value={colorMap}
                  />
                  <Separator />
                  <ToggleBtn
                    icon={FaCamera}
                    label="Snap Shot"
                    onToggle={() => handleSnapshot()}
                  >
                  </ToggleBtn>
                  <Separator />
                  <ScaleSelector
                    className={styles.container4}
                    onScaleChange={setScaleType}
                    options={["linear", "log", "symlog"]}
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
                    icon={FaChartArea}
                    label="IMS Spectra"
                    onToggle={() => handleViewChange("imsSpectra")}
                  />
                  <Separator />
                  <ToggleBtn
                    icon={FaChartLine}
                    label="Chrom Spectra"
                    onToggle={() => handleViewChange("chromSpectra")}
                  />
                </Toolbar>
                {authError && <p style={{ color: "red" }}>{authError}</p>}
                <div ref={heatmapRef} style={{display: "flex", height: "40rem", width: "75rem", backgroundColor: "#084072", fontSize: 19}}>
                  <HeatmapVis
                    ref={heatmapRef}
                    className={styles.container5}
                    dataArray={heatmapData.dataArray}
                    domain={customDomain[0] === null  ? heatmapData.domain1 : customDomain}
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
                      yAxisZoom: false,
                    }}
                    abscissaParams={{label: 'Drift Time (msec)'}}
                    ordinateParams={{label: 'Retention Time (sec)'}}
                  />
                </div>
              </>
            ) : viewMode === "imsSpectra" ? (
              <>
                <Toolbar className={styles.container4}>
                  <DomainWidget
                    customDomain={customDomain2}
                    dataDomain={lineDomain}
                    onCustomDomainChange={setCustomDomain2}
                    scaleType={scaleType}
                  />
                  <Separator />
                  <ToggleBtn
                    icon={FaCamera}
                    label="Snap Shot"
                    onToggle={() => handleSnapshotIMS()}
                  >
                  </ToggleBtn>
                  <Separator />
                  <ToggleBtn
                    icon={FaTh}
                    label="Grid"
                    onToggle={() => setShowGrid(!showGrid)}
                  />
                  <Separator />
                  <ToggleBtn
                    icon={FaMap}
                    label="Heatmap View"
                    onToggle={() => setViewMode("heatmap")}
                  />
                  <Separator />
                  <ToggleBtn
                    icon={FaChartLine}
                    label="Chrom Spectra"
                    onToggle={() => setViewMode("chromSpectra")}
                  />
                  <Separator />
                  <ToggleBtn
                    icon={FaDownload}
                    label="Download CSV"
                    onToggle={() => handleDownloadImsCSV()}
                  >          
                  </ToggleBtn>
                </Toolbar>
                <div ref={imsSpectra} style={{display: "flex", height: "40rem", width: "75rem", backgroundColor: "#084072", fontSize: 19}}>
                  <LineVis
                    className={styles.container6}
                    dataArray={lineData}
                    domain={lineDomain}
                    scaleType={"linear"}
                    curveType="OnlyLine"
                    showGrid={showGrid}
                    title="IMS Spectra Graph"
                    abscissaParams={{label: "Drift Time (msec)"}}
                    ordinateLabel="Intensity Values (counts)"
                  />
                </div>

                <div style={{ marginTop: "8px" }}>
                  <label htmlFor="row-slider" style={{ color: "#fff", fontSize: 18 }}>
                    Select Retention time:
                  </label>
                  <input
                    id="row-slider"
                    type="range"
                    min="0"
                    max={heatmapData.dataArray.shape[0] - 1}
                    value={selectedIndex}
                    onChange={handleImsSliderChange}
                  />
                  <span style={{ color: "#fff", marginLeft: "10px" , fontSize: 20}}>
                    {selectedIndex}
                  </span> 
                </div>
              </>
            ) : viewMode === "chromSpectra" ? (
              <>
              <Toolbar className={styles.container4}>
                  <DomainWidget
                    customDomain={customDomain3}
                    dataDomain={chromDomain}
                    onCustomDomainChange={setCustomDomain3}
                    scaleType={scaleType}
                  />
                  <Separator />
                  <ToggleBtn
                    icon={FaCamera}
                    label="Snap Shot"
                    onToggle={() => handleSnapshotGC()}
                  >
                  </ToggleBtn>
                  <Separator />
                  <ToggleBtn
                    icon={FaTh}
                    label="Grid"
                    onToggle={() => setShowGrid(!showGrid)}
                  />
                  <Separator />
                  <ToggleBtn
                    icon={FaMap}
                    label="Heatmap View"
                    onToggle={() => setViewMode("heatmap")}
                  />
                  <Separator />
                  <ToggleBtn
                    icon={FaChartArea}
                    label="IMS Spectra"
                    onToggle={() => setViewMode("imsSpectra")}
                  />
                  <Separator />
                  <ToggleBtn
                    icon={FaDownload}
                    label="Download CSV"
                    onToggle={() => handleDownloadChromCSV()}
                  >          
                  </ToggleBtn>
                </Toolbar>
                <div ref={chromGram} style={{display: "flex", height: "40rem", width: "76rem", backgroundColor: "#084072", fontSize: 19}}>
                  <LineVis
                    className={styles.container6}
                    dataArray={chromData}
                    domain={chromDomain}
                    scaleType={"linear"}
                    curveType="OnlyLine"
                    showGrid={showGrid}
                    
                    title="Gc Chromatogram Graph"
                    abscissaParams={{label: "Retention Time (sec)"}}
                    ordinateLabel="Intensity Values (counts)"
                  />
                </div>
                <div style={{ marginTop: "8px" }}>
                  <label htmlFor="column-slider" style={{ color: "#fff" , fontSize: 18}}>
                    Select Drift time:
                  </label>
                  <input
                    id="column-slider"
                    type="range"
                    min="0"
                    max={heatmapData.dataArray.shape[1] - 1}
                    value={selectedIndex2}
                    onChange={handleGcSliderChange}
                  />
                  <span style={{ color: "#fff", marginLeft: "10px", fontSize: 20 }}>
                    {selectedIndex2}
                  </span>
                </div>
              </>
            )         
        : viewMode === "null" ()}</>
        )}
      </div>
    </div>
  );
}


export default HeatmapUploader;
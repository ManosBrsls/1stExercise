"use client";
import React, { useState, useRef } from "react";
import ndarray from "ndarray";
import {HeatmapVis, getDomain, Toolbar, DomainWidget, ColorMapSelector, ScaleSelector, Separator, ToggleBtn, LineVis,} from "@h5web/lib";
import * as jsfive from "jsfive";
import "@h5web/lib/dist/styles.css";
import Sidebar from "./posts/Sidebar";
import styles from "../styles/Home.module.css";
import { FaCamera, FaChartArea, FaDownload,  FaMap, FaTh } from "react-icons/fa";
import "@fortawesome/fontawesome-svg-core/styles.css";
import html2canvas from "html2canvas";


function HeatmapUploader() {
  const [heatmapData, setHeatmapData] = useState(null);
  const [chromData, setChromData] = useState(null)
  const [lineData, setLineData] = useState(null);
  const [chromDomain, setChromDomain] = useState(null);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [customDomain, setCustomDomain] = useState([null, null]);
  const [customDomain2, setCustomDomain2] = useState([null, null]);
  const [colorMap, setColorMap] = useState("Viridis");
  const [invertColorMap, setInvertColorMap] = useState(false);
  const [scaleType, setScaleType] = useState("linear");
  const [showGrid, setShowGrid] = useState(false);
  const [viewMode, setViewMode] = useState("heatmap");
  const [lineDomain, setLineDomain] = useState([null, null]);

  const heatmapRef = useRef(null);
  const imsSpectra = useRef(null);
  const chromGram = useRef(null)

  const handleGCIMSDataUpload = (filename, buffer) => {
    try {
      const h5File = new jsfive.File(buffer);

      const driftTimeDataset = h5File.get("drift_time");
      const retTimeDataset = h5File.get("ret_time");
      const valuesDataset = h5File.get("values");


      const newvalueDataset = Array.from(valuesDataset.value)
      const dataArray2 = ndarray(newvalueDataset, newvalueDataset.shape);
      setChromData(dataArray2)

      const chromArray = [];

      for (let i = 0; i < dataArray2.data.length; i += 549) {
        console.log("Hi!!!!");
        chromArray.push(dataArray2.data[i]);
      }
      
      const finalChromArray = ndarray(chromArray, chromArray.shape)
      const chromDomain = getDomain(finalChromArray)

      const dataArray = ndarray(valuesDataset.value, valuesDataset.shape);
      const driftTimeArray = ndarray(driftTimeDataset.value, driftTimeDataset.shape);
      const retTimeArray = ndarray(retTimeDataset.value, retTimeDataset.shape);

      const rowDataArray = Array.from(
        dataArray.data.slice(
          selectedIndex * dataArray.shape[1],
          (selectedIndex + 1) * dataArray.shape[1]
        )
      );

      const heatMapDomain = getDomain(dataArray);
      setLineDomain(getDomain(rowDataArray));
      setCustomDomain(heatMapDomain);

      setHeatmapData({dataArray, domain1: heatMapDomain, retTimeArray, driftTimeArray,});

      const initialLineData = dataArray.pick(selectedIndex, null);
      setLineData(initialLineData);
      setChromData(finalChromArray)
      setChromDomain(chromDomain)


    } catch (err) {
      console.error("Error processing file:", err);
      setError("Error processing file.");
    }
  };

  const handleDownloadCSV = () => {
    if (!lineData) {
      return;
    }

    // Create CSV data from lineData
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add header with drift times
    csvContent += `Drift Time, Intensity Values\n`;

    // Add each data point in lineData
    lineData.data.forEach((value, index) => {
      const driftTime = heatmapData.driftTimeArray.get(index);
      csvContent += `${driftTime}, ${value}\n`;
    });

    // Create a downloadable link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Ims Spectra.csv");

    // Simulate click to start download
    link.click();
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

  const handleSliderChange = (event) => {
    const newIndex = parseInt(event.target.value, 10);
    setSelectedIndex(newIndex);

    const rowDataArray = Array.from(
      heatmapData.dataArray.data.slice(
        newIndex * heatmapData.dataArray.shape[1],
        (newIndex + 1) * heatmapData.dataArray.shape[1]
      )
    );

    const selectedLineData = ndarray(rowDataArray, [rowDataArray.length]);
    setLineData(selectedLineData);

    const rowDomain = getDomain(selectedLineData);
    setLineDomain(rowDomain);
    setCustomDomain2(rowDomain);
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
                    onToggle={() => setViewMode("line")}
                  />
                </Toolbar>
                <div ref={heatmapRef} style={{display: "flex", height: "45rem", width: "80rem", backgroundColor: "#084072"}}>
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
                    abscissaParams={{label: 'Drift Time'}}
                    ordinateParams={{label: 'Retention Time'}}
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
                    icon={FaDownload}
                    label="Download CSV"
                    onToggle={() => handleDownloadCSV()}
                  >          
                  </ToggleBtn>
                </Toolbar>
                <div ref={imsSpectra} style={{display: "flex", height: "45rem", width: "80rem", backgroundColor: "#084072"}}>
                  <LineVis
                    className={styles.container6}
                    dataArray={lineData}
                    domain={lineDomain}
                    scaleType={"linear"}
                    curveType="OnlyLine"
                    showGrid={showGrid}
                    abscissaParams={{
                      values: heatmapData.driftTimeArray,
                      label: "Drift Time",
                    }}
                    ordinateParams={{
                      values: heatmapData.dataArray,
                      label: 'Intensity Values'
                    }}
                  />
                </div>

                <div style={{ marginTop: "8px" }}>
                  <label htmlFor="row-slider" style={{ color: "#fff" }}>
                    Select Retention time:
                  </label>
                  <input
                    id="row-slider"
                    type="range"
                    min="0"
                    max={heatmapData.dataArray.shape[0] - 1}
                    value={selectedIndex}
                    onChange={handleSliderChange}
                  />
                  <span style={{ color: "#fff", marginLeft: "10px" }}>
                    {selectedIndex}
                  </span>
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
                    icon={FaDownload}
                    label="Download CSV"
                    onToggle={() => handleDownloadCSV()}
                  >          
                  </ToggleBtn>
                </Toolbar>
                <div ref={chromGram} style={{display: "flex", height: "45rem", width: "80rem", backgroundColor: "#084072"}}>
                  <LineVis
                    className={styles.container6}
                    dataArray={chromData}
                    domain={chromDomain}
                    scaleType={"linear"}
                    curveType="OnlyLine"
                    showGrid={showGrid}
                    abscissaParams={{
                      values: heatmapData.driftTimeArray,
                      label: "Drift Time",
                    }}
                    ordinateParams={{
                      values: heatmapData.dataArray,
                      label: 'Intensity Values'
                    }}
                  />
                </div>
              </>
            )          
        }</>
        )}
      </div>
    </div>
  );
}

export default HeatmapUploader;

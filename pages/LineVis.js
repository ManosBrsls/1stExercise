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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [customDomain, setCustomDomain] = useState([null, null]);
  const [error, setError] = useState(null);
  const [colorMap, setColorMap] = useState("Viridis");
  const [invertColorMap, setInvertColorMap] = useState(false);
  const [scaleType, setScaleType] = useState("linear");
  const [showGrid, setShowGrid] = useState(false);
  const [viewMode, setViewMode] = useState("heatmap");
  const heatmapRef = useRef(null);

  const handleGCIMSDataUpload = (filename, buffer) => {

    try {
      const h5File = new jsfive.File(buffer);

      // const driftTimeDataset = h5File.get("drift_time");
      // const retTimeDataset = h5File.get("ret_time");
      const valuesDataset = h5File.get("spectrumPoints");

      console.log(valuesDataset)


      const newvalueDataset = Array.from(valuesDataset.value)
      console.log(newvalueDataset)
  
      const dataArray = ndarray(valuesDataset.value, valuesDataset.shape);
      // const driftTimeArray = ndarray(driftTimeDataset.value, driftTimeDataset.shape);
      // const retTimeArray = ndarray(retTimeDataset.value, retTimeDataset.shape);

      const rowDataArray = Array.from(
        dataArray.data.slice(
          selectedIndex * dataArray.shape[1],
          (selectedIndex + 1) * dataArray.shape[1]
        )
      );

      const heatMapDomain = getDomain(dataArray);
      
      setCustomDomain(heatMapDomain);

      setHeatmapData({dataArray, domain1: heatMapDomain});


     


    } catch (err) {
      console.error("Error processing file:", err);
      setError("Error processing file.");
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
                    onToggle={() => setViewMode("imsSpectra")}
                  />
                  <Separator />
                  <ToggleBtn
                    icon={FaChartLine}
                    label="Chrom Spectra"
                    onToggle={() => setViewMode("chromSpectra")}
                  />
                </Toolbar>
                <div ref={heatmapRef} style={{display: "flex", height: "40rem", width: "75rem", backgroundColor: "#084072", fontSize: 19}}>
                  <HeatmapVis
                    ref={heatmapRef}
                    className={styles.container5}
                    dataArray={heatmapData.dataArray}
                    domain={customDomain[0] === null  ? heatmapData.domain1 : customDomain}
                    aspect="auto"
                    showGrid={showGrid}
                    colorMap={colorMap}
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
            ) :  viewMode === "null" ()}</>
        )}
      </div>
    </div>
  );
}


export default HeatmapUploader;


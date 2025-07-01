"use client";
import React, { useState, useRef, useEffect } from "react";
import ndarray from "ndarray";
import { HeatmapVis, getDomain, Toolbar, DomainWidget, ColorMapSelector, ScaleSelector, Separator, VisCanvas, ToggleBtn, LineVis } from "@h5web/lib";
import { h5wasmReady, FS, File, configure } from "h5wasm";
import "@h5web/lib/dist/styles.css";
import Sidebar from "./posts/Sidebar";
import styles from "../styles/Home.module.css";
import { FaCamera, FaChartArea, FaDownload, FaMap, FaTh, FaChartLine } from "react-icons/fa";
import "@fortawesome/fontawesome-svg-core/styles.css";
import html2canvas from "html2canvas";


function HeatmapUploader() {

  const [titleName, setTitleName] = useState("GC-IMS Heatmap");
  const [heatmapData, setHeatmapData] = useState(null);
  const [heatmapDomain, setHeatmapDomain] = useState(null);
  const [retentionTimes, setRetentionTimes] = useState([null]);
  const [driftTimes, setDriftTimes] = useState([null]);
  const [customDomain, setCustomDomain] = useState([null, null]);
  const [invertColorMap, setInvertColorMap] = useState(false);

  const [error, setError] = useState(null);
  
  const [scaleType, setScaleType] = useState("linear");
  const [colorMap, setColorMap] = useState("Turbo");
  const [showGrid, setShowGrid] = useState(false);
  const [viewMode, setViewMode] = useState("heatmap");


  // store both polarity datasets
  const [dataArray0, setDataArray0] = useState(null);
  const [dataArray1, setDataArray1] = useState(null);
  const [domain0, setDomain0] = useState(null);
  const [domain1, setDomain1] = useState(null);
  const [driftTimes0, setDriftTimes0] = useState(null);
  const [driftTimes1, setDriftTimes1] = useState(null);
  const [retentionTimes0, setRetentionTimes0] = useState(null);
  const [retentionTimes1, setRetentionTimes1] = useState(null);
  const [currentPolarity, setCurrentPolarity] = useState(0); // default to 0


  const heatmapRef = useRef(null);


  const [passwordEntered, setPasswordEntered] = useState(false);
  const [authError, setAuthError] = useState(null);
  
  
  const correctCredentials = {
      password: "123", // Replace with your desired password
  };



  const handleGCIMSDataUpload = async (filename, buffer) => {

    try {
      // await configure({ memorySize: 2 ** 28 });
      await h5wasmReady;

      // Mount the buffer into the WASM virtual filesystem
      const filePath = `/tmp/${filename}`;
      const data = new Uint8Array(buffer);
      FS.writeFile(filePath, data);
      // Now open the file using its path
      const h5File = new File(filePath, "r");

      setTitleName(filename);

      const pointsDataset = h5File.get("spectrumPoints");
      const metadaDataset = h5File.get("spectrumMetadata");
      const headerDataset = h5File.get("spectrumHeader");

      const spectrumHeader = ndarray(headerDataset.value, headerDataset.shape);
      const spectrumMetadata = ndarray(metadaDataset.value, metadaDataset.shape);
      const spectrumPoints = ndarray(pointsDataset.value, pointsDataset.shape);

      const slope1 = spectrumHeader.data[0][9];
      const offset1 = spectrumHeader.data[0][10];
      const slope2 = spectrumHeader.data[0][11];
      const offset2 = spectrumHeader.data[0][12];
      const sample_delay = spectrumHeader.data[0][1];
      const sample_distance = spectrumHeader.data[0][2];
      const period = spectrumHeader.data[0][8];
      const average = spectrumHeader.data[0][4];

      const polarity = []
      const gain = spectrumMetadata.data[0][4];

      const transposedPoints = ndarray(new Float32Array(spectrumPoints.shape[0] * spectrumPoints.shape[1]), [spectrumPoints.shape[1], spectrumPoints.shape[0]]);

      for (let i = 0; i < spectrumPoints.shape[0]; i++) {
        for (let j = 0; j < spectrumPoints.shape[1]; j++) {
          transposedPoints.set(j, i, spectrumPoints.get(i, j));
        }
      }


      for (let i = 0; i < spectrumHeader.size; i++) {
        polarity.push(spectrumHeader.data[i][0]);
      }

      const filteredSpectrum = transposedPoints;
      console.log(filteredSpectrum)

      const driftTimes = [];
      const retentionTimes = [];
      const nRows = filteredSpectrum.shape[0];
      const nCols = filteredSpectrum.shape[1];

      for (let i = 0; i < nRows; i++) {
        driftTimes[i] = (sample_delay + i * sample_distance) / 1000000;
      }
   
      for (let i = 0; i < nCols; i++) {
        retentionTimes[i] = i * average * period / 1000000000;
      }
     
    const ionCurrent = ndarray(new Float32Array(nRows * nCols),[nRows, nCols]);

    for (let i = 0; i < nRows; i++) {
      for (let j = 0; j < nCols; j++) {
        const raw = filteredSpectrum.get(i, j);
        const polarityVal = polarity[j];
        const slope = polarityVal === 0 ? slope1 : slope2;
        const offset = polarityVal === 0 ? offset1 : offset2;
        const calibrated = raw * slope + offset;
        ionCurrent.set(i, j, calibrated / gain);
      }
    }

    console.log(ionCurrent)

    




    } catch (err) {
      console.error("Error processing file:", err);
      setError("Error processing file.");
    }

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


return (
<div className={styles.container2}>
  <Sidebar onGCIMSDataUpload={handleGCIMSDataUpload} />
    <div
      className={styles.card}
      style={{borderRadius: "40px", backgroundColor: "#084072", marginLeft: "200px", cursor: "pointer"}}
    >
      {heatmapData && heatmapDomain ? (
        <>
          <Toolbar className={styles.container4}>
              <ToggleBtn
                icon={FaCamera}
                label="Snap Shot"
                onToggle={() => handleSnapshot()}
              >
              </ToggleBtn>
              <Separator />
              <ToggleBtn
                icon={FaTh}
                label="Grid"
                onToggle={() => setShowGrid(!showGrid)}
              />
              <Separator />
  
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
        ) : (
          <p>Please upload a GC‑IMS .h5 file to render the heatmap.</p>
        )}
    </div>
  </div>
  );
}


export default HeatmapUploader;
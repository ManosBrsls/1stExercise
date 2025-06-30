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
      const user_calibration = true

      const transposedPoints = ndarray(new Float32Array(spectrumPoints.shape[0] * spectrumPoints.shape[1]), [spectrumPoints.shape[1], spectrumPoints.shape[0]]);

      for (let i = 0; i < spectrumPoints.shape[0]; i++) {
        for (let j = 0; j < spectrumPoints.shape[1]; j++) {
          transposedPoints.set(j, i, spectrumPoints.get(i, j));
        }
      }


      const numRows = transposedPoints.shape[0];
      const numCols = transposedPoints.shape[1];
      let countPol0 = 0;
      let countPol1 = 0;



      for (let i = 0; i < spectrumHeader.size; i++) {
        polarity.push(spectrumHeader.data[i][0]);
      }


      for (let j = 0; j < numCols; j++) {
        if (polarity[j] === 0) {
          countPol0++;
        } else if (polarity[j] === 1) {
          countPol1++;
        }
      }

      const data0 = new Float32Array(countPol0 * numRows);
      const data1 = new Float32Array(countPol1 * numRows);

      const filteredSpectrum0 = ndarray(data0, [numRows, countPol0]);
      const filteredSpectrum1 = ndarray(data1, [numRows, countPol1]);
      
      console.log("Filtered Spectrum 0 shape:", filteredSpectrum0);

      let colIndex0 = 0;
      let colIndex1 = 0;

      for (let j = 0; j < numCols; j++) {
        if (polarity[j] === 0) {
          for (let i = 0; i < numRows; i++) {
            filteredSpectrum0.set(i, colIndex0, transposedPoints.get(i, j));
          }
          colIndex0++;
        } else if (polarity[j] === 1) {
          for (let i = 0; i < numRows; i++) {
            filteredSpectrum1.set(i, colIndex1, transposedPoints.get(i, j));
          }
          colIndex1++;
        }
      }

      const driftTimes0 = [];
      const driftTimes1 = [];

      const retentionTimes0 = [];
      const retentionTimes1 = [];

      const n_rows0 = filteredSpectrum0.shape[0];
      const n_rows1 = filteredSpectrum1.shape[0];

      const n_cols0 = filteredSpectrum0.shape[1];
      const n_cols1 = filteredSpectrum1.shape[1];

      for (let i = 0; i < n_rows0; i++) {
        driftTimes0.push((sample_delay + i * sample_distance) / 1000000);
      }

      for (let i = 0; i < n_rows1; i++) {
        driftTimes1.push((sample_delay + i * sample_distance) / 1000000);
      }


      for (let i = 0; i < n_cols0; i++) {
        retentionTimes0.push(
          (average * i * (period)) / 1000000000
        );
      }
      for (let i = 0; i < n_cols1; i++) {
        retentionTimes1.push(
          (average * i * (period)) / 1000000000
        );
      }

      const calibratedData0 = new Float32Array(filteredSpectrum0.shape[0] * filteredSpectrum0.shape[1]);
      const calibratedSpectrum0 = ndarray(calibratedData0, [filteredSpectrum0.shape[0], filteredSpectrum0.shape[1]]);

      const calibratedData1 = new Float32Array(filteredSpectrum1.shape[0] * filteredSpectrum1.shape[1]);
      const calibratedSpectrum1 = ndarray(calibratedData1, [filteredSpectrum1.shape[0], filteredSpectrum1.shape[1]]);

      if (user_calibration) {
        for (let i = 0; i < filteredSpectrum0.shape[0]; i++) {
          for (let j = 0; j < filteredSpectrum0.shape[1]; j++) {
            const value = filteredSpectrum0.get(i, j);
            calibratedSpectrum0.set(i, j, value * slope1 + offset1);
          }
        }


        for (let i = 0; i < filteredSpectrum1.shape[0]; i++) {
          for (let j = 0; j < filteredSpectrum1.shape[1]; j++) {
            const value = filteredSpectrum1.get(i, j);
            calibratedSpectrum1.set(i, j, value * slope2 + offset2);
          }
        }

      } else {
        //calibrated_spectrum = filtered_spectrum 
      }

      const ionCurrentData0 = new Float32Array(calibratedSpectrum0.size);
      const ionCurrent0 = ndarray(ionCurrentData0, calibratedSpectrum0.shape);

      const ionCurrentData1 = new Float32Array(calibratedSpectrum1.size);
      const ionCurrent1 = ndarray(ionCurrentData1, calibratedSpectrum1.shape);

      for (let i = 0; i < calibratedSpectrum0.shape[0]; i++) {
        for (let j = 0; j < calibratedSpectrum0.shape[1]; j++) {
          const value = calibratedSpectrum0.get(i, j);
          ionCurrent0.set(i, j, value / gain);
        }
      }



      const values0 = Array.from(ionCurrent0.data);



      for (let i = 0; i < calibratedSpectrum1.shape[0]; i++) {
        for (let j = 0; j < calibratedSpectrum1.shape[1]; j++) {
          const value = calibratedSpectrum1.get(i, j);
          ionCurrent1.set(i, j, value / gain);
        }
      }


      const ionRow0 = ionCurrent0.shape[0];
      const ionCol0 = ionCurrent0.shape[1];
      const result0 = []

      const ionRow1 = ionCurrent1.shape[0];
      const ionCol1 = ionCurrent1.shape[1];
      const result1 = [];

      for (let i = 0; i < ionRow0; i++) {
        const row = ionCurrent0.data.slice(i * ionCol0, (i + 1) * ionCol0);
        result0.push(Array.from(row));
      }


      const floatValues = result0.flat(1);
      const dataArray0 = ndarray(floatValues, [ionRow0, ionCol0]);
      const domain0 = getDomain(dataArray0);


      for (let i = 0; i < ionRow1; i++) {
        const row = ionCurrent1.data.slice(i * ionCol1, (i + 1) * ionCol1);
        result1.push(Array.from(row));  
      }

      const floatValues1 = result1.flat(1);
      const dataArray1 = ndarray(floatValues1, [ionRow1, ionCol1]);
      const domain1 = getDomain(dataArray1);
;
     
      setDataArray0(dataArray0);
      setDataArray1(dataArray1);
      setDomain0(domain0);
      setDomain1(domain1);
      

      setDriftTimes0(driftTimes0);
      setDriftTimes1(driftTimes1);
      setRetentionTimes0(retentionTimes0);
      setRetentionTimes1(retentionTimes1);

      setCurrentPolarity(0);
      setHeatmapData(dataArray0);
      setHeatmapDomain(domain0);
      setDriftTimes(driftTimes0);
      setRetentionTimes(retentionTimes0);
   

    } catch (err) {
      console.error("Error processing file:", err);
      setError("Error processing file.");
    }

  };


  // Toggle polarity handler
  const togglePolarity = () => {
    const newPol = currentPolarity === 0 ? 1 : 0;
    setCurrentPolarity(newPol);

    if (newPol === 0) {
      setHeatmapData(dataArray0);
      setHeatmapDomain(domain0);
      setCustomDomain(domain0)
      setDriftTimes(driftTimes0);
      setRetentionTimes(retentionTimes0);
    } else {
      setHeatmapData(dataArray1);
      setHeatmapDomain(domain1);
      setCustomDomain(domain1);
      setDriftTimes(driftTimes1);
      setRetentionTimes(retentionTimes1);
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
      {heatmapData && heatmapDomain ? (
        <>
        <button onClick={togglePolarity} style={{ margin: "0.5rem", padding: "1rem", width: "190px", height: "40px", fontSize: "1.1rem", borderRadius: "18px", cursor: "pointer",boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            transition: "background-color 0.3s ease"}}>
            Switch to Polarity {currentPolarity === 0 ? "1" : "0"}
        </button>
                <Toolbar className={styles.container4}>
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
          title={titleName}
          abscissaParams={{ value: retentionTimes, label: "Retention time (s)" }}
          aspect="auto"
          showGrid={showGrid}
          colorMap={colorMap}
          dataArray={heatmapData}
          domain={heatmapDomain}
          invertColorMap={invertColorMap}
          ordinateParams={{ value: driftTimes, label: "Drift time (ms)" }}
          
          scaleType="linear"
          interactions={{
            selectToZoom: { modifierKey: "Shift" },
            xAxisZoom: false,
            yAxisZoom: false,
          }}
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
        ) : (
          <p>Please upload a GC‑IMS .h5 file to render the heatmap.</p>
        )}


  </div>

  </div>
  );
}


export default HeatmapUploader;
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

  const [lineData, setLineData] = useState(null);
  const [lineDomain, setLineDomain] = useState(null);

  const [error, setError] = useState(null);

  const [scaleType, setScaleType] = useState("linear");
  const [colorMap, setColorMap] = useState("Turbo");
  const [showGrid, setShowGrid] = useState(false);
  const [showImsGrid, setShowImsGrid] = useState(false);
  const [viewMode, setViewMode] = useState("heatmap");

  const [dataArray0, setDataArray0] = useState(null);
  const [dataArray1, setDataArray1] = useState(null);
  const [domain0, setDomain0] = useState(null);
  const [domain1, setDomain1] = useState(null);
  const [driftTimes0, setDriftTimes0] = useState(null);
  const [driftTimes1, setDriftTimes1] = useState(null);
  const [retentionTimes0, setRetentionTimes0] = useState(null);
  const [retentionTimes1, setRetentionTimes1] = useState(null);
  const [currentPolarity, setCurrentPolarity] = useState(0);

  const [chromData0, setChromData0] = useState(null);
  const [chromData1, setChromData1] = useState(null);
  const [chromDomain0, setChromDomain0] = useState(null);
  const [chromDomain1, setChromDomain1] = useState(null);
  const [selectedChromIndex, setSelectedChromIndex] = useState(0);

  const [gcSpectrumData, setGcSpectrumData] = useState(null);
  const [gcSpectrumDomain, setGcSpectrumDomain] = useState(null);
  const [selectedGcIndex, setSelectedGcIndex] = useState(0);

  const chromGram = useRef(null);
  const heatmapRef = useRef(null);
  const imsSpectra = useRef(null);


  const [passwordEntered, setPasswordEntered] = useState(false);
  const [authError, setAuthError] = useState(null);
  
  
  const correctCredentials = {
    password: "123",
  };

  const togglePolarity = () => {
    const newPol = currentPolarity === 0 ? 1 : 0;
    setCurrentPolarity(newPol);

    if (newPol === 0) {
      setHeatmapData(dataArray0);
      setHeatmapDomain(domain0);
      setCustomDomain(domain0);
      setDriftTimes(driftTimes0);
      setRetentionTimes(retentionTimes0);
    } else {
      setHeatmapData(dataArray1);
      setHeatmapDomain(domain1);
      setCustomDomain(domain1);
      setDriftTimes(driftTimes1);
      setRetentionTimes(retentionTimes1);
    }

    setSelectedIndex(0);
    const dataArr = newPol === 0 ? dataArray0 : dataArray1;
    if (dataArr) {
      const firstColumn = new Float32Array(dataArr.shape[0]);
      for (let i = 0; i < dataArr.shape[0]; i++) {
        firstColumn[i] = dataArr.get(i, 0);
      }
      const newLine = ndarray(firstColumn, [firstColumn.length]);
      setLineData(newLine);
      setLineDomain(getDomain(newLine));
    }
  };
  

  const handleImsPolarityToggle = () => {
    togglePolarity();
  };

  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleImsSliderChange = (event) => {
    const index = parseInt(event.target.value);
    setSelectedIndex(index);

    const dataArr = currentPolarity === 0 ? dataArray0 : dataArray1;
    if (dataArr) {
      const column = new Float32Array(dataArr.shape[0]);
      for (let i = 0; i < dataArr.shape[0]; i++) {
        column[i] = dataArr.get(i, index);
      }
      const lineNdarray = ndarray(column, [column.length]);
      setLineData(lineNdarray);
      setLineDomain(getDomain(lineNdarray));
    }
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
        driftTimes0.push((sample_delay + i * sample_distance) / 1e6);
      }

      for (let i = 0; i < n_rows1; i++) {
        driftTimes1.push((sample_delay + i * sample_distance) / 1e6);
      }


      for (let i = 0; i < n_cols0; i++) {
        retentionTimes0.push(
          (average * i * (period)) / 1e9
        );
      }
      for (let i = 0; i < n_cols1; i++) {
        retentionTimes1.push(
          (average * i * (period)) / 1e9
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
          ionCurrent0.set(i, j, (value / gain)* 1e12);
        }
      }



      for (let i = 0; i < calibratedSpectrum1.shape[0]; i++) {
        for (let j = 0; j < calibratedSpectrum1.shape[1]; j++) {
          const value = calibratedSpectrum1.get(i, j);
          ionCurrent1.set(i, j, (value / gain)* 1e12);
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

     
      setDataArray0(dataArray0);
      setDataArray1(dataArray1);
      setDomain0(domain0);
      setDomain1(domain1);


      const firstColumn = new Float32Array(dataArray0.shape[0]);
      for (let i = 0; i < dataArray0.shape[0]; i++) {
        firstColumn[i] = dataArray0.get(i, 0);
      }
      const initialLine = ndarray(firstColumn, [firstColumn.length]);
      
      setLineData(initialLine);
      setLineDomain(getDomain(initialLine));
      setSelectedIndex(0); // initialize the slider

      // Chromatogram build
      const chromatogramData0 = computeChromatogram(ionCurrent0);
      const chromatogramData1 = computeChromatogram(ionCurrent1);

      setChromData0(chromatogramData0);
      setChromData1(chromatogramData1);
      setChromDomain0(getDomain(chromatogramData0));
      setChromDomain1(getDomain(chromatogramData1));

      // GC spectrum init at index 0
      const gcLine0 = computeGCSpectrum(ionCurrent0, 0);
      const gcLine1 = computeGCSpectrum(ionCurrent1, 0);
      setGcSpectrumData(currentPolarity === 0 ? gcLine0 : gcLine1);
      setGcSpectrumDomain(getDomain(currentPolarity === 0 ? gcLine0 : gcLine1));

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


  const computeChromatogram = (ionCurrent) => {
    const ionRow = ionCurrent.shape[0];
    const ionCol = ionCurrent.shape[1];
    const chrom = new Float32Array(ionCol);

    for (let j = 0; j < ionCol; j++) {
      let sum = 0;
      for (let i = 0; i < ionRow; i++) {
        sum += ionCurrent.get(i, j);
      }
      chrom[j] = sum;
    }

    return ndarray(chrom, [chrom.length]);
  };

  const computeGCSpectrum = (ionCurrent, driftIndex) => {
    const ionRow = ionCurrent.shape[0];
    const ionCol = ionCurrent.shape[1];
    const gcLine = new Float32Array(ionCol);

    for (let j = 0; j < ionCol; j++) {
      gcLine[j] = ionCurrent.data[j * ionRow + driftIndex];
    }

    return ndarray(gcLine, [gcLine.length]);
  };

  const handleGcSliderChange = (event) => {
    const index = parseInt(event.target.value);
    setSelectedGcIndex(index);

    const ionData = currentPolarity === 0 ? dataArray0 : dataArray1;
    const gcLine = computeGCSpectrum(ionData, index);
    setGcSpectrumData(gcLine);
    setGcSpectrumDomain(getDomain(gcLine));
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
        link.download = "GC_Spectra_screenshot.png";
        link.click();

        chromGram.current.style.overflow = originalOverflow;
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



  const handleDownloadImsCSV = () => {
  const dataArr = currentPolarity === 0 ? dataArray0 : dataArray1;
  const driftArr = currentPolarity === 0 ? driftTimes0 : driftTimes1;
  const retentionArr = currentPolarity === 0 ? retentionTimes0 : retentionTimes1;

  if (!dataArr || !driftArr || !retentionArr || selectedIndex >= dataArr.shape[1]) {
    alert("Data not available.");
    return;
  }

  const ionColumn = new Float32Array(dataArr.shape[0]);
  for (let i = 0; i < dataArr.shape[0]; i++) {
    ionColumn[i] = dataArr.get(i, selectedIndex);
  }

  const csvRows = [["Drift Time (ms)", "Ion Current (pA)"]];
  for (let i = 0; i < driftArr.length; i++) {
    csvRows.push([driftArr[i].toFixed(6), ionColumn[i].toFixed(22)]);
  }

  const csvContent = csvRows.map(e => e.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const retentionLabel = retentionArr[selectedIndex].toFixed(3);
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `ims_spectrum_retention_${retentionLabel}s.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  const handleChromSliderChange = (event) => {
    setSelectedChromIndex(parseInt(event.target.value));
  };

  const handleDownloadGcCSV = () => {
  const dataArr = currentPolarity === 0 ? dataArray0 : dataArray1;
  const retentionArr = currentPolarity === 0 ? retentionTimes0 : retentionTimes1;
  const driftArr = currentPolarity === 0 ? driftTimes0 : driftTimes1;

  if (!dataArr || !retentionArr || selectedGcIndex >= dataArr.shape[0]) {
    alert("Data not available.");
    return;
  }

  const ionRow = dataArr.shape[0];
  const ionCol = dataArr.shape[1];

  const gcLine = new Float32Array(ionCol);
  for (let j = 0; j < ionCol; j++) {
    gcLine[j] = dataArr.data[j * ionRow + selectedGcIndex];
  }

  const csvRows = [["Retention Time (s)", "Ion Current (pA)"]];
  for (let i = 0; i < retentionArr.length; i++) {
    csvRows.push([retentionArr[i].toFixed(6), gcLine[i].toFixed(22)]);
  }

  const csvContent = csvRows.map(e => e.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const driftLabel = driftArr?.[selectedGcIndex]?.toFixed(3);
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `gc_spectrum_drift_${driftLabel}ms.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

console.log(heatmapData)
const handleDownloadHeatmapCSV = () => {
  if (!heatmapData || !driftTimes0 || !retentionTimes0) {
    console.error("Missing heatmap data or axis labels");
    return;
  }

  const { dataArray } = heatmapData;
  console.log(dataArray.shape[0])
  const csvRows = [["Retention Time (s)", "Drift Time (ms)", "Ion Current (pA)"]];

  for (let i = 0; i < dataArray.shape[0]; i++) {
    for (let j = 0; j < dataArray.shape[1]; j++) {
      const retention = retentionTimes0[i];
      const drift = driftTimes0[j];
      const ion = dataArray.get(i, j);
      csvRows.push([retention, drift, ion]);
    }
  }

  const csvString = csvRows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "IMS_Heatmap.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


return (
<div className={styles.container2}>
  <Sidebar onGCIMSDataUpload={handleGCIMSDataUpload} />
    <div
      className={styles.card}
      style={{borderRadius: "40px", backgroundColor: "#084072", marginLeft: "200px", cursor: "pointer"}}
    >
      {heatmapData && heatmapDomain && (
        <>
        <button onClick={togglePolarity} style={{ margin: "0.5rem", padding: "1rem", width: "190px", height: "40px", fontSize: "1.1rem", borderRadius: "18px", cursor: "pointer",boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            transition: "background-color 0.3s ease"}}>
            Switch to Polarity {currentPolarity === 0 ? "1" : "0"}
        </button>
        {viewMode === "heatmap" ? (
          <>
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
                  <ToggleBtn
                    icon={FaChartLine}
                    label="Chrom Spectra"
                    onToggle={() => handleViewChange("chromSpectra")}
                  />
                  <Separator />
                  <ToggleBtn
                    icon={FaDownload}
                    label="Download Heatmap CSV"
                    onToggle={handleDownloadHeatmapCSV}
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
                onToggle={() => setShowImsGrid(!showImsGrid)}
              />
              <Separator />
              <ToggleBtn
                icon={FaMap}
                label="Heatmap View"
                onToggle={() => setViewMode("heatmap")}
              />
      
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
                ref={imsSpectra}
                dataArray={lineData}
                domain={lineDomain}
                scaleType={"linear"}
                curveType="OnlyLine"
                showGrid={showImsGrid}
                title="IMS Spectra Graph"
                abscissaParams={{ value: driftTimes, label: "Drift Time (ms)" }}
                ordinateLabel="Ion Current pA"
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
                  max={dataArray0?.shape[1] - 1 || 0}
                  value={selectedIndex}
                  onChange={handleImsSliderChange}
                />
                <span style={{ color: "#fff", marginLeft: "10px", fontSize: 20 }}>
                  {retentionTimes?.[selectedIndex]?.toFixed(3)} s
                </span>
              </div>    

        </>
        ) : viewMode === "chromSpectra" ? (
          <>
            <Toolbar className={styles.container4}>
              
              <ToggleBtn
                icon={FaTh}
                label="Grid"
                onToggle={() => setShowGrid(!showGrid)}
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
                icon={FaMap}
                label="Heatmap View"
                onToggle={() => setViewMode("heatmap")}
              />
           
              <ToggleBtn
                icon={FaChartArea}
                label="IMS Spectra"
                onToggle={() => setViewMode("imsSpectra")}
              />
              <Separator />
              <ToggleBtn
                icon={FaDownload}
                label="Download CSV"
                onToggle={() => handleDownloadGcCSV()}
              >          
              </ToggleBtn>
              </Toolbar>
              <div ref={chromGram} style={{display: "flex", height: "40rem", width: "76rem", backgroundColor: "#084072", fontSize: 19}}>
                <LineVis
                  className={styles.container6}
                  dataArray={gcSpectrumData}
                  domain={gcSpectrumDomain}
                  scaleType={"linear"}
                  curveType="OnlyLine"
                  showGrid={showGrid}
                  title="Gc Chromatogram Graph"
                  abscissaParams={{ value: currentPolarity === 0 ? retentionTimes0 : retentionTimes1, label: "Retention Time (s)" }}
                  ordinateLabel="Ion Current (pA)"
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
                    max={(currentPolarity === 0 ? driftTimes0?.length : driftTimes1?.length) - 1 || 0}
                    value={selectedGcIndex}
                    onChange={handleGcSliderChange}
                  />
                  <span style={{ color: "#fff", marginLeft: "10px", fontSize: 20 }}>
                    {(currentPolarity === 0 ? driftTimes0?.[selectedGcIndex] : driftTimes1?.[selectedGcIndex])?.toFixed(3)} ms
                  </span>
                </div> 
        </>             
        ) : viewMode === "null" ()}</>  
        )}   
    </div>
  </div>

  );
}


export default HeatmapUploader;
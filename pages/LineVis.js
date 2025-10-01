"use client";
import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import { File, FS, h5wasmReady } from "h5wasm";
import ndarray from "ndarray";
import { getDomain, LineVis, Toolbar, ToggleBtn, Separator, Overlay, Tooltip } from "@h5web/lib";
import { FaCamera, FaDownload, FaTh, FaSlidersH, FaPlay } from "react-icons/fa";
import Sidebar from "./posts/Sidebar";
import styles from "../styles/Home.module.css";
import domtoimage from "dom-to-image-more";
import "@h5web/lib/dist/styles.css";


function IMSLineCharts() {
  const [titleName, setTitleName] = useState("GC-IMS Heatmap");
  const [titleName2, setTitleName2] = useState("GC-IMS Heatmap");
  const [predictionResult, setPredictionResult] = useState(null);

  const [dataArray2, setDataArray2] = useState(null); // file 2, polarity 0
  const [dataArray3, setDataArray3] = useState(null); // file 2, polarity 1
  const [domain2, setDomain2] = useState(null);
  const [domain3, setDomain3] = useState(null);
  const [driftTimes2, setDriftTimes2] = useState(null);
  const [driftTimes3, setDriftTimes3] = useState(null);
  const [retentionTimes2, setRetentionTimes2] = useState(null);
  const [retentionTimes3, setRetentionTimes3] = useState(null);
  const [currentPolarity2, setCurrentPolarity2] = useState(0);


  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedIndex2, setSelectedIndex2] = useState(0);
  const [dataArray0, setDataArray0] = useState(null);
  const [currentPolarity, setCurrentPolarity] = useState(0);
  const [dataArray1, setDataArray1] = useState(null);

 
  const [retentionTimes, setRetentionTimes] = useState([null]);
  const [driftTimes, setDriftTimes] = useState([null]);

  const [domain0, setDomain0] = useState(null);
  const [domain1, setDomain1] = useState(null);

 const [error, setError] = useState(null);

  const [lineData, setLineData] = useState(null);
  const [lineDomain, setLineDomain] = useState(null);
  const [driftTimes0, setDriftTimes0] = useState(null);
  const [driftTimes1, setDriftTimes1] = useState(null);
  const [retentionTimes0, setRetentionTimes0] = useState(null);
  const [retentionTimes1, setRetentionTimes1] = useState(null);

  const [lineData1, setLineData1] = useState(null);
  const [lineDomain1, setLineDomain1] = useState(null);

  const [lineData2, setLineData2] = useState(null);
  const [lineDomain2, setLineDomain2] = useState(null);

  const [showGrid1, setShowGrid1] = useState(false);
  const [showGrid2, setShowGrid2] = useState(false);

  const imsSpectraRef = useRef(null);
  

  const PASSWORD = "expert_mode_TechBiot_2025";



    const togglePolarity = () => {
    const newPol = currentPolarity === 0 ? 1 : 0;

    const newPolarityLabel = newPol === 0 ? "NEGATIVE" : "POSITIVE"; 
  
    Swal.fire({
      icon: "info",
      title: `Polarity Changed to ${newPolarityLabel} chart #1`,
      timer: 1500, 
      showConfirmButton: false,
      timerProgressBar: true,
    }); 


    setCurrentPolarity(newPol);

    const dataArr = newPol === 0 ? dataArray0 : dataArray1;
    const driftArr = newPol === 0 ? driftTimes0 : driftTimes1;

    if (dataArr) {
      const firstColumn = new Float32Array(dataArr.shape[0]);
      for (let i = 0; i < dataArr.shape[0]; i++) {
        firstColumn[i] = dataArr.get(i, 0);
      }
      const newLine = ndarray(firstColumn, [firstColumn.length]);
      setLineData1(newLine);
      setLineDomain1(getDomain(newLine));
    }
    setSelectedIndex(0);
  };


    const togglePolarity2 = () => {
    const newPol = currentPolarity2 === 0 ? 1 : 0;
    
    
    const newPolarityLabel = newPol === 0 ? "NEGATIVE" : "POSITIVE"; 
  
    Swal.fire({
      icon: "info",
      title: `Polarity Changed to ${newPolarityLabel} chart #2`,
      timer: 1500, 
      showConfirmButton: false,
      timerProgressBar: true,
    });     
    
    setCurrentPolarity2(newPol);

    const dataArr = newPol === 0 ? dataArray2 : dataArray3;
    const driftArr = newPol === 0 ? driftTimes2 : driftTimes3;

    if (dataArr) {
      const firstColumn = new Float32Array(dataArr.shape[0]);
      for (let i = 0; i < dataArr.shape[0]; i++) {
        firstColumn[i] = dataArr.get(i, 0);
      }
      const newLine = ndarray(firstColumn, [firstColumn.length]);
      setLineData2(newLine);
      setLineDomain2(getDomain(newLine));
    }
    setSelectedIndex2(0);
  };


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
      setLineData1(lineNdarray);
      setLineDomain1(getDomain(lineNdarray));
    }
  };


    const handleSlider2 = (event) => {
    const index = parseInt(event.target.value);
    setSelectedIndex2(index);
    const dataArr = currentPolarity2 === 0 ? dataArray2 : dataArray3;
    if (dataArr) {
      const column = new Float32Array(dataArr.shape[0]);
      for (let i = 0; i < dataArr.shape[0]; i++) {
        column[i] = dataArr.get(i, index);
      }
      const lineNdarray = ndarray(column, [column.length]);
      setLineData2(lineNdarray);
      setLineDomain2(getDomain(lineNdarray));
    }
  };


  const handleIMSDataSelect = async (buffer, chartNumber, filename) => {
    try{
    
    await h5wasmReady;
    const filePath = `/tmp/${filename}`;
    FS.writeFile(filePath, new Uint8Array(buffer));
    const h5File = new File(filePath, "r");


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
          ( i * (period)) / 1e9
        );
      }
      for (let i = 0; i < n_cols1; i++) {
        retentionTimes1.push(
          (i * (period)) / 1e9
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

      const firstColumn = new Float32Array(dataArray0.shape[0]);
      for (let i = 0; i < dataArray0.shape[0]; i++) {
          firstColumn[i] = dataArray0.get(i, 0);            
      }
      const initialLine = ndarray(firstColumn, [firstColumn.length]);

      if (chartNumber === 1) {
        setTitleName(filename);
        setDataArray0(dataArray0);
        setDataArray1(dataArray1);
        setDomain0(domain0);
        setDomain1(domain1);
        
        
        setDriftTimes0(driftTimes0);
        setDriftTimes1(driftTimes1);

      
        setRetentionTimes0(retentionTimes0);
        setRetentionTimes1(retentionTimes1);
        setLineData1(initialLine);
       
      
        setLineDomain1(getDomain(initialLine));
        setSelectedIndex(0); 
        setCurrentPolarity(0);
      }else if (chartNumber === 2) {
        setTitleName2(filename);
        setDataArray2(dataArray0);
        setDataArray3(dataArray1);
        setDomain2(domain0);
        setDomain3(domain1);
        setDriftTimes2(driftTimes0);
        setDriftTimes3(driftTimes1);
        setRetentionTimes2(retentionTimes0);
        setRetentionTimes3(retentionTimes1);
        setCurrentPolarity2(0);
        setSelectedIndex2(0);  
        

        const firstColumn = new Float32Array(dataArray0.shape[0]);

        for (let i = 0; i < dataArray0.shape[0]; i++) {
          firstColumn[i] = dataArray0.get(i, 0);
        }
        const initialLine2 = ndarray(firstColumn, [firstColumn.length]);
        setLineData2(initialLine2);
        setLineDomain2(getDomain(initialLine2));      

      }
    }catch (err) {
      console.error("Error processing file:", err);
      setError("Error processing file.");
    }

  };


const handleIMSDataUpload = (filename, buffer) => {

};

const handleSnapshotIMS1 = () => {
  if (imsSpectraRef.current) {
    const node = imsSpectraRef.current;
    const scale = 2;
    domtoimage.toPng(node, {
      width: node.offsetWidth * scale,
      height: node.offsetHeight * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: `${node.offsetWidth}px`,
        height: `${node.offsetHeight}px`
      }
    })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "IMS_Spectra_screenshot.png";
        link.click();
      })
      .catch((error) => {
        console.error("Snapshot failed:", error);
      });
  }
};

const handleDownloadLineData1 = async () => {
  // Ask for password with SweetAlert2 (hidden input)
  const { value: enteredPassword } = await Swal.fire({
    title: 'Enter password to download CSV #1',
    input: 'password', // <== hides characters automatically
    inputPlaceholder: 'Password',
    inputAttributes: {
      autocapitalize: 'off',
      autocorrect: 'off'
    },
    showCancelButton: true,
    confirmButtonText: 'Download',
    background: '#000',
    color: '#fff',
  });

  // If user cancels or enters nothing
  if (!enteredPassword) {
    Swal.fire({
      icon: 'info',
      title: 'Download canceled',
      timer: 1500,
      showConfirmButton: false,
      background: '#000',
      color: '#fff',
    });
    return;
  }

  // Check password
  if (enteredPassword !== PASSWORD) {
    Swal.fire({
      icon: 'error',
      title: '❌ Incorrect password',
      text: 'Download canceled.',
      timer: 2000,
      showConfirmButton: false,
      background: '#000',
      color: '#fff',
    });
    return;
  }

  // If password is correct, continue download
  if (!lineData1 || !driftTimes0) return;

  let csv = "Drift Time (ms),Ion Current (pA)\n";
  for (let i = 0; i < lineData1.shape[0]; i++) {
    const drift = driftTimes0[i];
    const intensity = lineData1.get(i);
    csv += `${drift},${intensity}\n`;
  }

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "line_data_chart1.csv";
  link.click();

  // Optional success message
  Swal.fire({
    icon: 'success',
    title: '✅ Download started!',
    timer: 1500,
    showConfirmButton: false,
    background: '#000',
    color: '#fff',
  });
};


const handleDownloadLineData2 = async () => {
  // Ask for password with SweetAlert2 (hidden input)
  const { value: enteredPassword } = await Swal.fire({
    title: 'Enter password to download CSV #2',
    input: 'password', // <== hides characters automatically
    inputPlaceholder: 'Password',
    inputAttributes: {
      autocapitalize: 'off',
      autocorrect: 'off'
    },
    showCancelButton: true,
    confirmButtonText: 'Download',
    background: '#000',
    color: '#fff',
  });

  // If user cancels or enters nothing
  if (!enteredPassword) {
    Swal.fire({
      icon: 'info',
      title: 'Download canceled',
      timer: 1500,
      showConfirmButton: false,
      background: '#000',
      color: '#fff',
    });
    return;
  }

  // Check password
  if (enteredPassword !== PASSWORD) {
    Swal.fire({
      icon: 'error',
      title: '❌ Incorrect password',
      text: 'Download canceled.',
      timer: 2000,
      showConfirmButton: false,
      background: '#000',
      color: '#fff',
    });
    return;
  }

  // If password is correct, continue download
  if (!lineData2 || !driftTimes2) return;

  let csv = "Drift Time (ms),Ion Current (pA)\n";
  for (let i = 0; i < lineData2.shape[0]; i++) {
    const drift = driftTimes2[i];
    const intensity = lineData2.get(i);
    csv += `${drift},${intensity}\n`;
  }

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "line_data_chart2.csv";
  link.click();

  // Optional success message
  Swal.fire({
    icon: 'success',
    title: '✅ Download started!',
    timer: 1500,
    showConfirmButton: false,
    background: '#000',
    color: '#fff',
  });
};


const handleRunPrediction1 = async () => {
  if (!titleName) {
    alert("Please upload a file first.");
    return;
  }

  const fileName = titleName;
  const index = selectedIndex;
  const pollarity = currentPolarity;

  try {
    // Show loading modal
    Swal.fire({
      title: "Running Prediction...",
      text: "Please wait while we process your request.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await fetch("http://127.0.0.1:8000/api/predict/ims/dpm-model", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        file_name: fileName,
        index: index,
        polarity: pollarity
      })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    setPredictionResult(result);

    // Close loading after success
    Swal.close();

  } catch (error) {
    console.error("Prediction request failed:", error);
    Swal.fire({
      title: "Error",
      text: "Failed to run prediction. See console for details.",
      icon: "error",
    });
  }
};

useEffect(() => {
  if (!predictionResult) return; // ⛔ No response yet, stop here

  if (predictionResult.red_alert) {
    // === RED ALERT ===
    Swal.fire({
      html: `
        <div style="text-align: left;">
          <p style="font-size: 35px; margin-bottom: 10px;">
            <strong>Note:</strong> ${predictionResult.note}
          </p>
          <p style="font-size: 27px; margin-top: 5px;">
            <strong>Red Alert:</strong> 🚨 YES
          </p>
        </div>
      `,
      icon: "error",
      background: "#000",
      color: "#fff",
      confirmButtonText: "OK",
      confirmButtonColor: "#ff0000",
      timer: 1000000000,
    });
  } else {
    
    Swal.fire({
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;">
          <span style="font-size: 35px; text-align: center;">
            <strong>Note:</strong> ${predictionResult.note}
          </span>
        </div>
      `,
      icon: "info",
      background: "#000",
      color: "#fff",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "OK",
      timer: 1000000000,
    });
  }
}, [predictionResult]);

const handleRunPrediction2 = async () => {
  if (!titleName2) {
    alert("Please upload a file first.");
    return;
  }

  const fileName = titleName2;
  const index = selectedIndex2;
  const pollarity = currentPolarity2;

  try {
    // Show loading modal
    Swal.fire({
      title: "Running Prediction...",
      text: "Please wait while we process your request.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await fetch("http://127.0.0.1:8000/api/predict/ims/dpm-model", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        file_name: fileName,
        index: index,
        polarity: pollarity
      })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    setPredictionResult(result);

    // Close loading after success
    Swal.close();

  } catch (error) {
    console.error("Prediction request failed:", error);
    Swal.fire({
      title: "Error",
      text: "Failed to run prediction. See console for details.",
      icon: "error",
    });
  }
};

return (
  <div     className={styles.container2}
    style={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center", // vertically center children
      height: "100vh",      // full viewport height
      width: "100vw"
    }}
  >
    <Sidebar onIMSDataUpload={handleIMSDataUpload} onIMSDataSelect={handleIMSDataSelect} />
    <div
      className={styles.centerScreen}
    >
    <div
      className={styles.card}
      style={{
        borderRadius: "40px",
        backgroundColor: "#fcfcfc",
        marginLeft: "20px",
        cursor: "pointer"
      }}
    >
      {/* Show message until all main data for chart 1 is ready */}
      {!lineData1 || !lineDomain1 || !driftTimes0 ? (
        <div style={{ textAlign: "center", padding: "3rem", fontSize: "1.5rem", color: "#555" }}>
          📂 Please upload your IMS files for visualization.
        </div>
      ) : (
        <>
          <Toolbar className={styles.container4}>
            <ToggleBtn icon={FaPlay} label="#1 Run Prediction" onToggle={handleRunPrediction1} />
            <ToggleBtn icon={FaPlay} label="#2 Run Prediction" onToggle={handleRunPrediction2} />
            <Separator />
            <ToggleBtn icon={FaTh} label="Grid 1" onToggle={() => setShowGrid1(!showGrid1)} />
            <ToggleBtn icon={FaTh} label="Grid 2" onToggle={() => setShowGrid2(!showGrid2)} />
            <Separator />
            <ToggleBtn icon={FaSlidersH} label="Change Polarity Chart 1" onToggle={togglePolarity} />
            <ToggleBtn icon={FaSlidersH} label="Change Polarity Chart 2" onToggle={togglePolarity2} />
            <Separator />
            <ToggleBtn icon={FaCamera} label="Snap Shot" onToggle={handleSnapshotIMS1} />
            <Separator />
            <ToggleBtn icon={FaDownload} label="Download CSV 1" onToggle={handleDownloadLineData1} />
            <ToggleBtn icon={FaDownload} label="Download CSV 2" onToggle={handleDownloadLineData2} />
          </Toolbar>

          <div
            ref={imsSpectraRef}
            style={{
              display: "flex",
              position: "relative",
              height: "40rem",
              width: "75rem",
              backgroundColor: "#fcfcfc",
              fontSize: 19
            }}
          >
            <LineVis
              className={styles.container6}
              dataArray={lineData1}
              domain={lineDomain1}
              aspect="auto"
              scaleType="linear"
              curveType="OnlyLine"
              showGrid={showGrid1}
              title={"IMS Spectrum" + ": " +  titleName}
              abscissaParams={{ value: driftTimes0, label: "Drift Time (msec)" }}
              ordinateLabel="Ion Current pA"
            >
            <Overlay
              style={{
                display: 'flex',
                alignItems: 'right',
                justifyContent: 'right',
                height: '100%',
                width: '100%',
                pointerEvents: 'none', // lets pointer events through
                background: 'none' // removes background
              }}
            >
            <div
              style={{
                textAlign: 'center',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: currentPolarity === 0 ? "#ff0000" : "#007bff",
                background: 'none'
              }}
            >
              Chart 1 Polarity <br /> {currentPolarity === 0 ? "NEGATIVE" : "POSITIVE"}
            </div>
            </Overlay>
            </LineVis>
            {lineData2 && lineDomain2 && driftTimes2 && (
              <LineVis
                className={styles.container7}
                dataArray={lineData2}
                domain={lineDomain2}
                aspect="auto"
                scaleType="linear"
                curveType="OnlyLine"
                showGrid={showGrid2}
                title={"IMS Spectrum" + ": " +  titleName2}
                abscissaParams={{ value: driftTimes2, label: "Drift Time (msec)" }}
                ordinateLabel="Ion Current pA"
              >
            <Overlay
              style={{
                display: 'flex',
                alignItems: 'right',
                justifyContent: 'right',
                height: '100%',
                width: '100%',
                pointerEvents: 'none', // lets pointer events through
                background: 'none' // removes background
              }}
            >
            <div
              style={{
                textAlign: 'center',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: currentPolarity2 === 0 ? "#ff0000" : "#007bff",
                background: 'none'
              }}
            >
              Chart 2 Polarity <br /> {currentPolarity2 === 0 ? "NEGATIVE" : "POSITIVE"}
            </div>
            </Overlay>                
              </LineVis>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "auto",
              gap: "360px",
              marginTop: "20px"
            }}
          >
            <div>
              <label htmlFor="column-slider" style={{ color: "#000", fontSize: 18 }}>
                Select Spectra 1 Index:
              </label>
              {dataArray0 && (
                <>
                  <input
                    id="column-slider"
                    type="range"
                    min="0"
                    max={
                      (currentPolarity === 0
                        ? dataArray0?.shape[1]
                        : dataArray1?.shape[1]) - 1 || 0
                    }
                    value={selectedIndex}
                    onChange={handleImsSliderChange}
                  />
                  <span style={{ color: "#000", marginLeft: "10px", fontSize: 20 }}>
                    {[selectedIndex]}
                  </span>
                </>
              )}
            </div>

            <div>
              <label htmlFor="column-slider2" style={{ color: "#000", fontSize: 18 }}>
                Select Spectra 2 Index:
              </label>
              {dataArray2 && (
                <>
                  <input
                    id="column-slider2"
                    type="range"
                    min="0"
                    max={dataArray2?.shape[1] - 1 || 0}
                    value={selectedIndex2}
                    onChange={handleSlider2}
                  />
                  <span style={{ color: "#000", marginLeft: "10px", fontSize: 20 }}>
                    {[selectedIndex2]}
                  </span>
                </>
              )}
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  </div>
);
}

export default IMSLineCharts;
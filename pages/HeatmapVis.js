"use client";
import React, { useState, useRef, useEffect } from "react";
import ndarray from "ndarray";
import Swal from "sweetalert2";
import { HeatmapVis, getDomain, Toolbar, ColorMapSelector,  Separator, ToggleBtn, LineVis, DefaultInteractions, Annotation } from "@h5web/lib";
import { h5wasmReady, FS, File, configure } from "h5wasm";
import "@h5web/lib/dist/styles.css";
import Sidebar from "./posts/Sidebar";
import styles from "../styles/Home.module.css";
import { FaCamera, FaChartArea, FaDownload, FaMap, FaTh, FaChartLine, FaSlidersH, FaPlay} from "react-icons/fa";
import "@fortawesome/fontawesome-svg-core/styles.css";
import html2canvas from "html2canvas";
import domtoimage from "dom-to-image-more";


function HeatmapUploader() {

  const [titleName, setTitleName] = useState("GC-IMS Heatmap");
  const [predictionResult, setPredictionResult] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [heatmapDomain, setHeatmapDomain] = useState(null);
  const [retentionTimes, setRetentionTimes] = useState([null]);
  const [driftTimes, setDriftTimes] = useState([null]);
 
  const [invertColorMap, setInvertColorMap] = useState(false);

  const [lineData, setLineData] = useState(null);
  const [lineDomain, setLineDomain] = useState(null);

  const [error, setError] = useState(null);

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
    password: "expert_mode_TechBiot_2025",
  };

  const togglePolarity = () => {
    const newPol = currentPolarity === 0 ? 1 : 0;
    const oldPolarityLabel = currentPolarity === 0 ? "NEGATIVE" : "POSITIVE";
    const newPolarityLabel = newPol === 0 ? "NEGATIVE" : "POSITIVE"; 
  
    Swal.fire({
      icon: "info",
      title: `Polarity Changed to ${newPolarityLabel}`,
      timer: 1500, // Auto-close after 1.5 seconds
      showConfirmButton: false,
      timerProgressBar: true,
    });     

    setCurrentPolarity(newPol);

    if (newPol === 0) {
      setHeatmapData(dataArray0);
      setHeatmapDomain(domain0);
      setDriftTimes(driftTimes0);
      setRetentionTimes(retentionTimes0);
    } else {
      setHeatmapData(dataArray1);
      setHeatmapDomain(domain1);  
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
      
      await h5wasmReady;

      
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
          ( i * (period)) / 1e9
        );
      }
      for (let i = 0; i < n_cols1; i++) {
        retentionTimes1.push(
          ( i * (period)) / 1e9
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
    const node = heatmapRef.current;
    // Set your desired scale factor (e.g., 2 for 2x resolution)
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
        link.download = "Heatmap_screenshot.png";
        link.click();
      })
      .catch((error) => {
        console.error("Snapshot failed:", error);
      });
  }
};


const handleSnapshotIMS = () => {
  if (imsSpectra.current) {
    const node = imsSpectra.current;
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

const handleSnapshotGC = () => {
  if (chromGram.current) {
    const node = chromGram.current;
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
        link.download = "Chrom_Spectra_screenshot.png";
        link.click();
      })
      .catch((error) => {
        console.error("Snapshot failed:", error);
      });
  }
};


const handleViewChange = async (newView) => {
  if (!passwordEntered) {
    const { value: enteredPassword } = await Swal.fire({
      title: 'Please enter your password',
      input: 'password',  
      inputPlaceholder: 'password',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Submit',
      background: '#000',
      color: '#fff',
    });

    if (enteredPassword) {
      if (enteredPassword === correctCredentials.password) {
        setPasswordEntered(true);
        setViewMode(newView);
        setAuthError(null);
      } else {
        setAuthError('Incorrect password. Access denied.');
        Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: 'Incorrect password. Please try again.',
          timer: 2000,
          showConfirmButton: false
        });
      }
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
  link.setAttribute("download", `ims_spectrum.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  Swal.fire({
    icon: 'success',
    title: '✅ Download started!',
    timer: 1500,
    showConfirmButton: false,
    background: '#000',
    color: '#fff',
  });
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
  link.setAttribute("download", `gc_spectrum.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  Swal.fire({
    icon: 'success',
    title: '✅ Download started!',
    timer: 1500,
    showConfirmButton: false,
    background: '#000',
    color: '#fff',
  });
};



const handleDownload = () => {
  const enteredCode = prompt("Enter access code:");
  if (enteredCode !== "expert_mode_TechBiot_2025") {
    alert("Incorrect code. Access denied.");
    return;
  }

  if (!heatmapData || !driftTimes0 || !retentionTimes0) {
    console.error("Missing heatmap data or axis labels");
    return;
  }


  const csvRows = [["Retention Time (s)", "Drift Time (ms)", "Ion Current (pA)"]];

  for (let i = 0; i < heatmapData.shape[0]; i++) {
    for (let j = 0; j < heatmapData.shape[1]; j++) {
      const retention = retentionTimes[i];
      const drift = driftTimes[j];
      const ion = heatmapData.get(i, j);
      csvRows.push([retention, drift, ion]);
    }
  }

  const csvString = csvRows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "GC_IMS_Heatmap.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

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
    Swal.fire({
      icon: "warning",
      title: "No File Uploaded",
      text: "Please upload a file first.",
      confirmButtonColor: "#3085d6"
    });
    return;
  }

  const fileName = titleName;
  const pollarity = currentPolarity;

  try {
    // === SHOW SWEETALERT LOADING MODAL ===
    Swal.fire({
      title: "Running Prediction...",
      html: "Please wait while we process your data.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // === SEND POST REQUEST ===
    const response = await fetch("http://127.0.0.1:8000/api/predict/gcims/bwa-model", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        file_name: fileName,
        polarity: pollarity
      })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    setPredictionResult(result);

    // === CLOSE LOADING MODAL ON SUCCESS ===
    Swal.close();

  } catch (error) {
    console.error("Prediction request failed:", error);

    // === CLOSE LOADING MODAL AND SHOW ERROR ===
    Swal.fire({
      icon: "error",
      title: "Prediction Failed",
      text: "An error occurred while running prediction. Please check the console for details.",
      confirmButtonColor: "#d33"
    });
  }
};


useEffect(() => {
  if (!predictionResult) return; // ⛔ No response yet, stop here

  if (predictionResult.red_alert) {
    // === RED ALERT ===
    Swal.fire({
      title: "⚠ ALERT ⚠",
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
    // === ONLY NOTE WITH BLUE INFO ICON ===
    Swal.fire({
      title: "Information",
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


return (
  <div className={styles.container2}>
    <Sidebar onGCIMSDataUpload={handleGCIMSDataUpload} />
    <div
      className={styles.card}
      style={{
        borderRadius: "30px",
        backgroundColor: "#fcfcfc",
        marginLeft: "150px",
        cursor: "pointer"
      }}
    >
      {!heatmapData || !heatmapDomain ? (
        <div style={{ textAlign: "center", padding: "3rem", fontSize: "1.5rem", color: "#555" }}>
          📂 Please upload your GC-IMS file for visualization.
        </div>
      ) : (
        <>
          {viewMode === "heatmap" ? (
            <>
              <Toolbar className={styles.container4}>
                <ToggleBtn icon={FaPlay} label="Run Prediction" onToggle={handleRunPrediction1} />
                <ColorMapSelector
                  className={styles.container4}
                  onInversionChange={() => setInvertColorMap(!invertColorMap)}
                  onValueChange={setColorMap}
                  value={colorMap}
                />
                <Separator />
                <ToggleBtn icon={FaCamera} label="Snap Shot" onToggle={() => handleSnapshot()} />
                <Separator />
                <ToggleBtn icon={FaTh} label="Grid" onToggle={() => setShowGrid(!showGrid)} />
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
                <ToggleBtn icon={FaDownload} label="Download Heatmap CSV" onToggle={handleDownload} />
                <Separator />
                <ToggleBtn icon={FaSlidersH} label="Change Polarity" onToggle={togglePolarity} />
              </Toolbar>

              {authError && <p style={{ color: "red" }}>{authError}</p>}

              <div
                ref={heatmapRef}
                style={{
                  display: "flex",
                  height: "40rem",
                  width: "79rem",
                  backgroundColor: "#fcfcfc",
                  fontSize: 19
                }}
              >
                <HeatmapVis
                  className={styles.container5}
                  title={"GC_IMS Spectrum" + ": " + titleName}
                  abscissaParams={{ value: retentionTimes, label: "Retention time (s)" }}
                  ordinateParams={{ value: driftTimes, label: "Drift time (ms)" }}
                  aspect="auto"
                  showGrid={showGrid}
                  colorMap={colorMap}
                  dataArray={heatmapData}
                  domain={heatmapDomain}
                  invertColorMap={invertColorMap}
                  scaleType="linear"
                  interactions={{
                    selectToZoom: { modifierKey: "Shift" },
                    xAxisZoom: false,
                    yAxisZoom: false
                  }}              
                >
                </HeatmapVis>               
              </div>
            </>
          ) : viewMode === "imsSpectra" ? (
            <>
              <Toolbar className={styles.container4}>
                <ToggleBtn icon={FaCamera} label="Snap Shot" onToggle={() => handleSnapshotIMS()} />
                <Separator />
                <ToggleBtn icon={FaTh} label="Grid" onToggle={() => setShowImsGrid(!showImsGrid)} />
                <Separator />
                <ToggleBtn icon={FaMap} label="Heatmap View" onToggle={() => setViewMode("heatmap")} />
                <ToggleBtn
                  icon={FaChartLine}
                  label="Chrom Spectra"
                  onToggle={() => setViewMode("chromSpectra")}
                />
                <Separator />
                <ToggleBtn icon={FaDownload} label="Download CSV" onToggle={handleDownloadImsCSV} />
                
                <ToggleBtn icon={FaSlidersH} label="Change Polarity" onToggle={togglePolarity} />
              </Toolbar>

              <div
                ref={imsSpectra}
                style={{
                  display: "flex",
                  height: "40rem",
                  width: "75rem",
                  backgroundColor: "#fcfcfc",
                  fontSize: 19
                }}
              >
                <LineVis
                  className={styles.container6}
                  dataArray={lineData}
                  domain={lineDomain}
                  scaleType={"linear"}
                  curveType="OnlyLine"
                  showGrid={showImsGrid}
                  title={"IMS Graph" + ": " + titleName}
                  abscissaParams={{ value: driftTimes, label: "Drift Time (ms)" }}
                  ordinateLabel="Ion Current pA"
                />
              </div>

              <div style={{ marginTop: "8px" }}>
                <label htmlFor="row-slider" style={{ color: "#000", fontSize: 18 }}>
                  Select Spectra Index:
                </label>
                <input
                  id="row-slider"
                  type="range"
                  min="0"
                  max={dataArray0?.shape[1] - 1 || 0}
                  value={selectedIndex}
                  onChange={handleImsSliderChange}
                />
                <span style={{ color: "#000", marginLeft: "10px", fontSize: 20 }}>
                  {[selectedIndex]}
                </span>
              </div>
            </>
          ) : viewMode === "chromSpectra" ? (
            <>
              <Toolbar className={styles.container4}>
                <ToggleBtn icon={FaTh} label="Grid" onToggle={() => setShowGrid(!showGrid)} />
                <Separator />
                <ToggleBtn icon={FaCamera} label="Snap Shot" onToggle={() => handleSnapshotGC()} />
                <Separator />
                <ToggleBtn icon={FaMap} label="Heatmap View" onToggle={() => setViewMode("heatmap")} />
                <ToggleBtn
                  icon={FaChartArea}
                  label="IMS Spectra"
                  onToggle={() => setViewMode("imsSpectra")}
                />
                <Separator />
                <ToggleBtn icon={FaDownload} label="Download CSV" onToggle={handleDownloadGcCSV} />
                <ToggleBtn icon={FaSlidersH} label="Change Polarity" onToggle={togglePolarity} />
              </Toolbar>

              <div
                ref={chromGram}
                style={{
                  display: "flex",
                  height: "40rem",
                  width: "76rem",
                  backgroundColor: "#fcfcfc",
                  fontSize: 19
                }}
              >
                <LineVis
                  className={styles.container6}
                  dataArray={gcSpectrumData}
                  domain={gcSpectrumDomain}
                  scaleType={"linear"}
                  curveType="OnlyLine"
                  showGrid={showGrid}
                  title={"GC_IMS Graph" + ": " + titleName}
                  abscissaParams={{
                    value:
                      currentPolarity === 0 ? retentionTimes0 : retentionTimes1,
                    label: "Retention Time (s)"
                  }}
                  ordinateLabel="Ion Current (pA)"
                />
              </div>

              <div style={{ marginTop: "8px" }}>
                <label htmlFor="column-slider" style={{ color: "#000", fontSize: 18 }}>
                  Select Spectra Index:
                </label>
                <input
                  id="column-slider"
                  type="range"
                  min="0"
                  max={
                    (currentPolarity === 0
                      ? driftTimes0?.length
                      : driftTimes1?.length) - 1 || 0
                  }
                  value={selectedGcIndex}
                  onChange={handleGcSliderChange}
                />
                <span style={{ color: "#000", marginLeft: "10px", fontSize: 20 }}>
                  {currentPolarity === 0
                    ? [selectedGcIndex]
                    : [selectedGcIndex]}
                </span>
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  </div>
);
}


export default HeatmapUploader;
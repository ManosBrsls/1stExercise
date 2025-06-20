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
  const [heatmapData, setHeatmapData] = useState(null);
  const [heatmapDomain, setHeatmapDomain] = useState(null);

  const [xDomain, setXDomain] = useState([null, null]);
  const [yDomain, setYDomain] = useState([null, null]);

  const [retentionTimes, setRetentionTimes] = useState([null]);
  const [driftTimes, setDriftTimes] = useState([null]);

  const [error, setError] = useState(null);
  const [customDomain, setCustomDomain] = useState([null, null]);
  const [colorMap, setColorMap] = useState("Viridis");
  const [invertColorMap, setInvertColorMap] = useState(false);
  const [scaleType, setScaleType] = useState("linear");
  const [showGrid, setShowGrid] = useState(false);
  const [viewMode, setViewMode] = useState("heatmap");


  const heatmapRef = useRef(null);

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
          (average * i * period) / 1000000000
        );
      }
      for (let i = 0; i < n_cols1; i++) {
        retentionTimes1.push(
          (average * i * period) / 1000000000
        );
      }

      console.log("Drift Times 0:", driftTimes0);
      console.log("Retention Times 0:", retentionTimes0);

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



      console.log("Domain 0:", domain0);

      console.log("Drift Times 0:", driftTimes0);
      console.log("Retention Times 0:", retentionTimes0);

      const twoDArray0 = ndarray(ionCurrent0.data, [ionRow0, ionCol0]);

      const twoDArray1 = ndarray(ionCurrent1.data, [filteredSpectrum1.shape[0], filteredSpectrum1.shape[1]]);
     
      setHeatmapData(dataArray0);
      setHeatmapDomain(domain0);

      setDriftTimes(driftTimes0);
      setRetentionTimes(retentionTimes0);

   

    } catch (err) {
      console.error("Error processing file:", err);
      setError("Error processing file.");
    }

  };



  return (
    <div className={styles.container2}>
      <Sidebar onGCIMSDataUpload={handleGCIMSDataUpload} />

      {error && <div className="error">{error}</div>}

      {heatmapData != null && heatmapDomain != null ? (

        <HeatmapVis
          abscissaParams={{
            value: retentionTimes, label: "Retention time (s)"
          }}
          aspect="auto"
          colorMap="Turbo"
          dataArray={heatmapData}
          domain={heatmapDomain}
          invertColorMap={invertColorMap}
          ordinateParams={{
            value: driftTimes, label: "Drift time (ms)"
          }}
          showGrid={showGrid}
          scaleType="linear"
          interactions={{
            selectToZoom: { modifierKey: "Shift" },
            xAxisZoom: false,
            yAxisZoom: false,
          }}
        />

      ) : (
        <p>Please upload a GC‑IMS .h5 file to render the heatmap.</p>
      )}
    </div>
  );
}


export default HeatmapUploader;
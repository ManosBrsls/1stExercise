"use client";
import React, { useState, useRef, useEffect } from "react";
import { File, FS, h5wasmReady } from "h5wasm";
import ndarray from "ndarray";
import { getDomain, LineVis, Toolbar, ToggleBtn, Separator } from "@h5web/lib";
import html2canvas from "html2canvas";
import { FaCamera, FaDownload, FaTh } from "react-icons/fa";
import Sidebar from "./posts/Sidebar";
import styles from "../styles/Home.module.css";

function IMSLineCharts() {
  const [selectedIndex1, setSelectedIndex1] = useState(0);
  const [selectedIndex2, setSelectedIndex2] = useState(0);
  const [dataArray0, setDataArray0] = useState(null);
  const [currentPolarity1, setCurrentPolarity1] = useState(0);
  const [dataArray1, setDataArray1] = useState(null);
  const [dataArray2, setDataArray2] = useState(null);


  const [driftTimes1, setDriftTimes1] = useState(null);
  const [driftTimes2, setDriftTimes2] = useState(null);
  const [lineData, setLineData] = useState(null);
  const [lineDomain, setLineDomain] = useState(null);

  const [ionData1Pol0, setIonData1Pol0] = useState(null);
  const [ionData2Pol0, setIonData2Pol0] = useState(null);

  const [lineData1, setLineData1] = useState(null);
  const [lineDomain1, setLineDomain1] = useState(null);
  const [lineData2, setLineData2] = useState(null);
  const [lineDomain2, setLineDomain2] = useState(null);

  const [showGrid1, setShowGrid1] = useState(false);
  const [showGrid2, setShowGrid2] = useState(false);

  const imsSpectraRef = useRef(null);

  const togglePolarity = () => {
    const newPol = currentPolarity1 === 0 ? 1 : 0;
    setCurrentPolarity1(newPol);

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
    setSelectedIndex1(0);
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
  }

    const handleImsSliderChange = (event) => {
      const index = parseInt(event.target.value);
      setSelectedIndex1(index);

      const dataArr = dataArray0 
      if (dataArr) {
        const column = new Float32Array(dataArr.shape[0]);
        for (let i = 0; i < dataArr.shape[0]; i++) {
          column[i] = dataArr.get(i, index);
        }
        const lineNdarray1 = ndarray(column, [column.length]);
        setLineData1(lineNdarray1);
        setLineDomain1(getDomain(lineNdarray1));
      }
  };

  const processFile = async (buffer, chartNumber, filename) => {
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

      const values0 = Array.from(ionCurrent0.data);

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
      setCurrentPolarity1(0);

    if (chartNumber === 1) {
      setLineData1(initialLine);
      setLineDomain1(getDomain(initialLine));
      setDriftTimes1(driftTimes0);
      setSelectedIndex1(0);

    } else if (chartNumber === 2) {

      setLineData2(initialLine);
      setLineDomain2(getDomain(initialLine));
      setDriftTimes2(driftTimes0);
      setSelectedIndex2(0);
    }
  };



  const handleSlider2 = (e) => {
    const idx = parseInt(e.target.value);
    setSelectedIndex2(idx);
    const line = ionData2Pol0.pick(idx, null);
    setLineData2(line);
    setLineDomain2(getDomain(line));
  };



  return (
    <div className={styles.container2}>
      <Sidebar onIMSDataSelect={processFile} />
      <div className={styles.card} style={{ marginLeft: 200, backgroundColor: "#084072" }}>
        {ionData2Pol0 && (
          <>
            <Toolbar className={styles.container4}>
              <ToggleBtn icon={FaCamera} label="Snap Shot" onToggle={handleSnapshot} />
              <Separator />
              <ToggleBtn icon={FaTh} label="Grid 1" onToggle={() => setShowGrid1(!showGrid1)} />
              <Separator />
              <ToggleBtn icon={FaTh} label="Grid 2" onToggle={() => setShowGrid2(!showGrid2)} />
              <Separator />
              <ToggleBtn icon={FaDownload} label="Download Chart 1" onToggle={() => downloadCSV(lineData1, driftTimes1, "chart1.csv")} />
              <Separator />
              <ToggleBtn icon={FaDownload} label="Download Chart 2" onToggle={() => downloadCSV(lineData2, driftTimes2, "chart2.csv")} />
            </Toolbar>

            <div ref={imsSpectraRef} style={{ display: "flex", gap: "2rem", height: "40rem", backgroundColor: "#084072" }}>
              <LineVis
                dataArray={lineData1}
                domain={lineDomain1}
                scaleType="linear"
                showGrid={showGrid1}
                title="IMS Spectra Dataset 1"
                abscissaParams={{value:driftTimes0, label: "Drift Time (msec)" }}
                ordinateLabel="Intensity (counts)"
              />
              <LineVis
                dataArray={lineData2}
                domain={lineDomain2}
                scaleType="linear"
                showGrid={showGrid2}
                title="IMS Spectra Dataset 2"
                abscissaParams={{ label: "Drift Time (msec)" }}
                ordinateLabel="Intensity (counts)"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 20 }}>
              <div>
                <label style={{ color: "white" }}>Retention Time 1:</label>
                <input type="range" min="0" max={ionData1Pol0.shape[0] - 1} value={selectedIndex1} onChange={handleSlider1} />
              </div>
              <div>
                <label style={{ color: "white" }}>Retention Time 2:</label>
                <input type="range" min="0" max={ionData2Pol0.shape[0] - 1} value={selectedIndex2} onChange={handleSlider2} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default IMSLineCharts;
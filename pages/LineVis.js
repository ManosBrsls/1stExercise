"use client";
import React, { useState, useRef, useEffect } from "react";
import ndarray from "ndarray";
import {getDomain, Toolbar, Separator, ToggleBtn, LineVis,} from "@h5web/lib";
import * as jsfive from "jsfive";
import { h5wasmReady, FS, File } from "h5wasm";
import "@h5web/lib/dist/styles.css";
import Sidebar from "./posts/Sidebar";
import styles from "../styles/Home.module.css";
import { FaCamera, FaDownload, FaTh } from "react-icons/fa";
import "@fortawesome/fontawesome-svg-core/styles.css";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";




function Linechart() {
  const [heatmapData, setHeatmapData] = useState(null);
  const [heatmapData2, setHeatmapData2] = useState(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedIndex2, setSelectedIndex2] = useState(0);

  const [customDomain, setCustomDomain] = useState([null, null]);
  const [customDomain2, setCustomDomain2] = useState([null, null]);

  const [error, setError] = useState(null);
  const [scaleType, setScaleType] = useState("linear");
  const [showGrid1, setShowGrid1] = useState(false);
  const [showGrid2, setShowGrid2] = useState(false);


  const [lineDomain, setLineDomain] = useState([null, null]);
  const [lineData, setLineData] = useState(null);
  const [lineDomain2, setLineDomain2] = useState([null, null]);
  const [lineData2, setLineData2] = useState(null);
  
  

  const imsSpectra = useRef(null);


  useEffect(() => {
    if (selectedIndex > 20) { // Change 20 to your actual threshold
      Swal.fire({
        title: "⚠ ALERT ⚠",
        text: `VOC Level: ${selectedIndex} ppm`,
        icon: "warning",
        background: "#000",
        color: "#fff",
        confirmButtonText: "OK",
        confirmButtonColor: "#ff0000",
        timer: 10000, // Auto-close after 5 seconds
      });
    }
  }, [selectedIndex]);


  const handleIMSDataUpload = (filename, buffer) => {


   
  };

  const handleIMSDataSelect = async (buffer, chartNumber, filename) => {
    try {
     
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

     

      for(let i = 0; i < spectrumPoints.shape[0]; i++) {
        for(let j = 0; j < spectrumPoints.shape[1]; j++) {
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


      for (let j=0; j < numCols; j++) {
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
    const calibratedData0 = new Float32Array(filteredSpectrum0.shape[0] * filteredSpectrum0.shape[1]);
    const calibratedSpectrum0 = ndarray(calibratedData0, [filteredSpectrum0.shape[0], filteredSpectrum0.shape[1]]);
    
    const calibratedData1 = new Float32Array(filteredSpectrum1.shape[0] * filteredSpectrum1.shape[1]);
    const calibratedSpectrum1 = ndarray(calibratedData1, [filteredSpectrum1.shape[0], filteredSpectrum1.shape[1]]);
    
  if (user_calibration){
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

  }else{
    
  }

  const ion_current0 = [];

  console.log(calibratedSpectrum0.shape)
  console.log(calibratedSpectrum0)

  console.log(calibratedSpectrum1.shape)
  console.log(calibratedSpectrum1)


      
  
      if (chartNumber === 1) {
      const dataArray = ndarray(pointsDataset.value, pointsDataset.shape);
      
      const dataArray2 = ndarray(pointsDataset.value, pointsDataset.shape);
        

      
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

      setHeatmapData({dataArray, dataArray2, domain1: heatMapDomain});


    }else if (chartNumber === 2) {
      const dataArray = ndarray(pointsDataset.value, pointsDataset.shape);
      const dataArray2 = ndarray(pointsDataset.value, pointsDataset.shape);

      
      const rowDataArray2 = Array.from(
        dataArray2.data.slice(
          selectedIndex2 * dataArray2.shape[1],
          (selectedIndex2 + 1) * dataArray2.shape[1]
        )
      );

      const heatMapDomain2 = getDomain(dataArray2);
      setLineDomain2(getDomain(rowDataArray2));

      const initialLineData2 = dataArray2.pick(selectedIndex2, null);
      setLineData2(initialLineData2);
      
      setCustomDomain(heatMapDomain2);

      setHeatmapData2({dataArray, dataArray2, domain1: heatMapDomain2})
      
    }

    } catch (err) {
      console.error("Error processing file:", err);
      setError("Error processing file.");
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

    const handleImsSliderChange2 = (event) => {
      const newIndex2 = parseInt(event.target.value, 10);
      setSelectedIndex2(newIndex2);
      console.log(heatmapData2.dataArray2.shape[0])
      const rowDataArray2 = Array.from(
        heatmapData2.dataArray2.data.slice(
          newIndex2 * heatmapData2.dataArray2.shape[1],
          (newIndex2 + 1) * heatmapData2.dataArray2.shape[1]
        )
      );
      // console.log(rowDataArray)
      const selectedLineData2 = ndarray(rowDataArray2, [rowDataArray2.length]);
      console.log(selectedLineData2)
      setLineData2(selectedLineData2);
  
      const rowDomain = getDomain(selectedLineData2);
      setLineDomain2(rowDomain);
      setCustomDomain2(rowDomain);
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



    return (
      <div className={styles.container2}>
        <Sidebar onIMSDataUpload={handleIMSDataUpload} onIMSDataSelect={handleIMSDataSelect}/>
        <div className={styles.card} style={{borderRadius: "40px", backgroundColor: "#084072", marginLeft: "200px", cursor: "pointer"}}>
          {heatmapData2 &&  (
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
                      label="Grid 1"
                      onToggle={() => setShowGrid1(!showGrid1)}
                    />
                    <Separator />
                    <ToggleBtn
                      icon={FaTh}
                      label="Grid 2"
                      onToggle={() => setShowGrid2(!showGrid2)}
                    />
                    <Separator />
                    <ToggleBtn
                      icon={FaDownload}
                      label="Download CSV Chart1"
                      onToggle={() => handleDownloadImsCSV()}
                    >          
                    </ToggleBtn>
                    <Separator />
                    <ToggleBtn
                      icon={FaDownload}
                      label="Download CSV Chart2"
                      onToggle={() => handleDownloadImsCSV()}
                    >          
                    </ToggleBtn>
              </Toolbar>
              <div ref={imsSpectra} style={{display:"flex", position: "relative", height: "40rem", width: "75rem", backgroundColor: "#084072", fontSize: 19}}>
                  <LineVis
                    className={styles.container6}
                    dataArray={lineData}
                    domain={lineDomain}
                    aspect="auto"
                    scaleType="linear"
                    curveType="OnlyLine"
                    showGrid={showGrid1}
                    title="IMS Spectra Graph 1"
                    abscissaParams={{ label: "Drift Time (msec)" }}
                    ordinateLabel="Intensity Values (counts)"

                  />
                  <LineVis
                    className={styles.container7}
                    dataArray={lineData2}
                    domain={lineDomain2}
                    aspect="auto"
                    scaleType="linear"
                    curveType="OnlyLine"
                    showGrid={showGrid2} // avoid duplicate grid lines
                    title="IMS Spectra Graph 2" // you may leave title empty to avoid overlapping titles
                    abscissaParams={{ label: "Drift Time (msec)" }}
                    ordinateLabel="Intensity Values (counts)"

                  />
              </div>
              <div style={{ display: "flex", alignItems: "auto", gap: "360px", marginTop: "20px" }}>
              <div>
                <label htmlFor="column-slider" style={{ color: "#fff", fontSize: 18 }}>
                  Select Retention time 1:
                </label>
                <input
                  id="column-slider"
                  type="range"
                  min="0"
                  max={heatmapData?.dataArray?.shape[0] - 1}
                  value={selectedIndex}
                  onChange={handleImsSliderChange}
                />
                <span style={{ color: "#fff", marginLeft: "10px", fontSize: 20 }}>
                  {selectedIndex}
                </span>
              </div>
              <div>
                <label htmlFor="column-slider2" style={{ color: "#fff", fontSize: 18 }}>
                  Select Retention time 2:
                </label>
                <input
                  id="column-slider2"
                  type="range"
                  min="0"
                  max={heatmapData2?.dataArray2?.shape[0] - 1 || 0}
                  value={selectedIndex2}
                  onChange={handleImsSliderChange2}
                />
                <span style={{ color: "#fff", marginLeft: "10px", fontSize: 20 }}>
                  {selectedIndex2}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Linechart;
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
  const [heatmapData2, setHeatmapData2] = useState(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedIndex2, setSelectedIndex2] = useState(0);

  const [customDomain, setCustomDomain] = useState([null, null]);
  const [customDomain2, setCustomDomain2] = useState([null, null]);

  const [error, setError] = useState(null);
  const [scaleType, setScaleType] = useState("linear");
  const [showGrid, setShowGrid] = useState(false);


  const [lineDomain, setLineDomain] = useState([null, null]);
  const [lineData, setLineData] = useState(null);
  const [lineDomain2, setLineDomain2] = useState([null, null]);
  const [lineData2, setLineData2] = useState(null);
  
  

  const imsSpectra = useRef(null);


  const handleGCIMSDataUpload = (filename, buffer) => {

    // try {
    //   const h5File = new jsfive.File(buffer);

    //   const valuesDataset = h5File.get("spectrumPoints");
    //   const dataArray = ndarray(valuesDataset.value, valuesDataset.shape);


    //   const rowDataArray = Array.from(
    //     dataArray.data.slice(
    //       selectedIndex * dataArray.shape[1],
    //       (selectedIndex + 1) * dataArray.shape[1]
    //     )
    //   );

    //   const heatMapDomain = getDomain(dataArray);
    //   setLineDomain(getDomain(rowDataArray));

    //   const initialLineData = dataArray.pick(selectedIndex, null);
    //   setLineData(initialLineData);
      
    //   setCustomDomain(heatMapDomain);

    //   setHeatmapData({dataArray, domain1: heatMapDomain});

    //   setChromData(finalChromArray)
    //   setChromDomain(chromDomain)

    // } catch (err) {
    //   console.error("Error processing file:", err);
    //   setError("Error processing file.");
    // }
   
  };

  const handleGCIMSDataSelect = (buffer, chartNumber, filename) => {
    try {
      console.log(filename)
      const h5File = new jsfive.File(buffer);

      const valuesDataset = h5File.get("spectrumPoints");

      

      if (chartNumber === 1) {
      const dataArray = ndarray(valuesDataset.value, valuesDataset.shape);
      
      const dataArray2 = ndarray(valuesDataset.value, valuesDataset.shape);
        

      
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
      const dataArray = ndarray(valuesDataset.value, valuesDataset.shape);
      const dataArray2 = ndarray(valuesDataset.value, valuesDataset.shape);

      
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
        <Sidebar onGCIMSDataUpload={handleGCIMSDataUpload} onGCIMSDataSelect={handleGCIMSDataSelect}/>
        <div className={styles.card} style={{borderRadius: "40px", backgroundColor: "#084072", marginLeft: "350px", cursor: "pointer"}}>
          {heatmapData2 &&  (
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
                      icon={FaDownload}
                      label="Download CSV"
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
                    showGrid={showGrid}
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
                    showGrid={showGrid} // avoid duplicate grid lines
                    title="IMS Spectra Graph 2" // you may leave title empty to avoid overlapping titles
                    abscissaParams={{ label: "Drift Time (msec)" }}
                    ordinateLabel="Intensity Values (counts)"

                  />
              </div>
              <div style={{ marginBottom: "0 px" }}>
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
              <div style={{ marginLeft: "700px" }}>
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
            </>
          )}
        </div>
      </div>
    );
  }

export default HeatmapUploader;


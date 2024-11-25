"use client";

import { Line } from "react-chartjs-2";
import styles from "../styles/Home.module.css";
import React, { useEffect, useReducer, useState, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "@fortawesome/fontawesome-svg-core/styles.css";  
import { faBorderAll, faCamera, faDownload, faHome, faRefresh, faCircleDot } from '@fortawesome/free-solid-svg-icons';

import {
  Chart as ChartJS,
  LineElement,
  registerables,
  CategoryScale, // x axis
  LinearScale, // y axis
  PointElement,
  Legend,
  Tooltip,
  Filler,
  Title,
} from "chart.js";

import zoomPlugin from 'chartjs-plugin-zoom';

import Sidebar from "./posts/Sidebar";
import { faCircleDot as faCircleDotSolid } from "@fortawesome/free-solid-svg-icons/faCircleDot";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  zoomPlugin,
  Legend,
  Tooltip,
  Filler,
);

function LineChart1() {
  // State for datasets
  const [timeData, setTimeData] = useState([]);
  const [valueData, setValueData] = useState([]);
  const [secondTimeData, setSecondTimeData] = useState([]);
  const [secondValueData, setSecondValueData] = useState([]);
  const [title, setTitle] = useState("")
  const [title2, setTitle2] = useState("")
  
  // State for grid and points visibility
  const [showGrid1, setGrid1] = useState(true);
  const [showPoints1, setShowPoints1] = useState(true); 
  const [showGrid2, setGrid2] = useState(true);
  const [showPoints2, setShowPoints2] = useState(true); 

  // Refs for charts
  const chartRef = useRef(null);
  const chartRef1 = useRef(null)

  // Handlers for zoom reset
  const handleResetZoom1 = () => {
    if (chartRef && chartRef.current) {
      chartRef.current.resetZoom()
    }
  };
  
  const handleResetZoom2 = () => {
    if (chartRef1 && chartRef1.current) {
      chartRef1.current.resetZoom()
    }
  };

  // Handler for download button
  const handleDownload = (chartRef, filename) => {
    if (chartRef.current) {
      const image = chartRef.current.toBase64Image('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = filename;
      link.click();
    }
  };

  // Handler to select dataset
  const handleSelectDataset = (newTimeData, newValueData, chartNumber, filename) => {
    if (chartNumber === 1) {
      setTimeData(newTimeData);
      setValueData(newValueData);
      setTitle(filename)
    } else if (chartNumber === 2) {
      setSecondTimeData(newTimeData);
      setSecondValueData(newValueData);
      setTitle2(filename)
    }
  };
  
  // Chart data and options templates
  const dataTemplate = (timeData, valueData, showPoints) => ({
    labels: timeData,
    datasets: [
      {
        pointStyle: "crossRot",
        pointRadius: showPoints ? 3 : 0, // Toggle point radius
        label: "Dataset",
        data: valueData,
        borderColor: "#1d950f",
        borderWidth: 3,
        pointBorderColor: "#F8001f",
        pointBorderWidth: 2,
        tension: 0.6,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
          gradient.addColorStop(0, "#34d923");
          gradient.addColorStop(1, "white");
          return gradient;
        },
      },
    ],
  });

  const optionsTemplate = (showGrid, showPoints, title, title2) => ({
    plugins: {
      chartAreaBorder: {
        borderColor: 'white',
        borderWidth: 4
      },
      zoom: {
        zoom: {
          pinch: {
            enabled: true
          },
          wheel: {
            enabled: true
          },
          drag:{
            enabled: true,
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1,
            backgroundColor: 'rgba(54, 162, 235, 0.3)'
          },
          mode: 'x',
        }
      },
      legend: {
        labels:{
          color: 'white',
          font: {
            size: 16
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: "white",
        font:{
          size: 28,
          weight: "bold",
          family: "Arial"
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false, // Allow height to be controlled by container
    scales: {
      y: {
        grid: {
          display: showGrid,
          color: "magenta",
        },
        ticks: {
          callback: function(value, index, values) {
            if (value === 0) return 0;
            const exponent = Math.floor(Math.log10(value));
            const mantissa = value / Math.pow(10, exponent);
            return mantissa.toPrecision(3) + "e" + exponent;
          },
          font: {
            size: 18,
            weight: "bold",
          },
          maxTicksLimit: 8,
          color: "white"
        },
        title: {
          color:'white',
          display: true,
          text: "Value (counts)",
          padding: {
            bottom: 10,
            right: 20,
            left: 50,
            top: 15
          },
          font: {
            size: 34,
            style: "italic",
            family: "Helvetica Neue",
          },
        },
        min: 200000,
      },
      x: {
        grid: {
          display: showGrid,
          color: "magenta"
        },
        ticks:{
          font: {
            size: 18,
            weight: "semi bold",
          },
          maxTicksLimit: 10,
          minTicksLimit: 8,
          color: "white"
        },
        title: {
          color: 'white',
          display: true,
          text: "Time (min)",
          padding: {
            top: 25,
            bottom:20,
            left: 30,
            right: 30,
          },
          font: {
            size: 34,
            style: "italic",
            family: "Helvetica Neue",
          },
        },
      },
    },   
  });

  const data1 = dataTemplate(timeData, valueData, showPoints1);
  const data2 = dataTemplate(secondTimeData, secondValueData, showPoints2);
  const options1 = optionsTemplate(showGrid1, showPoints1, title);
  const options2 = optionsTemplate(showGrid2, showPoints2, title2);

  const handleDataUpload = (filenames) => {
    // Handle data upload if needed
  };

  return (
    <div className={styles.container2}>
      <Sidebar onDataUpload={handleDataUpload} onSelectDataset={handleSelectDataset} />
      
      <div className={styles.chartWrapper}>
        <div className={styles.card1}>
          <div className={styles.buttonGroup}>
            <button 
              className={styles.button} 
              onClick={() => handleDownload(chartRef, 'chart1.png')}
            >
              <FontAwesomeIcon icon={faCamera} size="lg" className={styles.iconsmall}/>Snap Shot
            </button>
            <button 
              className={styles.button} 
              onClick={handleResetZoom1}
            >
              <FontAwesomeIcon icon={faRefresh} size="lg" />Reset Zoom
            </button>
            <button 
              className={styles.button} 
              onClick={() => setShowPoints1(!showPoints1)}
            >
              <FontAwesomeIcon icon={faCircleDotSolid} size="lg" />Show/Hide Points
            </button>
            <button 
              className={styles.button} 
              onClick={() => setGrid1(!showGrid1)}
            >
              <FontAwesomeIcon icon={faBorderAll} size="lg" />Show/Hide Grid
            </button>
          </div>
          <div className={styles.chartContainer}>
            <Line ref={chartRef} data={data1} options={options1}></Line>
          </div>
        </div>
        
        <div className={styles.card1}>
          <div className={styles.buttonGroup}>
            <button 
              className={styles.button} 
              onClick={() => handleDownload(chartRef1, 'chart2.png')}
            >
              <FontAwesomeIcon icon={faCamera} size="lg" className={styles.iconsmall}/>Snap Shot
            </button>
            <button 
              className={styles.button} 
              onClick={handleResetZoom2}
            >
              <FontAwesomeIcon icon={faRefresh} size="lg" />Reset Zoom
            </button>
            <button 
              className={styles.button} 
              onClick={() => setShowPoints2(!showPoints2)}
            >
              <FontAwesomeIcon icon={faCircleDotSolid} size="lg" />Show/Hide Points
            </button>
            <button 
              className={styles.button} 
              onClick={() => setGrid2(!showGrid2)}
            >
              <FontAwesomeIcon icon={faBorderAll} size="lg" />Show/Hide Grid
            </button>
          </div>
          <div className={styles.chartContainer}>
            <Line ref={chartRef1} data={data2} options={options2}></Line>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LineChart1;

"use client";

import { Line } from "react-chartjs-2";
import styles from "../styles/Home.module.css"
import React, { useEffect, useReducer, useState, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "@fortawesome/fontawesome-svg-core/styles.css";  
import { faBorderAll, faCamera, faDownload, faHome, faRefresh } from '@fortawesome/free-solid-svg-icons';

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


  // //updating data in the graph
  const [timeData, setTimeData] = useState([]);
  const [valueData, setValueData] = useState([]);

  const [secondTimeData, setSecondTimeData] = useState([]);
  const [secondValueData, setSecondValueData] = useState([]);
  //showing Grid and Points in the graph
  const [showGrid, setGrid] = useState(true);
  const [showPoints, setShowPoints] = useState(true); 
  const chartRef = React.useRef(null);
  const chartRef1 = useRef(null)
  const [title, setTitle] = useState("")
  const [title2, setTitle2] = useState("")


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


  const handleResetZoom = () => {
    if (chartRef && chartRef.current) {
      chartRef.current.resetZoom()

    }
  };

  // Function to handle the download button click
  const handleDownload = () =>{
     // Get the base64 image data from the chart
    const image = chartRef.current.toBase64Image('image/png');

    const link = document.createElement('a');
    link.href = image;
    link.download = 'ImsChart.png';

    //Trigger the download
    link.click();

  }

console.log("timeData", timeData)
  const data = {
    labels: timeData,
    datasets: [
      {
        pointStyle: "crossRot",
        pointRadius: showPoints ? 0 : 1.3,
        label: title,
        data: valueData,
        borderColor: "#7efa02",
        borderWidth: 3,
        pointBorderColor: "#F8001f",
        pointBorderWidth: 13,
        tension: 0.6,
        fill: false,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 1050);
          gradient.addColorStop(0, "#4b8c0a");
          gradient.addColorStop(1, "white");
          return gradient;
        },
      },
      {
        pointStyle: "crossRot",
        pointRadius: showPoints ? 0 : 1.3,
        label: title2,
        data: secondValueData,
        borderColor: "#ffc833",
        borderWidth: 3,
        pointBorderColor: "#fc9105",
        pointBorderWidth: 13,
        tension: 0.6,
        fill: false,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 1050);
          gradient.addColorStop(0, "#bf8e08");
          gradient.addColorStop(1, "white");
          return gradient;
        },
      },
    ],


  };


  const options = {
    plugins: {
      chartAreaBorder:{
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
        display: "enable",
        text: "IMS Linechart",
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
    scales: {
      y: {
        border:{
          color: 'white',
          borderWidth: 3
        },
        grid:{
          display: showGrid ? true : false,
          color: "magenta",
        },
        border:{
          dash: [8, 4]
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
        border:{
          color: 'white',
        },
        grid: {
          display: showGrid ? true : false,
          color: "magenta"
        },
        border:{
          dash: [8, 4]
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
  };


  const handleDataUpload = (filenames) => {
    // Handle data upload if needed
  };



return (
  <div className={styles.container2}>


<Sidebar onDataUpload={handleDataUpload} onSelectDataset={handleSelectDataset}/>
<div className={styles.chartWrapper}>
        <div className={styles.card1}>
          <div className={styles.buttonGroup}>
            <button 
              className={styles.button} 
              onClick={() => handleDownload(chartRef, 'chart.png')}
            >
              <FontAwesomeIcon icon={faCamera} size="lg" className={styles.iconsmall}/>Snap Shot
            </button>
            <button 
              className={styles.button} 
              onClick={handleResetZoom}
            >
              <FontAwesomeIcon icon={faRefresh} size="lg" />Reset Zoom
            </button>
            <button 
              className={styles.button} 
              onClick={() => setShowPoints(!showPoints)}
            >
              <FontAwesomeIcon icon={faCircleDotSolid} size="lg" />Show/Hide Points
            </button>
            <button 
              className={styles.button} 
              onClick={() => setGrid(!showGrid)}
            >
              <FontAwesomeIcon icon={faBorderAll} size="lg" />Show/Hide Grid
            </button>
          </div>
          <div className={styles.chartContainer}>
            <Line ref={chartRef} data={data} options={options}></Line>
          </div>
        </div>
    </div>
    </div>
);
}

export default LineChart1;


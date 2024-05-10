"use client";



import { Line } from "react-chartjs-2";
import styles from "../styles/Home.module.css"
import React, { useEffect, useReducer, useState } from "react";
import {Card} from '@tremor/react'
import Papa from 'papaparse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "@fortawesome/fontawesome-svg-core/styles.css";  
import { faBorderAll, faCamera, faDownload, faHome, faRefresh } from '@fortawesome/free-solid-svg-icons';
import Sidebar2 from "./posts/Sidebar_test";




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
import { faCircleDot } from "@fortawesome/free-solid-svg-icons/faCircleDot";

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

  //updating data in the graph
  const [timeData, setTimeData] = useState([]);
  const [valueData, setValueData] = useState([]);
  //showing Grid and Points in the graph
  const [showGrid, setGrid] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  
  const chartRef = React.useRef(null);

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
    link.download = 'my_chart.png';

    //Trigger the download
    link.click();

  }

  const handleUploadConfirm = () => {
    Papa.parse(document.getElementById('uploadfile').files[0], {
      download: true,
      header: false,
      skipEmptyLines: true,
      complete: function(results) {
        const newTimeData = [];
        const newValueData = [];
        
        // skip the first 39 rows to get the data i wanted
        for (let i = 39; i < results.data.length; i++){
          

          //cutting digits from time data
          const trimmedTime = results.data[i][0].substring(0, 5);

          newTimeData.push(trimmedTime);
          newValueData.push(results.data[i][2]);

        }
        console.log(results)
        setTimeData(newTimeData);
        setValueData(newValueData);
      }
    });
  
  }

  
  const data = {
    labels: timeData,
    datasets: [
      {
        pointStyle: "crossRot",
        pointRadius: showPoints ? 0 : 1.3,
        label: "Dataset",
        data: valueData,
        borderColor: "#1d950f",
        borderWidth: 3,
        pointBorderColor: "#F8001f",
        pointBorderWidth: 13,
        tension: 0.6,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 1050);
          gradient.addColorStop(0, "#34d923");
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
        text: "Whole Dataset",
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
          text: "Value",
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
          text: "Time",
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

  


return (
    <div className={styles.container2}>
      <Sidebar2 />
        <div className={styles.buttonColumn}> 
          <div>
            <input style={{backgroundColor: "#e7e7e7", borderRadius: 15, padding: 6, textAlign: "center", marginLeft:"10px", marginTop: "100px", fontSize: 25, fontWeight: "bold"}} type="file" id="uploadfile" accept=".csv"></input>
            <div className={styles.buttonText}>The file should contain the data you would like to visualize</div>
          </div>
          <div>
            <button id="uploadconfirm" style={{backgroundColor: "#e7e7e7",  borderRadius: 20, padding: 20, textAlign: "center", marginLeft:"100px", fontSize: 25, fontWeight: "bold"}} onClick={handleUploadConfirm}>Upload File</button>
            <div className={styles.buttonText}>Confirm the upload of the file and proceed to visualization </div>
          </div>
        </div>
      <div className={styles.card}
          style={{
            borderRadius: "40px",
            backgroundColor: "#084072",
            //width: "1450px",
            //height: "550px",
            marginLeft: "100px",
            marginTop: "50px",
            cursor: "pointer",
          }}
        >
          <div >
            <button style={{ backgroundColor: "#e7e7e7", borderRadius: 15, padding: 6, textAlign: "center", marginLeft: "10px" }} onClick={handleDownload}><FontAwesomeIcon icon={faCamera} size="lg" className={styles.iconsmall}/>Export Chart</button>
            <Line ref={chartRef} data={data} options={options}></Line>
            <button style={{backgroundColor: "#e7e7e7",  borderRadius: 15, padding: 6, textAlign: "center"}} onClick={handleResetZoom}><FontAwesomeIcon icon={faRefresh} size="lg" />Reset Zoom</button>
            <button style={{backgroundColor: "#e7e7e7",  borderRadius: 15, padding: 6, textAlign: "center", marginLeft:"10px"}} onClick={() => setShowPoints(!showPoints)}><FontAwesomeIcon icon={faCircleDot} size="lg" />Show/Hide Points</button>
            <button style={{backgroundColor: "#e7e7e7",  borderRadius: 15, padding: 6, textAlign: "center", marginLeft:"10px"}} onClick={() => setGrid(!showGrid)}><FontAwesomeIcon icon={faBorderAll} size="lg" />Show/Hide Grid</button>
        </div>
      </div> 
    </div>
);

}

export default LineChart1;
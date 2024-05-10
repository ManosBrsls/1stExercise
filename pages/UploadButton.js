
import React, { useEffect, useReducer, useState } from "react";
import Papa from 'papaparse';

const UploadButton = ({ onDataUpload }) => {
   const [timeData, setTimeData] = useState([]);
   const [valueData, setValueData] = useState([]);

  const handleUploadConfirm = () => {
    console.log("onDataUpload prop:", onDataUpload);
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
        console.log(newTimeData)
        setTimeData(newTimeData);
        setValueData(newValueData);
      }
    });
  
  }

  return (
    <div>
      <input style={{ display: 'none' }} type="file" id="uploadfile" accept=".csv" onChange={handleUploadConfirm} />
      <button style={{ backgroundColor: '#e7e7e7', borderRadius: 15, padding: 6, textAlign: 'center', marginLeft: '10px', marginTop: '100px', fontSize: 25, fontWeight: 'bold' }} onClick={() => document.getElementById('uploadfile').click()}>Upload File</button>
    </div>
  );
};

export default UploadButton;
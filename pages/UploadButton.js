"use client";

import React from 'react';
import Papa from 'papaparse';


const UploadButton = ({ onUpload }) => {
    const handleUpload = (event) => {
      const files = Array.from(event.target.files);
      files.forEach((file) => {
        Papa.parse(file, {
          download: true,
          header: false,
          skipEmptyLines: true,
          complete: function (results) {
            const newTimeData = [];
            const newValueData = [];
            for (let i = 39; i < results.data.length; i++) {
              const trimmedTime = results.data[i][0].substring(0, 5);
              newTimeData.push(trimmedTime);
              newValueData.push(results.data[i][2]);
            }
            onUpload(file.name, newTimeData, newValueData);
          },
        });
      });
    };
  
    const handleButtonClick = () => {
      document.getElementById('uploadfile').click();
    };
  
    return (
      <div>
        <input
          style={{ display: 'none' }}
          type="file"
          id="uploadfile"
          accept=".csv"
          multiple
          onChange={handleUpload}
        />
        <button
          style={{
            backgroundColor: '#e7e7e7',
            borderRadius: 15,
            padding: 6,
            textAlign: 'center',
            marginLeft: '10px',
            marginTop: '15px',
            fontSize: 10,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={handleButtonClick}
        >
          Upload
        </button>
      </div>
    );
  };
  
  export default UploadButton;

"use client";

import React from 'react';
import Papa from 'papaparse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpLong, faUpload } from '@fortawesome/free-solid-svg-icons';

function UploadButton({ onUpload }) {
    const handleUpload = (event) => {
        const file = event.target.files[0];
        Papa.parse(file, {
            download: true,
            header: false,
            skipEmptyLines: true,
            complete: function(results) {
                const newTimeData = [];
                const newValueData = [];
                for (let i = 39; i < results.data.length; i++) {
                    const trimmedTime = results.data[i][0].substring(0, 5);
                    newTimeData.push(trimmedTime);
                    newValueData.push(results.data[i][2]);
                }
                onUpload(newTimeData, newValueData);
            }
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
                onChange={handleUpload}
            />
            <button
                style={{
                    backgroundColor: '#e7e7e7',
                    borderRadius: 15,
                    padding: 6,
                    textAlign: 'center',
                    marginLeft: '10px',
                    marginTop: '100px',
                    fontSize: 25,
                    fontWeight: 'bold'
                }}
                onClick={handleButtonClick}
            >
            <FontAwesomeIcon 
                icon={faUpload}
                style={iconStyle}
                fontSize={"3.5em"}
            />
                Upload File
            </button>
        </div>
    );
}

export default UploadButton;
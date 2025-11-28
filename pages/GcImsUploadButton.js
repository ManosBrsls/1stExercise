"use client";

import React from 'react';



const GCIMSUploadButton = ({ onUpload }) => {
  const handleUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = function(evt) {
        const buffer = evt.target.result;
        onUpload(file.name, buffer);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleButtonClick = () => {
    document.getElementById('gcims-uploadfile').click();
  };

  return (
    <div>
      <input
        style={{ display: 'none' }}
        type="file"
        id="gcims-uploadfile"
        accept=".hdf5, .h5"
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
          marginTop: '5px',
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

export default GCIMSUploadButton;

"use client";

import React, { forwardRef, useRef } from "react";

const IMSUploadButton = forwardRef(({ onUpload, style }, ref) => {
  const fileInputRef = useRef(null);

  React.useImperativeHandle(ref, () => ({
    openFileDialog() {
      fileInputRef.current?.click();
    },
  }));

  const handleUpload = (event) => {
    const files = Array.from(event.target.files);
    const totalCount = files.length; // send total count to Sidebar

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = function (evt) {
        const buffer = evt.target.result;
        onUpload(file.name, buffer, totalCount);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div style={style}>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleUpload}
      />

      <button
        onClick={() => fileInputRef.current.click()}
        style={{
          padding: "6px 12px",
          borderRadius: "15px",
          cursor: "pointer",
        }}
      >
        Upload
      </button>
    </div>
  );
});

export default IMSUploadButton;

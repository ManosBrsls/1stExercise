"use client";

import React, { forwardRef, useRef } from "react";

const IMSUploadButton = forwardRef(({ onUpload }, ref) => {
  const fileInputRef = useRef(null);

  // Expose the openFileDialog() method to parents
  React.useImperativeHandle(ref, () => ({
    openFileDialog() {
      fileInputRef.current?.click();
    }
  }));

  const handleUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = function (evt) {
        const buffer = evt.target.result;
        onUpload(file.name, buffer);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div>
      <input
        id="gcims-uploadfile"
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleUpload}
      />

      <button
        onClick={() => fileInputRef.current.click()}
        style={{
          padding: "6px 12px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Upload
      </button>
    </div>
  );
});

export default IMSUploadButton;
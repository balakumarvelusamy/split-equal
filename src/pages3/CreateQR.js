import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { saveAs } from "file-saver";

const QRGenerator = () => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  function isWebView() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (window.ReactNativeWebView) {
      return true;
    }
    if (/iPhone|iPad|iPod/.test(userAgent) && /AppleWebKit/.test(userAgent) && !/Safari/.test(userAgent)) {
      return true;
    }
    if (/wv|WebView/.test(userAgent)) {
      return true;
    }
    return false;
  }
  const saveToLocalStorage = (data) => {
    const history = JSON.parse(localStorage.getItem("qrHistory")) || [];
    const updatedHistory = [data, ...history];
    localStorage.setItem("qrHistory", JSON.stringify(updatedHistory));
  };

  const handleGenerateQR = () => {
    if (!inputValue.trim()) return;
    saveToLocalStorage(inputValue);
    alert("QR Code saved to history!");
  };

  const handleDownloadQR = () => {
    const canvas = document.querySelector("canvas");

    if (!canvas) {
      alert("QR Code not found!");
      return;
    }

    // Convert canvas to Blob
    canvas.toBlob((blob) => {
      if (!blob) {
        alert("Failed to generate QR code image.");
        return;
      }

      // Use FileSaver.js to download the Blob
      saveAs(blob, "qr-code.png");
    }, "image/png");
  };

  return (
    <div className="container">
      <h2>QR Code Generator</h2>

      <input type="text" className="form-control" placeholder="Enter text or URL" value={inputValue} onChange={handleInputChange} style={{ padding: "12px", margin: "10px 0", width: "100%" }} />

      {inputValue && (
        <div align="center" className="py-3">
          <QRCodeCanvas value={inputValue} size={300} />
          <br />
          <button
            className="btn btn-md btn-warning text-dark w-auto mt-4"
            onClick={() => {
              handleGenerateQR();
            }}
          >
            Save QR
          </button>{" "}
          <button
            className="btn btn-md btn-success w-auto mt-4"
            onClick={() => {
              handleDownloadQR();
            }}
          >
            Download QR Code
          </button>
        </div>
      )}
    </div>
  );
};

export default QRGenerator;

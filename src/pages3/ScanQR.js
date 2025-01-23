import React, { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import copy from "../images/copy.png";
const QRScanner = () => {
  const [scannedData, setScannedData] = useState("");
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [qrHistory, setQrHistory] = useState([]);

  // Load history from local storage on mount
  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem("qrHistory")) || [];
    setQrHistory(storedHistory);
  }, []);

  const saveToLocalStorage = (data) => {
    const updatedHistory = [data, ...qrHistory];
    setQrHistory(updatedHistory); // Update the local state
    localStorage.setItem("qrHistory", JSON.stringify(updatedHistory)); // Save to local storage
  };

  const startScanner = async () => {
    try {
      setScannedData("");
      if (html5QrCode) {
        await stopScanner();
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (stream) {
        const qrScanner = new Html5Qrcode("reader");
        setHtml5QrCode(qrScanner);
        setIsScanning(true);

        await qrScanner.start({ facingMode: "environment" }, { fps: 10, qrbox: null }, (decodedText) => {
          setScannedData(decodedText);
          saveToLocalStorage(decodedText); // Save the scanned data to history
          qrScanner.stop();
          setHtml5QrCode(null);
          setIsScanning(false);
        });
      }
    } catch (error) {
      console.error("Camera error:", error);
      alert("Failed to access the camera. Please check permissions and try again.");
      setIsScanning(false);
      setScannedData("");
    }
  };

  const stopScanner = async () => {
    if (html5QrCode) {
      try {
        await html5QrCode.stop();
        html5QrCode.clear();
        setHtml5QrCode(null);
        setIsScanning(false);
        console.log("Camera stopped.");
      } catch (err) {
        console.error("Failed to stop the camera:", err);
        setIsScanning(false);
      }
    }
  };

  const isValidUrl = (url) => {
    const urlPattern = new RegExp(
      "^[a-zA-Z][a-zA-Z\\d+.-]*:" + // Custom scheme (e.g., tg://, myapp://, etc.)
        "\\/\\/?" + // Optional double slashes (e.g., `tg://` or `tg:/`)
        "([^\\s?#]*)?" + // Host or path (optional)
        "(\\?[^\\s#]*)?" + // Query string (optional, starts with `?`)
        "(#.*)?$", // Fragment locator (optional, starts with `#`)
      "i"
    );
    return urlPattern.test(url);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert("Copied to clipboard!");
      },
      (err) => {
        console.error("Failed to copy: ", err);
      }
    );
  };

  useEffect(() => {
    return () => {
      stopScanner(); // Stop the scanner on component unmount
    };
  }, []);

  return (
    <>
      <div align="center" className="container">
        <h2>QR Code Scanner</h2>
        <div id="reader" className="rounded" style={{ width: "100%", maxWidth: "500px", border: "1px solid #ccc", height: "350px", margin: "auto", position: "relative" }}></div>

        <div className="p-2">
          {scannedData && (
            <>
              <p className="mb-0 d-none">Scanned Data: </p>
              {isValidUrl(scannedData) ? (
                <>
                  <a href={scannedData} target="_blank" className=" p-2 rounded bg-warning text-dark mx-2 text-decoration-none" rel="noopener noreferrer">
                    Open
                  </a>{" "}
                  <a className=" p-2 rounded bg-success text-white mx-2 text-decoration-none" rel="noopener noreferrer" onClick={() => copyToClipboard(scannedData)}>
                    Copy
                  </a>
                </>
              ) : (
                <span className="px-1 rounded border mx-2">
                  <small>
                    <a className=" p-2 rounded bg-success text-white mx-2 text-decoration-none" rel="noopener noreferrer" onClick={() => copyToClipboard(scannedData)}>
                      Copy
                    </a>
                  </small>
                </span>
              )}
            </>
          )}
        </div>
      </div>
      <div align="center" className="control-buttons" style={{ marginTop: "10px", marginBottom: "10px", position: "relative", zIndex: 10000 }}>
        {!isScanning ? (
          <button className="btn btn-warning mt-3 w-auto" onClick={startScanner}>
            Start Scanning
          </button>
        ) : (
          <button className="btn btn-danger mt-3 w-auto" onClick={stopScanner}>
            Stop Scanning
          </button>
        )}
      </div>
    </>
  );
};

export default QRScanner;

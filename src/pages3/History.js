import React, { useState } from "react";
import bin from "../images/bin.png";
import copy from "../images/copy.png";
const QRHistory = () => {
  const [history, setHistory] = useState(JSON.parse(localStorage.getItem("qrHistory")) || []);

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear the QR code history?")) {
      localStorage.removeItem("qrHistory");
      setHistory([]);
    }
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

  return (
    <div className="container">
      <h2>QR Code History</h2>
      {history.length === 0 ? (
        <p align="center">No history found.</p>
      ) : (
        <>
          <ul className="list-group">
            {history.map((item, index) => (
              <li key={index} className="p-1 list-group-item d-flex justify-content-between align-items-center">
                <small>{item.length > 30 ? `${item.slice(0, 30)}...` : item}</small>
                <div>
                  <img
                    src={bin}
                    width="25"
                    className="mx-1"
                    onClick={() => {
                      const isConfirmed = window.confirm("Are you sure you want to delete this item?");
                      if (isConfirmed) {
                        const updatedHistory = history.filter((_, i) => i !== index);
                        localStorage.setItem("qrHistory", JSON.stringify(updatedHistory));
                        setHistory(updatedHistory);
                      }
                    }}
                  />

                  <img src={copy} width="20" className="mx-1 d-none" onClick={() => copyToClipboard(item)} />
                  {isValidUrl(item) ? (
                    // <a href={item} target="_blank" className=" rounded text-dark bg-warning p-1  text-decoration-none" rel="noopener noreferrer">
                    //   Open
                    // </a>
                    <a className=" rounded text-white bg-success p-1  text-decoration-none" rel="noopener noreferrer" onClick={() => copyToClipboard(item)}>
                      Copy
                    </a>
                  ) : (
                    <a className=" rounded text-white bg-success p-1  text-decoration-none" rel="noopener noreferrer" onClick={() => copyToClipboard(item)}>
                      Copy
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div align="center" className="mb-3">
            <button className="btn w-auto btn-danger p-1 px-2 my-3" onClick={handleClearHistory}>
              Clear All History
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default QRHistory;

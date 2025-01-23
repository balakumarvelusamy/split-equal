import React, { useState } from "react";

const TinyURLGenerator = () => {
  const [longUrl, setLongUrl] = useState("");
  const [uniqueName, setUniqueName] = useState("");
  const [expiry, setExpiry] = useState("6");
  const [tinyUrl, setTinyUrl] = useState("");

  const handleGenerateTinyURL = async () => {
    if (!longUrl.trim()) return alert("Please enter a valid long URL!");

    // Example API call (replace with your actual API endpoint)
    const payload = {
      longUrl: longUrl.trim(),
      uniqueName: uniqueName.trim(),
      expiry: expiry === "no-expiry" ? null : Number(expiry) * 3600, // Convert hours to seconds
    };

    try {
      // Simulated API response
      const response = await fetch("https://your-tinyurl-api.com/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        setTinyUrl(data.tinyUrl); // Example response format: { tinyUrl: "https://tinyurl.com/uniqueName" }
      } else {
        alert(data.message || "Failed to generate Tiny URL. Please try again.");
      }
    } catch (error) {
      console.error("Error generating Tiny URL:", error);
      alert("An error occurred while generating the Tiny URL. Please try again.");
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(tinyUrl).then(
      () => alert("Tiny URL copied to clipboard!"),
      (err) => console.error("Failed to copy text: ", err)
    );
  };

  const handleShareTinyURL = () => {
    if (navigator.share) {
      navigator.share({ title: "Small URL", text: "Check out this link:", url: tinyUrl }).catch((err) => console.error("Error sharing Tiny URL:", err));
    } else {
      alert("Share functionality is not supported in this browser.");
    }
  };

  return (
    <div className="container">
      <h2>Small URL Generator</h2>
      <div className="form-group">
        <label htmlFor="longUrl">Long URL</label>
        <input type="text" id="longUrl" className="form-control" placeholder="Enter the long URL" value={longUrl} onChange={(e) => setLongUrl(e.target.value)} />
      </div>
      <div className="form-group mt-3">
        <label htmlFor="uniqueName">Unique Small URL Name (Optional)</label>
        <input type="text" id="uniqueName" className="form-control" placeholder="Enter a custom name for the tiny URL" value={uniqueName} onChange={(e) => setUniqueName(e.target.value)} />
      </div>
      <div className="form-group mt-3">
        <label htmlFor="expiry">Expiry Time</label>
        <select id="expiry" className="form-select" value={expiry} onChange={(e) => setExpiry(e.target.value)}>
          <option value="no-expiry">No Expiry</option>
          <option value="1">1 Hour</option>
          <option value="6">6 Hours</option>
          <option value="24">24 Hours</option>
          <option value="72">3 Days</option>
        </select>
      </div>
      <button className="btn btn-warning w-auto mt-3" onClick={handleGenerateTinyURL}>
        Generate Tiny URL
      </button>
      {tinyUrl && (
        <div className="mt-4">
          <h5>Your Tiny URL:</h5>
          <p>
            <a href={tinyUrl} target="_blank" rel="noopener noreferrer">
              {tinyUrl}
            </a>
          </p>
          <button className="btn btn-success me-2" onClick={handleCopyToClipboard}>
            Copy Tiny URL
          </button>
          <button className="btn btn-primary" onClick={handleShareTinyURL}>
            Share Tiny URL
          </button>
        </div>
      )}
    </div>
  );
};

export default TinyURLGenerator;

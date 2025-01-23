import React from "react";

const ImageResult = ({ image }) => {
  if (!image) {
    return null; // Do not render anything if there is no image
  }

  return (
    <div className="mt-3" align="center">
      {/* <img src={`data:image/png;base64,${image}`} alt="Generated Recipe" className="rounded" style={{ width: "100%", maxWidth: "512px" }} /> */}
      <img src={image} alt="Generated Recipe" className="rounded" style={{ width: "100%", maxWidth: "300px" }} />
      <p align="center">
        <small className="text-muted" align="right">
          AI Generated Image
        </small>
      </p>
    </div>
  );
};

export default ImageResult;

import React, { useState, useEffect } from "react";
import img1 from "../images/recipe-book.gif";
import img2 from "../images/seasoning.gif";
import img3 from "../images/frying-pan.gif";
import img4 from "../images/chopping-board.gif";
import img5 from "../images/qr-code.gif";

const images = [img5, img5, img5];

const Loading = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div align="center" className="p-3">
      <img src={images[currentImageIndex]} alt="Loading..." style={{ width: "100px", height: "100px" }} />
    </div>
  );
};

export default Loading;

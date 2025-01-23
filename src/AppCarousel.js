import React from "react";
import Slider from "react-slick";
import apps from "./data/apps";

const AppCarousel = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4, // Show 3 icons at a time
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false, // Disable arrows
    centerMode: true, // Center the icons on the screen
    responsive: [
      {
        breakpoint: 768, // Mobile view
        settings: {
          slidesToShow: 4, // Show 2 icons at a time on smaller screens
          centerMode: false, // Disable center mode for smaller screens
        },
      },
      {
        breakpoint: 480, // Very small devices
        settings: {
          slidesToShow: 4, // Show 1 icon at a time on very small screens
          centerMode: false,
        },
      },
    ],
  };

  return (
    <div className="slider-container px-2 justify-content-center align-items-center" style={{ margin: "5px 0" }}>
      <Slider {...settings}>
        {apps.map(
          (app, index) =>
            app.loginpage && (
              <div key={index} className="d-flex justify-content-center align-items-center">
                <span href="#" style={{ textDecoration: "none", textAlign: "center" }}>
                  <img
                    src={app.image}
                    alt={app.name}
                    style={{
                      width: "45px", // Icon size
                      height: "45px",
                      borderRadius: "7px",
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <small align="center" className="text-dark">
                    {app.shortname}
                  </small>
                </span>
              </div>
            )
        )}
      </Slider>
    </div>
  );
};

export default AppCarousel;

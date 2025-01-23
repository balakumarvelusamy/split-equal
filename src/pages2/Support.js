import React from "react";
import { Link } from "react-router-dom";

const Support = () => {
  return (
    <div className="container">
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h1>Support Page</h1>
        <small>We value your suggestions for improvements and feedback. If you encounter any issues, please report them to us, so we can address your needs and resolve the problems promptly.</small>
        <p>
          <Link
            className="btn btn-warning text-dark mt-4"
            to="/manage/contact"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "5px",
            }}
          >
            Raise Support request here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Support;

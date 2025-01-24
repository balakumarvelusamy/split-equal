// src/ErrorBoundary.js
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by Error Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container p-4" align="center">
          <h2>Something went wrong. </h2>
          <br />
          <a href="/app7/home" className="text-decoration-none text-dark p-1 px-3 rounded border bg-warning">
            Reload App
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

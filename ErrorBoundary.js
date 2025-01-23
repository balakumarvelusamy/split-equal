import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload(); // Reload the app
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center mt-5">
          <h2>Something went wrong.</h2>
          {this.state.error && <p className="text-danger">{this.state.error.toString()}</p>}
          {this.state.errorInfo && (
            <details className="text-muted">
              <summary>Details</summary>
              <pre>{this.state.errorInfo.componentStack}</pre>
            </details>
          )}
          <button className="btn btn-primary mt-3" onClick={this.handleRetry}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

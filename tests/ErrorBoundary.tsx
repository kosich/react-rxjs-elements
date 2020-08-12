import React, { Component } from 'react';

class ErrorBoundary extends Component<any, { hasError: boolean, error: any }> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: void 0 };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <>ERROR:{this.state.error?.toString()}</>;
    }

    return this.props.children;
  }
}

export { ErrorBoundary };

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="max-w-md p-8 text-center bg-white rounded-lg shadow">
            <h1 className="mb-2 text-xl font-bold text-gray-800">Something went wrong</h1>
            <p className="mb-6 text-sm text-gray-600">An unexpected error occurred. Please try reloading the page.</p>
            <button onClick={this.handleReload} className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700">
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

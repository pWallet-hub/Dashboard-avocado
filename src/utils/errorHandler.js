// Error handling utility for API responses
export const handleApiError = (error, showToast = true) => {
  let message = 'An unexpected error occurred';
  let details = {};

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        message = data.message || 'Invalid request data';
        details = data.errors || {};
        break;
      case 401:
        message = 'Please log in to continue';
        // Redirect to login handled by interceptor
        break;
      case 403:
        message = 'You don\'t have permission to perform this action';
        break;
      case 404:
        message = 'The requested resource was not found';
        break;
      case 409:
        message = data.message || 'This data already exists';
        break;
      case 422:
        message = data.message || 'Please check your input';
        details = data.errors || {};
        break;
      case 429:
        message = 'Too many requests. Please try again later';
        break;
      case 500:
        message = 'Server error. Please try again or contact support';
        break;
      default:
        message = data.message || 'An error occurred';
    }
  } else if (error.request) {
    // Network error
    message = 'Network error. Please check your connection';
  }

  if (showToast) {
    showErrorToast(message);
  }

  return { message, details, status: error.response?.status };
};

// Toast notification functions (implement based on your UI library)
export const showErrorToast = (message) => {
  console.error(message);
  // Implement with your preferred toast library
};

export const showSuccessToast = (message) => {
  console.log(message);
  // Implement with your preferred toast library
};
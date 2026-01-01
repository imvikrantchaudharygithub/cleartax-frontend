import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { API_CONFIG, getApiUrl } from './config';
import { ApiError, ApiResponse } from './types';

/**
 * Create axios instance with default configuration
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request Interceptor
 * Add auth token, modify requests, etc.
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available (for future use)
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle responses, errors, and transform data
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Transform response if needed
    // Backend might return { success: true, data: {...} }
    // or directly return data
    
    if (response.data && typeof response.data === 'object') {
      // If backend follows our standard format
      if ('success' in response.data && 'data' in response.data) {
        return response;
      }
      // If backend returns data directly, wrap it
      return {
        ...response,
        data: {
          success: true,
          data: response.data,
        },
      };
    }

    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const errorData = error.response.data;

      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            // Redirect to login if needed (commented for now as auth is not required initially)
            // window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error');
          break;
      }

      // Return standardized error format
      const apiError: ApiError = {
        success: false,
        message: errorData?.message || error.message || 'An error occurred',
        errors: errorData?.errors,
      };

      return Promise.reject(apiError);
    } else if (error.request) {
      // Request was made but no response received
      const apiError: ApiError = {
        success: false,
        message: 'Network error. Please check your internet connection.',
      };
      return Promise.reject(apiError);
    } else {
      // Something else happened
      const apiError: ApiError = {
        success: false,
        message: error.message || 'An unexpected error occurred',
      };
      return Promise.reject(apiError);
    }
  }
);

/**
 * Generic API request function
 */
export const apiRequest = async <T = any>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance.request<ApiResponse<T>>(config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * GET request helper
 */
export const apiGet = async <T = any>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    ...config,
    method: 'GET',
    url: endpoint,
  });
};

/**
 * POST request helper with automatic alerts
 */
export const apiPost = async <T = any>(
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiRequest<T>({
      ...config,
      method: 'POST',
      url: endpoint,
      data,
    });

    // Show success toast for POST requests
    if (typeof window !== 'undefined') {
      const successMessage = getSuccessMessage(endpoint);
      if (successMessage) {
        toast.success(successMessage);
      }
    }

    return response;
  } catch (error: any) {
    // Show error toast for POST requests
    if (typeof window !== 'undefined') {
      const errorMessage = error?.message || getErrorMessage(endpoint);
      toast.error(errorMessage);
    }
    throw error;
  }
};

/**
 * Get success message based on endpoint
 */
function getSuccessMessage(endpoint: string): string | null {
  if (endpoint.includes('/inquiries')) {
    return 'Thank you! Your request has been submitted successfully. We will contact you soon.';
  }
  if (endpoint.includes('/services')) {
    if (endpoint.includes('/categories')) {
      return 'Service category created successfully!';
    }
    return 'Service created successfully!';
  }
  if (endpoint.includes('/blog')) {
    return 'Blog post created successfully!';
  }
  if (endpoint.includes('/calculators')) {
    return 'Calculation completed successfully!';
  }
  if (endpoint.includes('/auth/register')) {
    return 'Registration successful! Please check your email to verify your account.';
  }
  if (endpoint.includes('/auth/login')) {
    return 'Login successful!';
  }
  if (endpoint.includes('/team')) {
    return 'Team member added successfully!';
  }
  if (endpoint.includes('/compliance')) {
    return 'Compliance data saved successfully!';
  }
  // Generic success message
  return 'Operation completed successfully!';
}

/**
 * Get error message based on endpoint
 */
function getErrorMessage(endpoint: string): string {
  if (endpoint.includes('/inquiries')) {
    return 'Failed to submit your request. Please try again.';
  }
  if (endpoint.includes('/services')) {
    if (endpoint.includes('/categories')) {
      return 'Failed to create service category. Please try again.';
    }
    return 'Failed to create service. Please try again.';
  }
  if (endpoint.includes('/blog')) {
    return 'Failed to create blog post. Please try again.';
  }
  if (endpoint.includes('/calculators')) {
    return 'Failed to perform calculation. Please check your inputs and try again.';
  }
  if (endpoint.includes('/auth/register')) {
    return 'Failed to register. Please try again.';
  }
  if (endpoint.includes('/auth/login')) {
    return 'Failed to login. Please check your credentials and try again.';
  }
  if (endpoint.includes('/team')) {
    return 'Failed to add team member. Please try again.';
  }
  if (endpoint.includes('/compliance')) {
    return 'Failed to save compliance data. Please try again.';
  }
  // Generic error message
  return 'An error occurred. Please try again.';
}

/**
 * PUT request helper
 */
export const apiPut = async <T = any>(
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    ...config,
    method: 'PUT',
    url: endpoint,
    data,
  });
};

/**
 * DELETE request helper
 */
export const apiDelete = async <T = any>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    ...config,
    method: 'DELETE',
    url: endpoint,
  });
};

/**
 * PATCH request helper
 */
export const apiPatch = async <T = any>(
  endpoint: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    ...config,
    method: 'PATCH',
    url: endpoint,
    data,
  });
};

export default axiosInstance;


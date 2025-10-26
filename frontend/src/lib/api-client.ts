import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
      timeout: 60000, // Increased to 60 seconds for AI operations
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling common errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      console.log('🔵 [API] GET Request:', {
        url: `${this.client.defaults.baseURL}${url}`,
        params,
      });
      
      const response = await this.client.get(url, { 
        params,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      
      console.log('🔵 [API] GET Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('🔴 [API] GET Error:', {
        url: `${this.client.defaults.baseURL}${url}`,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      console.log('🔵 [API] POST Request:', {
        url: `${this.client.defaults.baseURL}${url}`,
        data,
      });
      
      const response = await this.client.post(url, data);
      
      console.log('🔵 [API] POST Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        fullResponse: response
      });
      
      return response.data;
    } catch (error: any) {
      console.error('🔴 [API] POST Error:', {
        url: `${this.client.defaults.baseURL}${url}`,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error
      });
      throw error; // Re-throw so quiz.ts can catch it properly
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch(url, data);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse {
    console.error('API Error:', error);

    if (error.response) {
      // Server responded with error status
      return {
        status: 'error',
        message: error.response.data?.message || 'Server error occurred',
        errors: error.response.data?.errors || [],
      };
    } else if (error.request) {
      // Network error
      return {
        status: 'error',
        message: 'Network error. Please check your connection.',
        errors: ['NETWORK_ERROR'],
      };
    } else {
      // Other error
      return {
        status: 'error',
        message: 'An unexpected error occurred',
        errors: ['UNKNOWN_ERROR'],
      };
    }
  }

  // Utility method to set auth token
  setAuthToken(token: string) {
    localStorage.setItem('authToken', token);
  }

  // Utility method to clear auth token
  clearAuthToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
}

export const apiClient = new ApiClient();

import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types';

/**
 * Universal helper to safely retrieve an active, non-null auth token
 */
export const getValidAuthToken = (): string | null => {
  let token = localStorage.getItem('token') || localStorage.getItem('authToken');

  // Check zustand auth-storage fallback if direct keys are missing or invalid
  if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        token = parsed.state?.token;
      }
    } catch {}
  }

  if (!token || typeof token !== 'string' || token === 'null' || token === 'undefined' || token.trim() === '') {
    return null;
  }

  return token.trim();
};

class ApiClient {
  private client: AxiosInstance;
  private isRedirecting: boolean = false;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
      timeout: 60000, // 60 seconds for AI operations
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
        const token = getValidAuthToken();

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        } else if (config.headers && config.headers.Authorization) {
          delete config.headers.Authorization;
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
        const isAuthEndpoint = error.config?.url?.includes('/auth/');
        const isShareEndpoint = error.config?.url?.includes('/share/');

        if ((error.response?.status === 401 || error.response?.status === 403) && !isAuthEndpoint && !isShareEndpoint) {
          const currentPath = window.location.pathname;
          const isPublicPage = currentPath === '/' || currentPath === '/login' || currentPath === '/register' || currentPath === '/forgot-password';

          // Prevent blinking infinite loops when on public pages or already redirecting
          if (!isPublicPage && !this.isRedirecting) {
            this.isRedirecting = true;
            try {
              // Completely purge all auth storage to prevent PublicRoute from immediately bouncing back to dashboard
              localStorage.removeItem('token');
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              localStorage.removeItem('auth-storage');
            } catch {}

            setTimeout(() => {
              window.location.href = '/login';
            }, 100);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: { params?: any; headers?: any }): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, { 
        params: config?.params,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
          ...config?.headers,
        }
      });
      
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: { headers?: any }): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
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
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error);
    }

    if (error.response) {
      return {
        status: 'error',
        message: error.response.data?.message || 'Server error occurred',
        data: error.response.data?.data,
        errors: error.response.data?.errors || [],
      };
    } else if (error.request) {
      return {
        status: 'error',
        message: 'Network error. Please check your connection.',
        errors: ['NETWORK_ERROR'],
      };
    } else {
      return {
        status: 'error',
        message: 'An unexpected error occurred',
        errors: ['UNKNOWN_ERROR'],
      };
    }
  }

  setAuthToken(token: string) {
    if (token && token !== 'null' && token !== 'undefined') {
      localStorage.setItem('authToken', token);
      localStorage.setItem('token', token);
    }
  }

  clearAuthToken() {
    this.isRedirecting = false;
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth-storage');
  }
}

export const apiClient = new ApiClient();

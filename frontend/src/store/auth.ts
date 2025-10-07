import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState, LoginForm, RegisterForm } from '@/types';
import { apiClient } from '@/lib/api-client';

interface AuthResponse {
  user: User;
  token: string;
}

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginForm) => Promise<boolean>;
  register: (userData: RegisterForm) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<{ success: boolean; previewUrl?: string }>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  checkAuth: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginForm) => {
        console.log('=== AUTH STORE LOGIN STARTED ===');
        set({ isLoading: true, error: null });
        
        try {
          console.log('Making API call to /auth/login with:', { email: credentials.email });
          const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
          console.log('Auth store - API response:', response);
          
          if (response.status === 'success' && response.data) {
            const { user, token } = response.data;
            console.log('Auth store - Login successful, setting state:', { user, token: token.substring(0, 20) + '...' });
            
            // CRITICAL: Store token in both API client AND localStorage for consistency
            apiClient.setAuthToken(token);
            localStorage.setItem('token', token); // For backward compatibility
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            console.log('Auth store - State updated successfully');
            console.log('Auth store - Final state:', { 
              isAuthenticated: get().isAuthenticated, 
              user: get().user?.email,
              hasToken: !!get().token 
            });
            return true;
          } else {
            console.log('Auth store - Login failed with response:', response);
            const errorMessage = response.message || 'Login failed';
            set({ isLoading: false, error: errorMessage });
            return false;
          }
        } catch (error: any) {
          console.error('Auth store - Login error:', error);
          console.error('Auth store - Error response:', error.response?.data);
          
          let errorMessage = 'Login failed. Please try again.';
          
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.data?.errors?.length > 0) {
            errorMessage = error.response.data.errors[0].message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      register: async (userData: RegisterForm) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.post<{ user: User }>('/auth/register', userData);
          
          if (response.status === 'success' && response.data) {
            // Don't auto-login after registration, just show success
            set({
              isLoading: false,
              error: null,
            });
            
            return true;
          } else {
            const errorMessage = response.message || 'Registration failed';
            set({ isLoading: false, error: errorMessage });
            return false;
          }
        } catch (error: any) {
          console.error('Registration error:', error);
          
          let errorMessage = 'Registration failed. Please try again.';
          
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.data?.errors?.length > 0) {
            // Handle validation errors
            const validationErrors = error.response.data.errors
              .map((err: any) => err.message)
              .join(', ');
            errorMessage = validationErrors;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      logout: () => {
        // Clear token from API client and localStorage
        apiClient.clearAuthToken();
        localStorage.removeItem('token'); // For backward compatibility
        
        // CRITICAL FIX: Clear chat storage to prevent sessions from persisting across users
        localStorage.removeItem('chat-storage');
        console.log('✅ Cleared chat-storage on logout to prevent data leakage');
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      checkAuth: async () => {
        console.log('=== CHECK AUTH STARTED ===');
        const { token, isAuthenticated } = get();
        
        console.log('CheckAuth - Current state:', { hasToken: !!token, isAuthenticated });
        
        if (!token) {
          console.log('CheckAuth - No token found, returning false');
          return false;
        }

        console.log('CheckAuth - Token found, verifying with backend...');
        set({ isLoading: true });
        
        try {
          const response = await apiClient.get<User>('/auth/me');
          console.log('CheckAuth - Backend response:', response);
          
          if (response.status === 'success' && response.data) {
            console.log('CheckAuth - Token valid, updating state');
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            // Token is invalid, clear auth state
            console.log('CheckAuth - Token invalid, clearing auth state');
            get().logout();
            return false;
          }
        } catch (error) {
          console.error('CheckAuth - Error occurred:', error);
          console.log('CheckAuth - Clearing auth state due to error');
          get().logout();
          return false;
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.post('/auth/forgot-password', { email });
          
          if (response.status === 'success') {
            set({ isLoading: false, error: null });
            return { 
              success: true, 
              previewUrl: response.data && typeof response.data === 'object' && 'previewUrl' in response.data 
                ? (response.data as any).previewUrl 
                : undefined 
            };
          } else {
            const errorMessage = response.message || 'Failed to send password reset email';
            set({ isLoading: false, error: errorMessage });
            return { success: false };
          }
        } catch (error: any) {
          console.error('Forgot password error:', error);
          
          let errorMessage = 'Failed to send password reset email. Please try again.';
          
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({ isLoading: false, error: errorMessage });
          return { success: false };
        }
      },

      resetPassword: async (token: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.post('/auth/reset-password', { token, password });
          
          if (response.status === 'success') {
            set({ isLoading: false, error: null });
            return true;
          } else {
            const errorMessage = response.message || 'Failed to reset password';
            set({ isLoading: false, error: errorMessage });
            return false;
          }
        } catch (error: any) {
          console.error('Reset password error:', error);
          
          let errorMessage = 'Failed to reset password. Please try again.';
          
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.data?.errors?.length > 0) {
            const validationErrors = error.response.data.errors
              .map((err: any) => err.message)
              .join(', ');
            errorMessage = validationErrors;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Sync token from persisted state to localStorage and API client after hydration
        if (state?.token) {
          console.log('🔄 Rehydrating auth state - syncing token to localStorage and API client');
          localStorage.setItem('token', state.token);
          apiClient.setAuthToken(state.token);
        }
      },
    }
  )
);

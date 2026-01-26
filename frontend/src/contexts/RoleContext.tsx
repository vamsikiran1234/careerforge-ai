import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export type UserRole = 'STUDENT' | 'MENTOR' | 'ADMIN';

interface RoleContextType {
  currentRole: UserRole;
  availableRoles: UserRole[];
  switchRole: (role: UserRole) => void;
  isMentor: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  loading: boolean;
  refreshRoles: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('STUDENT');
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>(['STUDENT']);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Get auth token helper
  const getToken = (): string | null => {
    let token = localStorage.getItem('token');
    if (!token) {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        token = parsed.state?.token;
      }
    }
    return token;
  };

  // Detect available roles on mount
  const detectRoles = async () => {
    setLoading(true);
    const roles: UserRole[] = ['STUDENT']; // Everyone is a student by default

    try {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      // Check if user is a mentor
      try {
        console.log('🔍 RoleContext: Checking mentor profile...');
        const mentorResponse = await axios.get(`${API_URL}/mentorship/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('✅ RoleContext: Mentor response:', mentorResponse.data);
        
        if (mentorResponse.data.success && mentorResponse.data.data) {
          const profile = mentorResponse.data.data;
          console.log('📊 RoleContext: Mentor profile status:', profile.status);
          // Add mentor role if profile exists and is active or pending
          if (profile.status === 'ACTIVE' || profile.status === 'PENDING') {
            roles.push('MENTOR');
            console.log('✨ RoleContext: MENTOR role added!');
          } else {
            console.log('⚠️ RoleContext: Mentor status is', profile.status, '- not adding MENTOR role');
          }
        }
      } catch (error) {
        // 404 means no mentor profile, which is fine
        console.log('❌ RoleContext: Not a mentor or error:', error);
      }

      // Check if user is an admin
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          const user = parsed.state?.user;
          if (user?.roles && Array.isArray(user.roles) && user.roles.includes('ADMIN')) {
            roles.push('ADMIN');
          }
        }
      } catch (error) {
        console.debug('Error checking admin role:', error);
      }

      setAvailableRoles(roles);
      console.log('🎯 RoleContext: Final available roles:', roles);

      // Load saved role preference or default to first available
      const savedRole = localStorage.getItem('currentRole') as UserRole;
      console.log('💾 RoleContext: Saved role from localStorage:', savedRole);
      
      if (savedRole && roles.includes(savedRole)) {
        setCurrentRole(savedRole);
        console.log('✅ RoleContext: Using saved role:', savedRole);
      } else {
        setCurrentRole(roles[0]);
        localStorage.setItem('currentRole', roles[0]);
        console.log('🆕 RoleContext: Using first available role:', roles[0]);
      }
    } catch (error) {
      console.error('Error detecting roles:', error);
      setAvailableRoles(['STUDENT']);
      setCurrentRole('STUDENT');
    } finally {
      setLoading(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    detectRoles();
  }, []);

  // Auto-switch role based on current URL
  useEffect(() => {
    if (loading) return;

    const path = location.pathname;

    // If on mentor routes, ensure we're in mentor mode
    if (path.startsWith('/mentor') && currentRole !== 'MENTOR' && availableRoles.includes('MENTOR')) {
      setCurrentRole('MENTOR');
      localStorage.setItem('currentRole', 'MENTOR');
    }
    // If on admin routes, ensure we're in admin mode
    else if (path.includes('/admin') && currentRole !== 'ADMIN' && availableRoles.includes('ADMIN')) {
      setCurrentRole('ADMIN');
      localStorage.setItem('currentRole', 'ADMIN');
    }
    // Otherwise default to student for main app routes
    else if (!path.startsWith('/mentor') && !path.includes('/admin') && currentRole !== 'STUDENT') {
      setCurrentRole('STUDENT');
      localStorage.setItem('currentRole', 'STUDENT');
    }
  }, [location.pathname, loading, currentRole, availableRoles]);

  // Switch role function
  const switchRole = (role: UserRole) => {
    if (!availableRoles.includes(role)) {
      console.warn(`Role ${role} is not available for this user`);
      return;
    }

    setCurrentRole(role);
    localStorage.setItem('currentRole', role);

    // Navigate to appropriate dashboard based on role
    switch (role) {
      case 'STUDENT':
        navigate('/app/dashboard');
        break;
      case 'MENTOR':
        navigate('/mentor/dashboard');
        break;
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
    }
  };

  // Refresh roles (useful after mentor registration)
  const refreshRoles = async () => {
    await detectRoles();
  };

  // Computed properties for easy role checking
  const isMentor = availableRoles.includes('MENTOR');
  const isAdmin = availableRoles.includes('ADMIN');
  const isStudent = availableRoles.includes('STUDENT');

  const value: RoleContextType = {
    currentRole,
    availableRoles,
    switchRole,
    isMentor,
    isAdmin,
    isStudent,
    loading,
    refreshRoles,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

// Custom hook to use role context
export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

// HOC for role-based rendering
interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles, 
  children, 
  fallback = null 
}) => {
  const { currentRole } = useRole();
  
  if (!allowedRoles.includes(currentRole)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

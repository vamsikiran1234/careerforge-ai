import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme from localStorage or fallback to system
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('careerforge-theme') as Theme;
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        return savedTheme;
      }
    }
    return 'light';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Track system preference changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && systemIsDark);
  const resolvedTheme: 'light' | 'dark' = isDark ? 'dark' : 'light';

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      
      // Professional dark theme CSS variables
      root.style.setProperty('--bg-primary', '#0f172a');
      root.style.setProperty('--bg-secondary', '#1e293b');
      root.style.setProperty('--bg-tertiary', '#334155');
      root.style.setProperty('--bg-sidebar', '#0f172a');
      root.style.setProperty('--bg-card', '#1e293b');
      root.style.setProperty('--text-primary', '#f8fafc');
      root.style.setProperty('--text-secondary', '#cbd5e1');
      root.style.setProperty('--text-muted', '#94a3b8');
      root.style.setProperty('--border-color', '#334155');
      root.style.setProperty('--accent-primary', '#6366f1');
      root.style.setProperty('--accent-hover', '#4f46e5');
      root.style.setProperty('--input-bg', '#1e293b');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      
      // Professional light theme CSS variables
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8f9fa');
      root.style.setProperty('--bg-tertiary', '#f3f4f6');
      root.style.setProperty('--bg-sidebar', '#ffffff');
      root.style.setProperty('--bg-card', '#ffffff');
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--border-color', '#e2e8f0');
      root.style.setProperty('--accent-primary', '#4f46e5');
      root.style.setProperty('--accent-hover', '#4338ca');
      root.style.setProperty('--input-bg', '#ffffff');
    }

    // Save choice to localStorage
    try {
      localStorage.setItem('careerforge-theme', theme);
    } catch (e) {
      console.warn('Could not save theme to localStorage:', e);
    }
  }, [theme, isDark]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('careerforge-theme', nextTheme);
      } catch (e) {
        console.warn('Could not save theme to localStorage:', e);
      }
      return nextTheme;
    });
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('careerforge-theme', newTheme);
    } catch (e) {
      console.warn('Could not save theme to localStorage:', e);
    }
  }, []);

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    toggleTheme,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
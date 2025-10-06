import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = false 
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-lg transition-all duration-300 
        ${isDark 
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 border border-gray-700' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
        }
        hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        ${className}
      `}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        {/* Light mode icon */}
        <Sun 
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300 
            ${!isDark 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-180 scale-75'
            }
          `}
        />
        
        {/* Dark mode icon */}
        <Moon 
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300 
            ${isDark 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-180 scale-75'
            }
          `}
        />
      </div>
      
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
      
      {/* Subtle animation indicator */}
      <div 
        className={`
          absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full transition-all duration-300
          ${isDark ? 'bg-yellow-400' : 'bg-orange-400'}
          ${theme === 'dark' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
        `}
      />
    </button>
  );
};

export default ThemeToggle;
export { ThemeToggle };
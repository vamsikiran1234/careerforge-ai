import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = false 
}) => {
  const { toggleTheme, isDark, resolvedTheme } = useTheme();

  return (
    <button
      type="button"
      data-theme-toggle
      onClick={toggleTheme}
      className={cn(
        'h-9 inline-flex items-center justify-center px-2.5 rounded-lg border transition-all shadow-xs',
        'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750',
        'border-gray-200 dark:border-gray-700/80',
        'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
        className
      )}
      title={`Appearance: ${resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'} (Click to switch)`}
      aria-label={`Appearance: ${resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'} (Click to switch)`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Light mode sun */}
        <Sun 
          className={cn(
            'absolute inset-0 w-4 h-4 text-amber-500 transition-all duration-300',
            isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
          )}
        />
        {/* Dark mode moon */}
        <Moon 
          className={cn(
            'absolute inset-0 w-4 h-4 text-blue-400 transition-all duration-300',
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
          )}
        />
      </div>
      
      {showLabel && (
        <span className="ml-2 text-xs font-semibold capitalize text-gray-700 dark:text-gray-300">
          {resolvedTheme}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;

import React from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'filled';
  showPasswordToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    type = 'text', 
    leftIcon,
    rightIcon,
    variant = 'default',
    showPasswordToggle = false,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const id = props.id || props.name;
    
    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password') 
      : type;

    const getVariantClasses = () => {
      switch (variant) {
        case 'outline':
          return 'bg-transparent border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500';
        case 'filled':
          return 'bg-gray-50 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500';
        default:
          return 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500';
      }
    };

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400 dark:text-gray-500">
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              'block w-full px-3 py-2 text-sm rounded-lg border shadow-xs transition-colors',
              'focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:outline-none',
              'disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-900/40 disabled:text-gray-500 dark:disabled:text-gray-500',
              getVariantClasses(),
              leftIcon && 'pl-10',
              (rightIcon || showPasswordToggle) && 'pr-10',
              error && 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            ref={ref}
            {...props}
          />
          
          {(rightIcon || showPasswordToggle) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {showPasswordToggle && type === 'password' ? (
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              ) : rightIcon ? (
                <div className="text-gray-400 dark:text-gray-500">
                  {rightIcon}
                </div>
              ) : null}
            </div>
          )}
        </div>
        
        {error && (
          <div className="flex items-center text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </div>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

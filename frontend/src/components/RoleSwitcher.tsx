import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Users2, Shield, ChevronDown, Check } from 'lucide-react';
import { useRole } from '../contexts/RoleContext';
import type { UserRole } from '../contexts/RoleContext';

interface RoleConfig {
  value: UserRole;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description: string;
}

const roleConfigs: Record<UserRole, RoleConfig> = {
  STUDENT: {
    value: 'STUDENT',
    label: 'Student Mode',
    icon: GraduationCap,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    description: 'Access learning resources and find mentors',
  },
  MENTOR: {
    value: 'MENTOR',
    label: 'Mentor Portal',
    icon: Users2,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    description: 'Manage mentees and sessions',
  },
  ADMIN: {
    value: 'ADMIN',
    label: 'Admin Tools',
    icon: Shield,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    description: 'Platform management and analytics',
  },
};

export const RoleSwitcher: React.FC = () => {
  const { currentRole, availableRoles, switchRole, loading } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Don't show if user only has one role
  if (availableRoles.length <= 1 || loading) {
    return null;
  }

  const currentConfig = roleConfigs[currentRole];
  const CurrentIcon = currentConfig.icon;

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current Role Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          transition-all duration-200
          ${currentConfig.bgColor}
          hover:opacity-80
          focus:outline-none focus:ring-2 focus:ring-primary-500
        `}
        aria-label="Switch role"
        aria-expanded={isOpen}
      >
        <CurrentIcon className={`h-5 w-5 ${currentConfig.color}`} />
        <span className={`hidden md:block font-medium text-sm ${currentConfig.color}`}>
          {currentConfig.label}
        </span>
        <ChevronDown
          className={`h-4 w-4 ${currentConfig.color} transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="
            absolute right-0 mt-2 w-72
            bg-white dark:bg-gray-800
            rounded-lg shadow-lg
            border border-gray-200 dark:border-gray-700
            overflow-hidden
            z-50
            animate-in slide-in-from-top-2 fade-in duration-200
          "
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Switch to
            </p>
          </div>

          {/* Role Options */}
          <div className="py-2">
            {availableRoles.map((role) => {
              const config = roleConfigs[role];
              const Icon = config.icon;
              const isCurrentRole = role === currentRole;

              return (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  disabled={isCurrentRole}
                  className={`
                    w-full px-4 py-3
                    flex items-start gap-3
                    transition-colors duration-150
                    ${
                      isCurrentRole
                        ? `${config.bgColor} cursor-default`
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                    }
                  `}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${config.color}`}>
                        {config.label}
                      </span>
                      {isCurrentRole && (
                        <Check className={`h-4 w-4 ${config.color}`} />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {config.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Hint */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your role will be remembered for your next visit
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Users2, Shield, ChevronDown, Check } from 'lucide-react';
import { useRole, type UserRole } from '../contexts/RoleContext';
import { cn } from '@/utils';

interface RoleOption {
  value: UserRole;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  path: string;
  description: string;
}

const ALL_ROLES: RoleOption[] = [
  {
    value: 'STUDENT',
    label: 'Student Mode',
    shortLabel: 'Student',
    icon: GraduationCap,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-200 dark:border-blue-800/60',
    path: '/app/dashboard',
    description: 'Career roadmaps, adaptive quizzes & AI guidance',
  },
  {
    value: 'MENTOR',
    label: 'Mentor Portal',
    shortLabel: 'Mentor',
    icon: Users2,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800/60',
    path: '/mentor/dashboard',
    description: 'Manage sessions, mentees & availability',
  },
  {
    value: 'ADMIN',
    label: 'Admin Tools',
    shortLabel: 'Admin',
    icon: Shield,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/40',
    borderColor: 'border-red-200 dark:border-red-800/60',
    path: '/admin/dashboard',
    description: 'Platform management, cache & system metrics',
  },
];

export const RoleSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentRole, switchRole } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active mode from current path or context
  const activeRole: UserRole = location.pathname.startsWith('/mentor')
    ? 'MENTOR'
    : location.pathname.startsWith('/admin')
    ? 'ADMIN'
    : currentRole || 'STUDENT';

  const currentConfig = ALL_ROLES.find(r => r.value === activeRole) || ALL_ROLES[0];
  const CurrentIcon = currentConfig.icon;

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectRole = (role: RoleOption) => {
    setIsOpen(false);
    try {
      switchRole(role.value);
    } catch {
      // Direct navigation fallback
    }
    navigate(role.path);
  };

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      {/* Current Active Mode Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'h-9 inline-flex items-center gap-2 px-3 rounded-lg border text-xs sm:text-sm font-semibold transition-all shadow-xs',
          'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750',
          currentConfig.borderColor,
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20'
        )}
        aria-label="Switch Mode (Student, Mentor, Admin)"
        aria-expanded={isOpen}
      >
        <span className={cn('p-1 rounded-md', currentConfig.bgColor, currentConfig.color)}>
          <CurrentIcon className="h-4 w-4" />
        </span>
        <span className={cn('font-semibold text-gray-900 dark:text-white', currentConfig.color)}>
          {currentConfig.label}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-gray-500 dark:text-gray-400 transition-transform duration-200',
            isOpen ? 'rotate-180' : ''
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="
            absolute right-0 mt-2 w-72 sm:w-80
            bg-white dark:bg-gray-800
            rounded-xl shadow-xl
            border border-gray-200 dark:border-gray-700
            overflow-hidden
            z-50
            animate-in fade-in-50 zoom-in-95 duration-150
          "
        >
          {/* Header */}
          <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Platform Modes
            </span>
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded">
              Switch Anytime
            </span>
          </div>

          {/* Mode Items */}
          <div className="p-1.5 space-y-1">
            {ALL_ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = role.value === activeRole;

              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => handleSelectRole(role)}
                  className={cn(
                    'w-full p-2.5 rounded-lg flex items-start gap-3 transition-colors text-left',
                    isSelected
                      ? `${role.bgColor} border border-transparent`
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300'
                  )}
                >
                  <div className={cn('p-2 rounded-lg mt-0.5', role.bgColor, role.color)}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn('text-xs font-bold', role.color)}>
                        {role.label}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                          <Check className="h-3 w-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                      {role.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="px-4 py-2 bg-gray-50/70 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700/60 text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>CareerForge AI Mode Manager</span>
            <span className="font-semibold text-gray-600 dark:text-gray-300">3 Modes</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSwitcher;

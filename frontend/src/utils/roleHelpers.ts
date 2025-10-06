/**
 * Role Helper Utilities
 * 
 * Utility functions for checking user roles in the frontend
 */

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[]; // Array of roles: ["STUDENT"], ["ADMIN"], ["STUDENT", "ADMIN"], etc.
  avatar?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Check if user has a specific role
 * @param user - User object (can be null)
 * @param role - Role to check for (e.g., "ADMIN", "STUDENT", "MENTOR")
 * @returns true if user has the role, false otherwise
 */
export const hasRole = (user: User | null | undefined, role: string): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
};

/**
 * Check if user has ANY of the specified roles
 * @param user - User object (can be null)
 * @param roles - Array of roles to check (e.g., ["ADMIN", "MENTOR"])
 * @returns true if user has at least one of the roles, false otherwise
 */
export const hasAnyRole = (user: User | null | undefined, roles: string[]): boolean => {
  if (!user || !user.roles) return false;
  return roles.some((role) => user.roles.includes(role));
};

/**
 * Check if user has ALL of the specified roles
 * @param user - User object (can be null)
 * @param roles - Array of roles to check (e.g., ["ADMIN", "STUDENT"])
 * @returns true if user has all the roles, false otherwise
 */
export const hasAllRoles = (user: User | null | undefined, roles: string[]): boolean => {
  if (!user || !user.roles) return false;
  return roles.every((role) => user.roles.includes(role));
};

/**
 * Check if user is an admin
 * @param user - User object (can be null)
 * @returns true if user has ADMIN role, false otherwise
 */
export const isAdmin = (user: User | null | undefined): boolean => {
  return hasRole(user, 'ADMIN');
};

/**
 * Check if user is a student
 * @param user - User object (can be null)
 * @returns true if user has STUDENT role, false otherwise
 */
export const isStudent = (user: User | null | undefined): boolean => {
  return hasRole(user, 'STUDENT');
};

/**
 * Check if user is a mentor
 * @param user - User object (can be null)
 * @returns true if user has MENTOR role, false otherwise
 */
export const isMentor = (user: User | null | undefined): boolean => {
  return hasRole(user, 'MENTOR');
};

/**
 * Get all roles for a user
 * @param user - User object (can be null)
 * @returns Array of role strings, or empty array if user is null
 */
export const getUserRoles = (user: User | null | undefined): string[] => {
  return user?.roles || [];
};

/**
 * Format roles for display
 * @param user - User object (can be null)
 * @returns Formatted string of roles (e.g., "Admin, Student")
 */
export const formatRoles = (user: User | null | undefined): string => {
  if (!user || !user.roles || user.roles.length === 0) return 'No roles';
  
  return user.roles
    .map((role) => {
      // Capitalize first letter, lowercase rest
      return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    })
    .join(', ');
};

/**
 * Check if user has multiple roles
 * @param user - User object (can be null)
 * @returns true if user has more than one role, false otherwise
 */
export const hasMultipleRoles = (user: User | null | undefined): boolean => {
  return (user?.roles?.length || 0) > 1;
};

/**
 * Get role badge color for UI display
 * @param role - Role string (e.g., "ADMIN", "STUDENT", "MENTOR")
 * @returns Tailwind CSS color class
 */
export const getRoleBadgeColor = (role: string): string => {
  switch (role.toUpperCase()) {
    case 'ADMIN':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'MENTOR':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'STUDENT':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

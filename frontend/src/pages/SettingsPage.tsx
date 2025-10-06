import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotificationStore } from '@/store/notifications';
import { getUserRoles, getRoleBadgeColor } from '@/utils/roleHelpers';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import {
  User,
  Lock,
  Bell,
  Palette,
  Save,
  Camera,
  Moon,
  Sun,
  Check,
  Mail,
  Shield
} from 'lucide-react';
import { cn } from '@/utils';

type SettingsTab = 'profile' | 'account' | 'notifications' | 'appearance';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, startPolling, stopPolling } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Start polling for notifications when component mounts - ONLY if user is authenticated
  useEffect(() => {
    if (user) {
      console.log('✅ Settings: Starting notification polling (user authenticated)');
      startPolling();
      return () => {
        console.log('🛑 Settings: Stopping notification polling');
        stopPolling();
      };
    } else {
      console.log('⚠️ Settings: User not authenticated, skipping notification polling');
    }
  }, [startPolling, stopPolling, user]);

  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    quizReminders: true,
    mentorMessages: true,
    weeklyDigest: false,
    marketingEmails: false,
  });

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'account' as const, label: 'Security', icon: Lock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      // Show success message
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1 bg-white dark:bg-gray-800 rounded-xl p-2 border border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-200',
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      Profile Information
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Update your profile information and avatar
                    </p>
                  </div>

                  {/* User Profile Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="absolute bottom-0 right-0 h-6 w-6 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {user?.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user?.email}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Shield className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <div className="flex gap-2">
                            {getUserRoles(user).map((role) => (
                              <span
                                key={role}
                                className={cn(
                                  'px-3 py-1 text-xs font-semibold rounded-full',
                                  getRoleBadgeColor(role)
                                )}
                              >
                                {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg border-2 border-white dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        <Camera className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                    <div>
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        Change avatar
                      </button>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        JPG, GIF or PNG. Max size of 800KB
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      Security Settings
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage your password and account security
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        placeholder="Enter your current password"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="Enter a new password"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Must be at least 8 characters with a mix of letters, numbers & symbols
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your new password"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        Notification Preferences
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Choose what notifications you want to receive
                      </p>
                    </div>
                    <button
                      onClick={() => setShowNotifications(true)}
                      className="relative flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      <Bell className="h-5 w-5" />
                      <span>View Notifications</span>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {Object.entries({
                      emailNotifications: 'Email Notifications',
                      quizReminders: 'Quiz Reminders',
                      mentorMessages: 'Mentor Messages',
                      weeklyDigest: 'Weekly Digest',
                      marketingEmails: 'Marketing Emails',
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Receive notifications about {label.toLowerCase()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange(key as keyof typeof notifications)}
                          className={cn(
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                            notifications[key as keyof typeof notifications]
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                              : 'bg-gray-200 dark:bg-gray-700'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                              notifications[key as keyof typeof notifications]
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      Appearance Settings
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Customize how CareerForge looks for you
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Theme
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'light', label: 'Light Mode', icon: Sun },
                        { value: 'dark', label: 'Dark Mode', icon: Moon },
                      ].map((themeOption) => (
                        <button
                          key={themeOption.value}
                          onClick={() => {
                            if (theme !== themeOption.value) {
                              toggleTheme();
                            }
                          }}
                          className={cn(
                            'relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all',
                            theme === themeOption.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          )}
                        >
                          {theme === themeOption.value && (
                            <div className="absolute top-2 right-2">
                              <Check className="h-5 w-5 text-blue-500" />
                            </div>
                          )}
                          <themeOption.icon className="h-8 w-8 text-gray-700 dark:text-gray-300 mb-2" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {themeOption.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Center Modal */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};

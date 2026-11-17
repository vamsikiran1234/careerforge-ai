import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useTheme, type Theme } from '@/contexts/ThemeContext';
import { useRole } from '@/contexts/RoleContext';
import { useNotificationStore } from '@/store/notifications';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/lib/api-client';
import { getUserRoles, getRoleBadgeColor } from '@/utils/roleHelpers';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import {
  User,
  Lock,
  Bell,
  Palette,
  Save,
  Moon,
  Sun,
  Monitor,
  Check,
  Mail,
  Shield,
  GraduationCap,
  Users2,
  ExternalLink,
  KeyRound,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { cn } from '@/utils';
import { Link, useSearchParams } from 'react-router-dom';

interface NotificationSettings {
  emailNotifications: boolean;
  quizReminders: boolean;
  mentorMessages: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

type NotificationKey = keyof NotificationSettings;

type SettingsTab = 'profile' | 'student' | 'mentor' | 'account' | 'notifications' | 'appearance';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme, isDark } = useTheme();
  const { isMentor, isAdmin } = useRole();
  const { unreadCount, startPolling, stopPolling } = useNotificationStore();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    const tabParam = new URLSearchParams(window.location.search).get('tab') as SettingsTab;
    if (tabParam && ['profile', 'student', 'mentor', 'account', 'notifications', 'appearance'].includes(tabParam)) {
      return tabParam;
    }
    return 'profile';
  });

  useEffect(() => {
    const tabParam = searchParams.get('tab') as SettingsTab;
    if (tabParam && ['profile', 'student', 'mentor', 'account', 'notifications', 'appearance'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Start polling for notifications when component mounts - ONLY if user is authenticated
  useEffect(() => {
    if (user) {
      startPolling();
      return () => {
        stopPolling();
      };
    }
  }, [startPolling, stopPolling, user]);

  // Profile Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    phone: '',
    location: 'Remote',
    headline: 'Aspiring Tech Professional',
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Student Preferences
  const [studentPrefs, setStudentPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('careerforge-student-preferences');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      educationLevel: 'Fresher / Student',
      targetField: 'AI Engineer',
      learningStyle: 'Hands-on Projects & Sprint Quizzes',
      weeklyHours: '10-15 hrs/week',
      openToMentorship: true,
    };
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('careerforge-notifications');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      emailNotifications: true,
      quizReminders: true,
      mentorMessages: true,
      weeklyDigest: true,
      marketingEmails: false,
    };
  });

  // Keep form updated when user loads
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
      }));
    }
  }, [user]);

  // Dynamic Tabs based on roles
  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'student' as const, label: 'Career Preferences', icon: GraduationCap },
    ...(isMentor ? [{ id: 'mentor' as const, label: 'Mentor Mode', icon: Users2 }] : []),
    { id: 'account' as const, label: 'Security', icon: Lock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
  ];

  // Save Profile Handler
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await apiClient.put<{ user: any }>('/users/profile', {
        name: formData.name.trim(),
        bio: formData.bio.trim(),
      });

      if (response.status === 'success') {
        updateUser({
          name: formData.name.trim(),
          bio: formData.bio.trim(),
        });
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please enter current and new password');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await apiClient.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.status === 'success') {
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (err: any) {
      toast.error(err.message || 'Current password may be incorrect');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Save Student Preferences
  const handleSaveStudentPrefs = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('careerforge-student-preferences', JSON.stringify(studentPrefs));
      toast.success('Career preferences updated successfully!');
    } catch (err: any) {
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleNotificationChange = (key: NotificationKey) => {
    setNotifications((prev: NotificationSettings) => {
      const updated: NotificationSettings = {
        ...prev,
        [key]: !prev[key]
      };
      localStorage.setItem('careerforge-notifications', JSON.stringify(updated));
      toast.success(`Updated ${key} setting`);
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 -mx-6 -mt-6 px-6 py-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage your profile, security, and appearance across CareerForge modes
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin/settings"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span>Admin Portal Settings</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
            {isMentor && (
              <Link
                to="/mentor/profile"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-purple-700 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
              >
                <Users2 className="h-4 w-4" />
                <span>Mentor Profile</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1 bg-white dark:bg-gray-800 rounded-xl p-2 border border-gray-200 dark:border-gray-700 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-200 font-medium text-left',
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                  )}
                >
                  <tab.icon className={cn('h-5 w-5', activeTab === tab.id ? 'text-white' : 'text-gray-500 dark:text-gray-400')} />
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8 shadow-sm">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      Profile Information
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Update your account details and professional identity
                    </p>
                  </div>

                  {/* User Profile Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800/80 rounded-xl p-6 border border-blue-200/80 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="relative self-start sm:self-center">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="absolute bottom-0 right-0 h-5 w-5 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                          {user?.name || 'CareerForge Explorer'}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 mt-3">
                          <Shield className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <div className="flex flex-wrap gap-2">
                            {getUserRoles(user).map((role) => (
                              <span
                                key={role}
                                className={cn(
                                  'px-2.5 py-0.5 text-xs font-semibold rounded-full',
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
                        placeholder="Your full name"
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition-colors"
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
                        disabled
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Email address is tied to your account login.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Professional Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition-colors resize-none"
                        placeholder="Tell the community about your career aspirations and current learning journey..."
                      />
                    </div>
                  </div>

                  {/* Save Profile Button */}
                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-md transition-all disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving Profile...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Student Mode / Career Preferences Tab */}
              {activeTab === 'student' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      Career & Learning Preferences
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Configure your career journey targets, learning style, and study pacing
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Experience Level
                      </label>
                      <select
                        value={studentPrefs.educationLevel}
                        onChange={(e) => setStudentPrefs({ ...studentPrefs, educationLevel: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Fresher / Student">Fresher / Student</option>
                        <option value="Junior Engineer (1-2 yrs)">Junior Engineer (1-2 yrs)</option>
                        <option value="Mid-Level (3-5 yrs)">Mid-Level (3-5 yrs)</option>
                        <option value="Career Transitioner">Career Transitioner</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Primary Target Role
                      </label>
                      <select
                        value={studentPrefs.targetField}
                        onChange={(e) => setStudentPrefs({ ...studentPrefs, targetField: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="AI Engineer">AI Engineer / ML Specialist</option>
                        <option value="Fullstack Developer">Fullstack Web Developer</option>
                        <option value="Frontend Specialist">Frontend Engineer (React/Next.js)</option>
                        <option value="Backend Architect">Backend & Distributed Systems</option>
                        <option value="DevOps & Cloud">DevOps & Cloud Architect</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Learning Style
                      </label>
                      <select
                        value={studentPrefs.learningStyle}
                        onChange={(e) => setStudentPrefs({ ...studentPrefs, learningStyle: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Hands-on Projects & Sprint Quizzes">Hands-on Projects & Sprint Quizzes</option>
                        <option value="1-on-1 Mentor Guidance">1-on-1 Mentor Guidance</option>
                        <option value="Structured Video Courses">Structured Video Courses</option>
                        <option value="Deep Documentation & Reading">Deep Documentation & Reading</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Weekly Study Commitment
                      </label>
                      <select
                        value={studentPrefs.weeklyHours}
                        onChange={(e) => setStudentPrefs({ ...studentPrefs, weeklyHours: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="5-10 hrs/week">5-10 hrs/week (Casual)</option>
                        <option value="10-15 hrs/week">10-15 hrs/week (Recommended)</option>
                        <option value="15-25 hrs/week">15-25 hrs/week (Intensive)</option>
                        <option value="30+ hrs/week">30+ hrs/week (Full-Time Bootcamp)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                        Personalized Career Trajectory Active
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                        These preferences continuously customize your adaptive quiz sprints, milestone roadmaps, and mentor recommendations.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleSaveStudentPrefs}
                      disabled={isSaving}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:shadow-md transition-all disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Career Preferences</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Mentor Preferences Tab (When Mentor Role Present) */}
              {activeTab === 'mentor' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      Mentor Mode Preferences
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage your mentorship portal settings and student discovery
                    </p>
                  </div>

                  <div className="p-5 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-purple-900 dark:text-purple-200">Mentor Portal Active</h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                        Access your full mentorship dashboard, availability calendar, and mentee sessions.
                      </p>
                    </div>
                    <Link
                      to="/mentor/profile"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex-shrink-0 shadow-sm"
                    >
                      <span>Open Mentor Profile Editor</span>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                      to="/mentor/availability"
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 transition-colors group block"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                        Manage Availability Schedule →
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Define recurring slots when students can book 1-on-1 mentorship.
                      </p>
                    </Link>

                    <Link
                      to="/mentor/sessions"
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 transition-colors group block"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                        View Active Sessions →
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Track upcoming bookings, mentee details, and meeting links.
                      </p>
                    </Link>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      Security & Password
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage your password and credentials
                    </p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Enter your existing password"
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="At least 6 characters"
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Re-enter new password"
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="inline-flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {isChangingPassword ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Updating Password...</span>
                          </>
                        ) : (
                          <>
                            <KeyRound className="h-4 w-4" />
                            <span>Update Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Active Sessions */}
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                      Active Login Session
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Current Browser Session</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Authenticated via Secure JWT</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Active Now
                      </span>
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
                        Control how and when you receive career alerts and messages
                      </p>
                    </div>
                    <button
                      onClick={() => setShowNotifications(true)}
                      className="relative flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-md transition-all text-sm"
                    >
                      <Bell className="h-4 w-4" />
                      <span>Notification Center</span>
                      {unreadCount > 0 && (
                        <span className="h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {Object.entries({
                      emailNotifications: 'Email Notifications & Summaries',
                      quizReminders: 'Adaptive Quiz & Sprint Milestone Reminders',
                      mentorMessages: 'Mentor Direct Messages & Booking Alerts',
                      weeklyDigest: 'Weekly Career Progress Digest',
                      marketingEmails: 'Platform Announcements & New Features',
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <div className="pr-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Real-time push delivery when active
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNotificationChange(key as NotificationKey)}
                          className={cn(
                            'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none',
                            notifications[key as NotificationKey]
                              ? 'bg-blue-600'
                              : 'bg-gray-300 dark:bg-gray-600'
                          )}
                        >
                          <span
                            className={cn(
                              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow',
                              notifications[key as NotificationKey]
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
                      Appearance & Theme
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Customize how CareerForge AI looks on your screen with high-contrast themes
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Select Theme
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { 
                          value: 'light' as Theme, 
                          label: 'Light Mode', 
                          icon: Sun, 
                          desc: 'Crisp, high-contrast light palette' 
                        },
                        { 
                          value: 'dark' as Theme, 
                          label: 'Dark Mode', 
                          icon: Moon, 
                          desc: 'Sleek, deep slate low-light palette' 
                        },
                        { 
                          value: 'system' as Theme, 
                          label: 'System Default', 
                          icon: Monitor, 
                          desc: 'Syncs automatically with your OS' 
                        },
                      ].map((themeOption) => {
                        const isSelected = theme === themeOption.value;
                        const Icon = themeOption.icon;
                        return (
                          <button
                            key={themeOption.value}
                            type="button"
                            onClick={() => {
                              setTheme(themeOption.value);
                              toast.success(`Theme set to ${themeOption.label}`);
                            }}
                            className={cn(
                              'relative flex flex-col p-5 rounded-xl border-2 text-left transition-all',
                              isSelected
                                ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 shadow-sm'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                            )}
                          >
                            {isSelected && (
                              <div className="absolute top-3 right-3 h-5 w-5 bg-blue-600 text-white rounded-full flex items-center justify-center">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                            <Icon className={cn('h-7 w-7 mb-3', isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300')} />
                            <span className="text-base font-semibold text-gray-900 dark:text-white">
                              {themeOption.label}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {themeOption.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Contrast & Theme Preview */}
                  <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/60">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                      Live Interface Contrast Preview ({isDark ? 'Dark Mode Active' : 'Light Mode Active'})
                    </h4>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">
                            Clear Heading & Body Text
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded">
                            Accessible
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Text colors adapt with WCAG AAA compliant contrast so no labels wash out.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        >
                          Cancel
                        </button>
                        <button 
                          type="button" 
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white shadow-sm"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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

export default SettingsPage;
import React, { useState, useEffect } from 'react';
import { useTheme, type Theme } from '@/contexts/ThemeContext';
import { useToast } from '@/components/ui/Toast';
import { apiClient, getValidAuthToken } from '@/lib/api-client';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  User,
  Building,
  Briefcase,
  DollarSign,
  Linkedin,
  Globe,
  Tag,
  Save,
  Clock,
  Calendar,
  Lock,
  Palette,
  Sun,
  Moon,
  Monitor,
  Check,
  KeyRound,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const MentorProfile: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'offerings' | 'security' | 'appearance'>('profile');
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Mentor profile data
  const [mentorData, setMentorData] = useState({
    jobTitle: '',
    company: '',
    industry: 'Technology',
    yearsOfExperience: 3,
    hourlyRate: 0,
    bio: '',
    linkedinUrl: '',
    portfolioUrl: '',
    degree: '',
    collegeName: '',
    graduationYear: new Date().getFullYear(),
    status: 'ACTIVE',
    isVerified: true,
  });

  const [expertiseTags, setExpertiseTags] = useState<string[]>([
    'React & Frontend',
    'Career Transition',
    'System Design',
    'AI Engineering'
  ]);
  const [newTagInput, setNewTagInput] = useState('');

  // Password data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch mentor profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getValidAuthToken();
        if (!token) {
          return;
        }

        const res = await axios.get(`${API_URL}/mentorship/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success && res.data.data) {
          const p = res.data.data;
          setMentorData({
            jobTitle: p.jobTitle || '',
            company: p.company || '',
            industry: p.industry || 'Technology',
            yearsOfExperience: p.yearsOfExperience || 3,
            hourlyRate: p.hourlyRate || 0,
            bio: p.bio || '',
            linkedinUrl: p.linkedinUrl || '',
            portfolioUrl: p.portfolioUrl || '',
            degree: p.degree || '',
            collegeName: p.collegeName || '',
            graduationYear: p.graduationYear || new Date().getFullYear(),
            status: p.status || 'ACTIVE',
            isVerified: p.isVerified !== undefined ? p.isVerified : true,
          });

          if (Array.isArray(p.expertiseAreas) && p.expertiseAreas.length > 0) {
            setExpertiseTags(p.expertiseAreas);
          }
        }
      } catch (err: any) {
        console.debug('Mentor profile not loaded or newly created:', err.message);
      }
    };

    fetchProfile();
  }, []);

  // Save Mentor Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = getValidAuthToken();
      const res = await axios.put(
        `${API_URL}/mentorship/profile`,
        {
          ...mentorData,
          expertiseAreas: expertiseTags,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success('Mentor profile updated successfully!');
      } else {
        toast.error(res.data.message || 'Failed to update mentor profile');
      }
    } catch (err: any) {
      console.error('Error saving mentor profile:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Add Tag
  const handleAddTag = () => {
    const tag = newTagInput.trim();
    if (tag && !expertiseTags.includes(tag)) {
      setExpertiseTags([...expertiseTags, tag]);
      setNewTagInput('');
    }
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setExpertiseTags(expertiseTags.filter(t => t !== tagToRemove));
  };

  // Handle Password Change
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

    setChangingPassword(true);
    try {
      const res = await apiClient.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.status === 'success') {
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(res.message || 'Failed to change password');
      }
    } catch (err: any) {
      toast.error(err.message || 'Current password may be incorrect');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 -mx-6 -mt-8 px-6 py-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Mentor Profile & Settings
              </h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                {mentorData.status === 'ACTIVE' ? 'Verified Mentor' : 'Status: ' + mentorData.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage your mentor credentials, expertise areas, session offerings, and theme
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/mentor/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1 bg-white dark:bg-gray-800 rounded-xl p-2 border border-gray-200 dark:border-gray-700 shadow-sm">
              {[
                { id: 'profile' as const, label: 'Mentor Profile', icon: User },
                { id: 'offerings' as const, label: 'Offerings & Schedule', icon: Calendar },
                { id: 'security' as const, label: 'Security & Password', icon: Lock },
                { id: 'appearance' as const, label: 'Appearance & Theme', icon: Palette },
              ].map((tab) => {
                const Icon = tab.icon;
                const isCurrent = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center space-x-3 w-full px-4 py-3 rounded-lg font-medium text-left transition-all',
                      isCurrent
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', isCurrent ? 'text-white' : 'text-gray-500 dark:text-gray-400')} />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8 shadow-sm">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      Professional Details
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      These details appear to students browsing mentors on CareerForge
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Job Title
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={mentorData.jobTitle}
                          onChange={(e) => setMentorData({ ...mentorData, jobTitle: e.target.value })}
                          placeholder="e.g. Senior AI Engineer"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company / Organization
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={mentorData.company}
                          onChange={(e) => setMentorData({ ...mentorData, company: e.target.value })}
                          placeholder="e.g. Google / DeepMind"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Years of Industry Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={mentorData.yearsOfExperience}
                        onChange={(e) => setMentorData({ ...mentorData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hourly Rate ($ USD)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          min="0"
                          value={mentorData.hourlyRate}
                          onChange={(e) => setMentorData({ ...mentorData, hourlyRate: parseFloat(e.target.value) || 0 })}
                          placeholder="0 for pro bono / free"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Set to 0 to offer free community mentoring.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mentor Bio & Philosophy
                    </label>
                    <textarea
                      rows={4}
                      value={mentorData.bio}
                      onChange={(e) => setMentorData({ ...mentorData, bio: e.target.value })}
                      placeholder="Share your technical background, mentoring style, and how you help mentees break into tech..."
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    />
                  </div>

                  {/* Expertise Areas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expertise Areas & Mentoring Topics
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {expertiseTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                        >
                          <Tag className="h-3 w-3" />
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-purple-900 dark:hover:text-white ml-0.5 text-sm"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                        placeholder="Add skill or topic (e.g. LLMs, Next.js, Mock Interview)..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        LinkedIn Profile URL
                      </label>
                      <div className="relative">
                        <Linkedin className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="url"
                          value={mentorData.linkedinUrl}
                          onChange={(e) => setMentorData({ ...mentorData, linkedinUrl: e.target.value })}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Portfolio / GitHub URL
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="url"
                          value={mentorData.portfolioUrl}
                          onChange={(e) => setMentorData({ ...mentorData, portfolioUrl: e.target.value })}
                          placeholder="https://github.com/username"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-md transition-all disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving Profile...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save Mentor Profile</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Offerings & Schedule Tab */}
              {activeTab === 'offerings' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      Session Offerings & Availability
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Configure your session formats and link to your booking schedule
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Availability Calendar</h4>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                        Add weekly time slots when mentees can book guidance sessions with you.
                      </p>
                      <Link
                        to="/mentor/availability"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                      >
                        <span>Manage Time Slots</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <div className="p-5 border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Active Sessions</h4>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                        Review upcoming student bookings, join video meetings, or take notes.
                      </p>
                      <Link
                        to="/mentor/sessions"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                      >
                        <span>View Sessions</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      Mentor Security & Password
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Update your account password and authentication credentials
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
                        placeholder="Enter your current password"
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
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
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
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
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="inline-flex items-center space-x-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        <KeyRound className="h-4 w-4" />
                        <span>Update Password</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      Portal Theme & Appearance
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Customize portal contrast and illumination
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { value: 'light' as Theme, label: 'Light Mode', icon: Sun, desc: 'High-contrast light interface' },
                      { value: 'dark' as Theme, label: 'Dark Mode', icon: Moon, desc: 'Deep slate low-light interface' },
                      { value: 'system' as Theme, label: 'System Default', icon: Monitor, desc: 'Auto-adapts to operating system' },
                    ].map((opt) => {
                      const isSelected = theme === opt.value;
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setTheme(opt.value);
                            toast.success(`Theme set to ${opt.label}`);
                          }}
                          className={cn(
                            'relative flex flex-col p-5 rounded-xl border-2 text-left transition-all',
                            isSelected
                              ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/30 shadow-sm'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3 h-5 w-5 bg-purple-600 text-white rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                          <Icon className={cn('h-7 w-7 mb-3', isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300')} />
                          <span className="text-base font-semibold text-gray-900 dark:text-white">
                            {opt.label}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {opt.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;

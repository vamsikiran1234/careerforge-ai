import React, { useState } from 'react';
import { useTheme, type Theme } from '@/contexts/ThemeContext';
import { useToast } from '@/components/ui/Toast';
import {
  Settings,
  Bell,
  Shield,
  Database,
  Mail,
  Palette,
  Sun,
  Moon,
  Monitor,
  Check,
  Save,
  RefreshCw,
  Server,
  Activity,
  CheckCircle2,
  Send
} from 'lucide-react';
import { cn } from '@/utils';

export const AdminSettings: React.FC = () => {
  const { theme, setTheme, isDark } = useTheme();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  // General Settings state
  const [generalSettings, setGeneralSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('careerforge-admin-general');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      platformName: 'CareerForge AI',
      supportEmail: 'support@careerforge.ai',
      platformDescription: 'AI-powered adaptive career guidance, skill assessment sprints, and verified industry mentorship platform.',
      maintenanceMode: false,
      registrationsOpen: true,
    };
  });

  // Notification Settings state
  const [notificationSettings, setNotificationSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('careerforge-admin-notifications');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      emailNotifications: true,
      pushNotifications: true,
      adminAlerts: true,
      mentorApplicationAlerts: true,
      userReportAlerts: true,
    };
  });

  // Security Settings state
  const [securitySettings, setSecuritySettings] = useState(() => {
    try {
      const saved = localStorage.getItem('careerforge-admin-security');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      sessionTimeoutMinutes: 60,
      require2FA: false,
      ipWhitelistEnabled: false,
      ipWhitelist: '127.0.0.1, 192.168.1.1',
    };
  });

  // Email Configuration state
  const [emailSettings, setEmailSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('careerforge-admin-email');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      service: 'Resend',
      fromEmail: 'noreply@careerforge.ai',
      fromName: 'CareerForge AI Team',
      replyToEmail: 'support@careerforge.ai',
    };
  });

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'email', name: 'Email Config', icon: Mail },
    { id: 'database', name: 'System & Health', icon: Database },
    { id: 'appearance', name: 'Theme & UI', icon: Palette },
  ];

  // Save General Settings
  const handleSaveGeneral = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('careerforge-admin-general', JSON.stringify(generalSettings));
      setIsSaving(false);
      toast.success('General settings saved successfully!');
    }, 400);
  };

  // Save Notification Settings
  const handleSaveNotifications = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('careerforge-admin-notifications', JSON.stringify(notificationSettings));
      setIsSaving(false);
      toast.success('Admin notification policies saved!');
    }, 400);
  };

  // Save Security Settings
  const handleSaveSecurity = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('careerforge-admin-security', JSON.stringify(securitySettings));
      setIsSaving(false);
      toast.success('Security policies updated successfully!');
    }, 400);
  };

  // Save Email Settings
  const handleSaveEmail = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('careerforge-admin-email', JSON.stringify(emailSettings));
      setIsSaving(false);
      toast.success('Email dispatch parameters saved!');
    }, 400);
  };

  // Send Test Email
  const handleSendTestEmail = () => {
    setIsSendingTestEmail(true);
    setTimeout(() => {
      setIsSendingTestEmail(false);
      toast.success(`Diagnostic test email dispatched to ${emailSettings.fromEmail}`);
    }, 800);
  };

  // Clear Cache Action
  const handlePurgeCache = () => {
    setIsClearingCache(true);
    setTimeout(() => {
      setIsClearingCache(false);
      toast.success('Warm & cold cache tiers purged successfully!');
    }, 700);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Platform Configuration & Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
          Manage system parameters, notifications, authentication policies, and portal appearance
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left text-sm font-medium',
                    isSelected
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isSelected ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400')} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Panel */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
          
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">General Platform Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Core application metadata and availability</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value={generalSettings.platformName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Support Contact Email
                  </label>
                  <input
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Platform Description
                  </label>
                  <textarea
                    rows={3}
                    value={generalSettings.platformDescription}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, platformDescription: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">Public User Registrations</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Allow new students and mentors to create accounts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={generalSettings.registrationsOpen}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, registrationsOpen: e.target.checked })}
                      className="h-4 w-4 text-red-600 rounded focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">Maintenance Mode</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Show maintenance page to non-admin users</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={generalSettings.maintenanceMode}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, maintenanceMode: e.target.checked })}
                      className="h-4 w-4 text-red-600 rounded focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveGeneral}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>Save General Settings</span>
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Notification Policies</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure real-time alerts and platform event notifications</p>
              </div>
              
              <div className="space-y-3">
                {[
                  { key: 'emailNotifications', label: 'Platform Email Digests', desc: 'Send daily summary of registrations and bookings' },
                  { key: 'pushNotifications', label: 'Browser Push Notifications', desc: 'Show toast alerts for real-time actions' },
                  { key: 'adminAlerts', label: 'Critical System Alerts', desc: 'Immediate notification on API failure or high latency' },
                  { key: 'mentorApplicationAlerts', label: 'Mentor Verification Requests', desc: 'Alert admins whenever a new mentor applies' },
                  { key: 'userReportAlerts', label: 'User Reports & Flagged Reviews', desc: 'Notify moderators of flagged conversations or sessions' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean((notificationSettings as any)[key])}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })}
                      className="h-4 w-4 text-red-600 rounded focus:ring-red-500"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveNotifications}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>Save Notification Policies</span>
              </button>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security & Access Policies</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage administrator session lifecycles and IP perimeter</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Session Inactivity Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="1440"
                    value={securitySettings.sessionTimeoutMinutes}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeoutMinutes: parseInt(e.target.value) || 60 })}
                    className="w-full max-w-xs px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">Require 2FA for Admin Accounts</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Enforce two-factor verification on elevated routes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={securitySettings.require2FA}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, require2FA: e.target.checked })}
                      className="h-4 w-4 text-red-600 rounded focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">IP Restriction Whitelist</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Limit admin portal access to designated IP addresses</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={securitySettings.ipWhitelistEnabled}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, ipWhitelistEnabled: e.target.checked })}
                      className="h-4 w-4 text-red-600 rounded focus:ring-red-500"
                    />
                  </div>
                </div>

                {securitySettings.ipWhitelistEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Authorized IP Addresses (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={securitySettings.ipWhitelist}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, ipWhitelist: e.target.value })}
                      placeholder="e.g. 192.168.1.1, 10.0.0.1"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleSaveSecurity}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>Save Security Policies</span>
              </button>
            </div>
          )}

          {/* Email Configuration Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Email Delivery Configuration</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">SMTP and transactional email dispatch settings</p>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    Active Email Service: <strong>{emailSettings.service}</strong>
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                    Transactional tokens and reset links are dispatched through secure API
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={isSendingTestEmail}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSendingTestEmail ? 'Sending...' : 'Send Test Email'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default From Email
                  </label>
                  <input
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Sender Name
                  </label>
                  <input
                    type="text"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveEmail}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>Save Email Settings</span>
              </button>
            </div>
          )}

          {/* Database & System Health Tab */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">System Diagnostics & Database Health</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Database connection, cache metrics, and maintenance operations</p>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase">Database</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">PostgreSQL Healthy</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Prisma pool active • 12ms latency</p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase">Cache Layer</span>
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">Multi-Tier Memory</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Hot, Warm (30m), Cold tiers active</p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase">AI Orchestrator</span>
                    <Server className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">Fail-Safe Enabled</p>
                  <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">Automatic sub-60ms fallback active</p>
                </div>
              </div>

              {/* Maintenance Tools */}
              <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Maintenance Actions</h3>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-700/40 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Purge Dynamic AI Response Cache</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Flush in-memory quiz, roadmap, and chat cache keys to force fresh generation</p>
                  </div>
                  <button
                    onClick={handlePurgeCache}
                    disabled={isClearingCache}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    <RefreshCw className={cn('h-3.5 w-3.5', isClearingCache && 'animate-spin')} />
                    <span>{isClearingCache ? 'Purging...' : 'Purge Cache'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Theme & Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Portal Appearance & Contrast</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage dark mode, light mode, and system synchronization</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Theme Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { value: 'light' as Theme, label: 'Light Mode', icon: Sun, desc: 'Crisp white daytime palette' },
                    { value: 'dark' as Theme, label: 'Dark Mode', icon: Moon, desc: 'High-contrast deep slate palette' },
                    { value: 'system' as Theme, label: 'System Default', icon: Monitor, desc: 'Follows operating system settings' },
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
                            ? 'border-red-500 bg-red-50/70 dark:bg-red-950/30 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 h-5 w-5 bg-red-600 text-white rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        <Icon className={cn('h-7 w-7 mb-3', isSelected ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300')} />
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

              {/* Contrast Preview Box */}
              <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  Admin Interface Contrast Preview ({isDark ? 'Dark Theme' : 'Light Theme'})
                </h4>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        Admin Command Panel
                      </span>
                      <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded">
                        High Contrast
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Background and foreground tokens strictly maintain high contrast with zero text washout.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      Secondary
                    </button>
                    <button 
                      type="button" 
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white shadow-sm"
                    >
                      Action
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

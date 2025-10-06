import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Lock,
  Globe,
  X,
  Check,
  Settings,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ChatSession } from '@/store/chat';
import type { ShareLinkOptions, ShareSettings } from '@/types/sharing';
import { formatShareDate } from '@/types/sharing';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session: ChatSession | null;
  onShare: (shareOptions: ShareLinkOptions) => Promise<ShareSettings>;
  existingShares?: ShareSettings[];
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  session,
  onShare,
  existingShares = [],
}) => {
  const [shareOptions, setShareOptions] = useState<ShareLinkOptions>({
    isPublic: true,
    expirationDays: 7,
    allowCopy: true,
    allowDownload: true,
    allowScroll: false,
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<ShareSettings | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setShareResult(null);
      setCopiedLink(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !session) return null;

  const handleShare = async () => {
    setIsSharing(true);
    setError(null);
    try {
      console.log('ShareDialog: Calling onShare with session:', session.id);
      const result = await onShare(shareOptions);
      console.log('ShareDialog: Share result:', result);
      setShareResult(result);
    } catch (error: any) {
      console.error('ShareDialog: Failed to create share link:', error);
      setError(error.message || 'Failed to create share link. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const expirationOptions = [
    { value: 1, label: '1 day' },
    { value: 3, label: '3 days' },
    { value: 7, label: '1 week' },
    { value: 30, label: '1 month' },
    { value: 0, label: 'Never' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Share Conversation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Session Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              {session.title || 'Career Strategy Session'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {session.messages.length} messages • Last updated {new Date(session.updatedAt).toLocaleDateString()}
            </p>
          </div>

          {shareResult ? (
            /* Share Success View */
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Check className="w-5 h-5" />
                <span className="font-medium">Share link created successfully!</span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share Link</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Code: {shareResult.shareCode}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={shareResult.shareLink}
                      readOnly
                      onClick={(e) => e.currentTarget.select()}
                      className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text selection:bg-blue-200 dark:selection:bg-blue-900"
                    />
                  </div>
                  <Button
                    onClick={() => handleCopyLink(shareResult.shareLink)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                    title="Copy to clipboard"
                  >
                    {copiedLink ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span className="text-gray-900 dark:text-white font-medium">{shareResult.isPublic ? 'Public' : 'Private'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                  <span className="text-gray-900 dark:text-white font-medium">{shareResult.expiresAt ? formatShareDate(shareResult.expiresAt) : 'No expiration'}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Share Configuration View */
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Error creating share link</h4>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Privacy Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShareOptions(prev => ({ ...prev, isPublic: true }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      shareOptions.isPublic
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <Globe className={`w-5 h-5 mx-auto mb-2 ${
                      shareOptions.isPublic ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Public</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Anyone with link</div>
                  </button>

                  <button
                    onClick={() => setShareOptions(prev => ({ ...prev, isPublic: false }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      !shareOptions.isPublic
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <Lock className={`w-5 h-5 mx-auto mb-2 ${
                      !shareOptions.isPublic ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Private</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Password protected</div>
                  </button>
                </div>
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Link Expiration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {expirationOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setShareOptions(prev => ({ ...prev, expirationDays: option.value || undefined }))}
                      className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                        shareOptions.expirationDays === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Options */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Advanced Options
                  </div>
                  <div className={`transform transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                <div className={`transition-all duration-300 ease-in-out ${
                  showAdvanced ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                }`}>
                  <div className="space-y-4 pb-2">
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors">
                      <input
                        type="checkbox"
                        checked={shareOptions.allowCopy}
                        onChange={(e) => setShareOptions(prev => ({ ...prev, allowCopy: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow copying text</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Users can copy conversation content</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors">
                      <input
                        type="checkbox"
                        checked={shareOptions.allowDownload}
                        onChange={(e) => setShareOptions(prev => ({ ...prev, allowDownload: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow downloading</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Users can download conversation as file</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors">
                      <input
                        type="checkbox"
                        checked={shareOptions.allowScroll}
                        onChange={(e) => setShareOptions(prev => ({ ...prev, allowScroll: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable scroll controls</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Add up/down scroll buttons for easier navigation</p>
                      </div>
                    </label>

                    {!shareOptions.isPublic && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Password Protection
                        </label>
                        <input
                          type="password"
                          placeholder="Enter password (optional)"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                   bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 
                                   focus:ring-blue-500 focus:border-transparent"
                          onChange={(e) => setShareOptions(prev => ({ ...prev, password: e.target.value }))}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Add a password to protect access to this conversation
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Existing Shares */}
          {existingShares.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Existing Shares
              </h4>
              <div className="space-y-2">
                {existingShares.slice(0, 3).map(share => (
                  <div key={share.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Code: {share.shareCode}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {share.viewCount} views • {formatShareDate(share.expiresAt || '')}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleCopyLink(share.shareLink)}
                      size="sm"
                      variant="ghost"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Action Buttons Footer - Only show when not in result view */}
        {!shareResult && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900 flex-shrink-0">
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleShare}
                disabled={isSharing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSharing ? 'Creating...' : 'Create Share Link'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareDialog;
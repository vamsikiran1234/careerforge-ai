import React, { useState } from 'react';
import { X, Download, FileText, FileCode, Printer, CheckCircle } from 'lucide-react';
import type { ChatSession } from '@/store/chat';
import ConversationExporter from '@/utils/conversationExporter';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId?: string;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId
}) => {
  // Filter out duplicate sessions by ID
  const uniqueSessions = React.useMemo(() => {
    const seen = new Set<string>();
    return sessions.filter(session => {
      if (seen.has(session.id)) {
        return false;
      }
      seen.add(session.id);
      return true;
    });
  }, [sessions]);

  const [selectedSessions, setSelectedSessions] = useState<string[]>(
    currentSessionId ? [currentSessionId] : []
  );
  const [exportFormat, setExportFormat] = useState<'markdown' | 'txt' | 'pdf' | 'json'>('markdown');
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [customTitle, setCustomTitle] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const formatOptions = [
    {
      value: 'markdown' as const,
      label: 'Markdown (.md)',
      icon: FileText,
      description: 'Rich formatting with headers and styling'
    },
    {
      value: 'txt' as const,
      label: 'Plain Text (.txt)',
      icon: FileText,
      description: 'Simple text format, universally compatible'
    },
    {
      value: 'json' as const,
      label: 'JSON (.json)',
      icon: FileCode,
      description: 'Structured data format for developers'
    },
    {
      value: 'pdf' as const,
      label: 'PDF (via Print)',
      icon: Printer,
      description: 'Professional format using browser print'
    }
  ];

  const handleSessionToggle = (sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSessions.length === uniqueSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(uniqueSessions.map(s => s.id));
    }
  };

  const handleExport = async () => {
    if (selectedSessions.length === 0) return;

    setIsExporting(true);
    setExportSuccess(false);

    try {
      const sessionsToExport = uniqueSessions.filter(s => selectedSessions.includes(s.id));
      
      const options = {
        format: exportFormat,
        includeTimestamps,
        title: customTitle || undefined
      };

      if (sessionsToExport.length === 1) {
        await ConversationExporter.exportSession(sessionsToExport[0], options);
      } else {
        if (exportFormat === 'pdf') {
          // For multiple sessions as PDF, export them one by one
          for (const session of sessionsToExport) {
            await ConversationExporter.exportSession(session, options);
          }
        } else {
          await ConversationExporter.exportMultipleSessions(sessionsToExport, exportFormat, options);
        }
      }

      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const selectedSessionsData = uniqueSessions.filter(s => selectedSessions.includes(s.id));
  const totalMessages = selectedSessionsData.reduce((sum, s) => sum + s.messages.length, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Export Conversations</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Export Format</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formatOptions.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  onClick={() => setExportFormat(value)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    exportFormat === value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                      : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${
                      exportFormat === value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    <div>
                      <div className={`font-medium ${
                        exportFormat === value ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                      }`}>
                        {label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Session Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select Conversations</h3>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                {selectedSessions.length === uniqueSessions.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 dark:border-slate-600 rounded-lg">
              {uniqueSessions.map((session) => (
                <label
                  key={session.id}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedSessions.includes(session.id)}
                    onChange={() => handleSessionToggle(session.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {session.title || 'Untitled Conversation'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {session.messages.length} messages • {new Date(session.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Export Options</h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTimestamps}
                  onChange={(e) => setIncludeTimestamps(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Include timestamps</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom title (optional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Custom export filename..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg 
                           bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                           placeholder-gray-400 dark:placeholder-gray-500
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Export Summary */}
          {selectedSessions.length > 0 && (
            <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Export Summary</h4>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <div>• {selectedSessions.length} conversation{selectedSessions.length !== 1 ? 's' : ''} selected</div>
                <div>• {totalMessages} total messages</div>
                <div>• Export format: {formatOptions.find(f => f.value === exportFormat)?.label}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-700 
                      bg-gray-50 dark:bg-slate-800/50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedSessions.length === 0 && 'Select at least one conversation to export'}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 
                         bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 
                         rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={selectedSessions.length === 0 || isExporting}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg 
                         hover:bg-blue-700 dark:hover:bg-blue-600 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all 
                         flex items-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : exportSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Success!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;
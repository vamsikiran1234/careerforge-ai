import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MessageSquare, Plus, Trash2, Share2, Sun, Moon } from 'lucide-react';
import { CareerForgeAvatar } from '@/components/ui/CareerForgeAvatar';
import { useTheme } from '@/contexts/ThemeContext';
import ExportDialog from './ExportDialog';
import TemplateSelector from './TemplateSelector';
import { useChatStore } from '@/store/chat';
import type { ChatSession } from '@/store/chat';
import type { CareerTemplate } from '@/data/careerTemplates';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession?: (sessionId: string) => void;
  onShareSession?: (sessionId: string) => void;
  isLoading?: boolean;
  onToggleCollapse?: () => void; // New prop for desktop sidebar toggle
  isCollapsed?: boolean; // New prop to indicate collapsed state
  onResize?: (width: number) => void; // New prop for resize callback
  onToggleFullscreen?: () => void; // New prop for fullscreen toggle
  isFullscreen?: boolean; // New prop to indicate fullscreen state
}



export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onShareSession,
  isLoading = false,
  onToggleCollapse,
  isCollapsed = false,
  onResize,

}) => {
  const {
    showExportDialog,
    closeExportDialog,
    showTemplateSelector,
    closeTemplateSelector,
    createNewSession
  } = useChatStore();

  const { toggleTheme, isDark } = useTheme();

  const handleTemplateSelect = async (template: CareerTemplate) => {
    await createNewSession(template.initialPrompt);
  };

  // Sidebar resize functionality
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const diff = e.clientX - startX.current;
    const newWidth = Math.min(Math.max(startWidth.current + diff, 280), 600);
    setSidebarWidth(newWidth);
    onResize?.(newWidth);
  }, [isResizing, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);
  return (
    <div
      className={`chat-sidebar-fixed fixed top-0 left-0 h-screen overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700`}
      style={{ width: isCollapsed ? '64px' : `${sidebarWidth}px`, zIndex: 60 }}
    >
      {/* Main Sidebar Content */}
      <div className="flex flex-col h-full">{/* Header Section - ChatGPT-like minimal */}
        <div className={`border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'p-3' : 'p-4'}`}>
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CareerForgeAvatar size="md" showGradient={true} />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    CareerForge AI
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Elite Career Mentor</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Hide Sidebar Button */}
                {onToggleCollapse && (
                  <button
                    onClick={onToggleCollapse}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Hide sidebar"
                  >
                    {/* Left-pointing chevron to hide sidebar */}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <CareerForgeAvatar size="sm" showGradient={true} />
            </div>
          )}
        </div>

        {/* New Chat Button - ChatGPT-like simple */}
        <div className={`border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'p-2' : 'p-3'}`}>
          {isCollapsed ? (
            <button
              onClick={onNewSession}
              disabled={isLoading}
              className="w-full h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onNewSession}
              disabled={isLoading}
              className="w-full px-3 py-2.5 flex items-center gap-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-900 dark:text-gray-100 font-medium"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          )}
        </div>



        {/* Sessions List - ChatGPT-like with custom scrollbar */}
        <div className="relative flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
            {isLoading ? (
              <div className={`text-center ${isCollapsed ? 'p-3' : 'p-6'}`}>
                <div className="relative">
                  <div className={`mx-auto mb-4 border-4 border-blue-500 rounded-full animate-spin border-t-transparent ${isCollapsed ? 'w-8 h-8' : 'w-12 h-12'}`}></div>
                </div>
                {!isCollapsed && <p className="font-medium text-gray-600 dark:text-gray-300">Loading your career journey...</p>}
              </div>
            ) : sessions.length === 0 ? (
              <div className={`text-center ${isCollapsed ? 'p-3' : 'p-6'}`}>
                <div className={`flex items-center justify-center mx-auto mb-4 shadow-sm bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl ${isCollapsed ? 'w-10 h-10' : 'w-20 h-20'}`}>
                  <MessageSquare className={`text-blue-600 dark:text-emerald-400 ${isCollapsed ? 'w-5 h-5' : 'w-10 h-10'}`} />
                </div>
                {!isCollapsed && (
                  <>
                    <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-gray-100">Your Career Journey Starts Here</h3>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      Begin your first conversation with your AI career mentor for personalized guidance and insights.
                    </p>
                  </>
                )}
              </div>
            ) : isCollapsed ? (
              /* Collapsed Sessions List - ChatGPT-like minimal icons */
              <div className="p-2 space-y-1">
                {sessions.filter(session => session.messages.length > 0).slice(0, 12).map((session) => (
                  <div
                    key={session.id}
                    onClick={() => onSelectSession(session.id)}
                    className={`group relative w-10 h-10 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center ${session.id === currentSessionId
                      ? 'bg-blue-600 dark:bg-blue-600 text-white dark:text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    title={session.title || 'New Career Session'}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </div>
                ))}
              </div>
            ) : (
              /* Expanded Sessions List - ChatGPT-like clean design */
              <div className="p-2 pb-6 space-y-1">
                {sessions.filter(session => session.messages.length > 0).map((session) => (
                  <div
                    key={session.id}
                    onClick={() => onSelectSession(session.id)}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${session.id === currentSessionId
                      ? 'bg-blue-600 dark:bg-blue-600 text-white dark:text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="flex-shrink-0 w-4 h-4" />
                          <h3 className="font-medium text-sm truncate">
                            {session.title || 'New Career Session'}
                          </h3>
                        </div>

                        {session.messages.length > 0 && (
                          <p className="text-xs truncate mt-1 opacity-70">
                            {session.messages[session.messages.length - 1]?.content || 'No messages'}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center flex-shrink-0 gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onShareSession && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onShareSession(session.id);
                            }}
                            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="Share conversation"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteSession && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(session.id);
                            }}
                            className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>



        {/* Export Dialog */}
        <ExportDialog
          isOpen={showExportDialog}
          onClose={closeExportDialog}
          sessions={sessions}
          currentSessionId={currentSessionId}
        />

        {/* Template Selector */}
        <TemplateSelector
          isOpen={showTemplateSelector}
          onClose={closeTemplateSelector}
          onSelectTemplate={handleTemplateSelect}
        />
      </div>

      {/* Resize Handle - Only show when not collapsed - Absolute positioned on right edge */}
      {!isCollapsed && (
        <div
          className="absolute top-0 right-0 bottom-0 w-1 transition-colors duration-200 bg-transparent select-none cursor-col-resize group hover:w-2"
          onMouseDown={handleMouseDown}
          style={{ right: '-4px' }}
        >
          <div className="absolute inset-y-0 w-2 group-hover:bg-blue-400/10" style={{ left: '-4px', right: '-4px' }}></div>
          <div className="absolute w-1 h-12 transition-all duration-200 transform -translate-y-1/2 bg-gray-300/50 rounded top-1/2 left-0 dark:bg-gray-500/50 group-hover:bg-blue-500 group-hover:w-1"></div>
        </div>
      )}
    </div>
  );
};

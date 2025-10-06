import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MessageSquare, Plus, Trash2, Share2, Download, FileText, Maximize2, Minimize2, Briefcase, Target, Users, Award, TrendingUp, BookOpen, Lightbulb, Moon, Sun, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CareerForgeAvatar } from '@/components/ui/CareerForgeAvatar';
import { useTheme } from '@/contexts/ThemeContext';

import { SearchBar } from './SearchBar';
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

// Get appropriate icon based on conversation title/type
const getConversationIcon = (title: string) => {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('resume') || titleLower.includes('cv')) {
    return FileText;
  } else if (titleLower.includes('interview')) {
    return Users;
  } else if (titleLower.includes('salary') || titleLower.includes('negotiation')) {
    return TrendingUp;
  } else if (titleLower.includes('job search') || titleLower.includes('career transition')) {
    return Target;
  } else if (titleLower.includes('linkedin') || titleLower.includes('networking')) {
    return Users;
  } else if (titleLower.includes('skill') || titleLower.includes('learning')) {
    return BookOpen;
  } else if (titleLower.includes('leadership') || titleLower.includes('advancement')) {
    return Award;
  } else if (titleLower.includes('portfolio') || titleLower.includes('branding')) {
    return Lightbulb;
  } else if (titleLower.includes('career') || titleLower.includes('strategy')) {
    return Briefcase;
  }
  
  return MessageSquare; // Default icon
};

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
  onToggleFullscreen,
  isFullscreen = false,
}) => {
  const { 
    showExportDialog, 
    openExportDialog, 
    closeExportDialog,
    showTemplateSelector,
    openTemplateSelector,
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
    const newWidth = Math.min(Math.max(startWidth.current + diff, 200), 600);
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
      className={`fixed top-0 left-0 z-10 flex h-full overflow-hidden bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-r border-blue-100/60 dark:border-slate-700/50 text-gray-900 dark:text-white transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : ''}`}
      style={{ width: isCollapsed ? '64px' : `${sidebarWidth}px` }}
    >
      {/* Main Sidebar Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header Section */}
      <div className={`border-b border-blue-100/60 dark:border-slate-700/50 bg-gradient-to-r from-white/80 via-blue-50/50 to-indigo-50/50 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-slate-700/50 backdrop-blur-sm ${isCollapsed ? 'p-3' : 'p-6'}`}>
        <div className={`flex items-center gap-4 ${isCollapsed ? 'mb-3 justify-center' : 'mb-6'}`}>
          <CareerForgeAvatar size="lg" showGradient={true} />
          
          {!isCollapsed && (
            <>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  CareerForge AI
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Elite Career Mentor</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-600 transition-colors duration-200 bg-gray-100 rounded-lg dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300"
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Fullscreen Button */}
                {onToggleFullscreen && (
                  <button
                    onClick={onToggleFullscreen}
                    className="p-2 transition-all duration-200 rounded-lg text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 group"
                    title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                    ) : (
                      <Maximize2 className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                    )}
                  </button>
                )}

                {/* Hide Sidebar Button */}
                {onToggleCollapse && (
                  <button
                    onClick={onToggleCollapse}
                    className="p-2 transition-all duration-200 rounded-lg text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-700 group"
                    title="Hide sidebar"
                  >
                    <svg
                      className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        
        {isCollapsed ? (
          <div className="flex flex-col items-center space-y-2">
            <Button
              onClick={onNewSession}
              disabled={isLoading}
              className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 group p-0 flex items-center justify-center"
              title="New Career Session"
            >
              <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            </Button>
            
            {/* Fullscreen Button */}
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="flex items-center justify-center w-10 h-10 transition-all duration-200 rounded-lg text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 group"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                ) : (
                  <Maximize2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                )}
              </button>
            )}
            
            {/* Expand Sidebar Button */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="flex items-center justify-center w-10 h-10 transition-all duration-200 rounded-lg text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-700 group"
                title="Expand sidebar"
              >
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={onNewSession}
              disabled={isLoading}
              className="w-full px-6 py-4 font-medium text-white transition-all duration-200 border border-indigo-200 shadow-lg bg-gradient-to-r from-indigo-600 to-blue-600 dark:bg-green-600 hover:from-indigo-700 hover:to-blue-700 dark:hover:bg-green-700 rounded-xl hover:shadow-xl dark:border-green-500 hover:border-indigo-300 dark:hover:border-green-400 group"
            >
              <Plus className="w-5 h-5 mr-3 transition-transform duration-200 group-hover:rotate-90" />
              New Chat
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={openTemplateSelector}
                disabled={isLoading}
                className="px-3 py-3 font-medium text-indigo-700 dark:text-gray-200 transition-all duration-200 border rounded-lg shadow-sm bg-gradient-to-r from-white to-blue-50/50 dark:from-slate-700 dark:to-slate-600 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-600 dark:hover:to-slate-500 border-indigo-200/60 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-slate-500 hover:shadow-md group"
              >
                <FileText className="w-4 h-4 mr-1" />
                Templates
              </Button>
            
              <Button
                onClick={openExportDialog}
                disabled={isLoading || sessions.length === 0}
                className="px-3 py-3 font-medium text-purple-700 dark:text-gray-200 transition-all duration-200 border rounded-lg shadow-sm bg-gradient-to-r from-white to-purple-50/50 dark:from-slate-700 dark:to-slate-600 hover:from-purple-50 hover:to-pink-50 dark:hover:from-slate-600 dark:hover:to-slate-500 border-purple-200/60 dark:border-slate-600 hover:border-purple-300 dark:hover:border-slate-500 hover:shadow-md group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        )}
      </div>

      

      {/* Search Bar - Hide in collapsed mode */}
      {!isCollapsed && (
        <div className="relative px-6 py-4 border-b border-indigo-100/50 dark:border-slate-700/50 bg-gradient-to-r from-white/30 via-blue-50/20 to-indigo-50/20 dark:from-slate-800/30 dark:via-slate-800/20 dark:to-slate-700/20 backdrop-blur-sm">
          <SearchBar onSelectSession={onSelectSession} />
        </div>
      )}

      {/* Sessions List */}
      <div className="relative flex-1 overflow-y-auto">
        {isLoading ? (
          <div className={`text-center ${isCollapsed ? 'p-3' : 'p-6'}`}>
            <div className="relative">
              <div className={`mx-auto mb-4 border-4 border-blue-500 rounded-full animate-spin border-t-transparent ${isCollapsed ? 'w-8 h-8' : 'w-12 h-12'}`}></div>
            </div>
            {!isCollapsed && <p className="font-medium text-slate-600 dark:text-slate-300">Loading your career journey...</p>}
          </div>
        ) : sessions.length === 0 ? (
          <div className={`text-center ${isCollapsed ? 'p-3' : 'p-6'}`}>
            <div className={`flex items-center justify-center mx-auto mb-4 shadow-sm bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-700/50 dark:to-slate-600/50 rounded-2xl ${isCollapsed ? 'w-10 h-10' : 'w-20 h-20'}`}>
              <MessageSquare className={`text-blue-600 dark:text-emerald-400 ${isCollapsed ? 'w-5 h-5' : 'w-10 h-10'}`} />
            </div>
            {!isCollapsed && (
              <>
                <h3 className="mb-2 text-lg font-bold text-slate-800 dark:text-slate-100">Your Career Journey Starts Here</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Begin your first conversation with your AI career mentor for personalized guidance and insights.
                </p>
              </>
            )}
          </div>
        ) : isCollapsed ? (
          /* Collapsed Sessions List - Icon only */
          <div className="p-2 space-y-2">
            {sessions.filter(session => session.messages.length > 0).slice(0, 8).map((session, index) => (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group relative w-12 h-12 rounded-xl cursor-pointer transition-all duration-200 border flex items-center justify-center ${
                  session.id === currentSessionId
                    ? 'bg-blue-500 dark:bg-emerald-600 border-blue-600 dark:border-emerald-500 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-emerald-400 hover:shadow-sm text-slate-600 dark:text-slate-300'
                }`}
                title={session.title || 'New Career Session'}
              >
                <MessageSquare className="w-5 h-5" />
                <div className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full shadow-sm -top-1 -right-1 bg-gradient-to-br from-blue-500 to-indigo-600">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Expanded Sessions List */
          <div className="p-4 space-y-3">
            {sessions.filter(session => session.messages.length > 0).map((session, index) => (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 border backdrop-blur-sm ${
                  session.id === currentSessionId
                    ? 'bg-blue-50 dark:bg-emerald-500/10 border-blue-200 dark:border-emerald-400/40 shadow-lg dark:shadow-emerald-500/10'
                    : 'bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-600/50 hover:border-blue-300 dark:hover:border-emerald-400/60 hover:shadow-md dark:hover:shadow-emerald-500/5'
                }`}
              >
                <div className="absolute flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full shadow-sm -top-2 -left-2 bg-gradient-to-br from-blue-500 to-indigo-600">
                  {index + 1}
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      {React.createElement(getConversationIcon(session.title || 'Career Strategy Session'), {
                        className: `flex-shrink-0 w-4 h-4 ${
                          session.id === currentSessionId 
                            ? 'text-blue-600 dark:text-emerald-400' 
                            : 'text-slate-500 dark:text-slate-300'
                        }`
                      })}
                      <h3 className={`font-semibold text-sm truncate ${
                        session.id === currentSessionId ? 'text-slate-800 dark:text-white' : 'text-slate-700 dark:text-slate-100'
                      }`}>
                        {session.title || 'New Career Session'}
                        {(session.title === 'New Career Session' || !session.title || session.messages.length === 0) && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-emerald-500/20 text-blue-800 dark:text-emerald-300 border dark:border-emerald-400/30">
                            New
                          </span>
                        )}
                      </h3>
                    </div>
                    
                    {session.messages.length > 0 && (
                      <p className={`text-xs truncate mb-3 leading-relaxed ${
                        session.id === currentSessionId ? 'text-slate-600' : 'text-slate-500'
                      }`}>
                        {session.messages[session.messages.length - 1]?.content || 'No messages'}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-2 text-xs ${
                        session.id === currentSessionId ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        <Infinity className="w-4 h-4" />
                        <span>Always</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.id === currentSessionId 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {session.messages.length} insights
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center flex-shrink-0 gap-1 ml-3">
                    {onShareSession && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareSession(session.id);
                        }}
                        className="p-2 text-green-500 transition-all duration-200 rounded-lg opacity-0 group-hover:opacity-100 hover:text-green-600 hover:bg-green-50"
                        title="Share conversation"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDeleteSession && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="p-2 text-red-500 transition-all duration-200 rounded-lg opacity-0 dark:text-red-400 group-hover:opacity-100 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-110"
                        title="Delete session - This action cannot be undone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {session.id === currentSessionId && (
                  <div className="absolute left-0 w-1 h-8 transform -translate-y-1/2 bg-blue-500 rounded-r-full top-1/2"></div>
                )}
              </div>
            ))}
          </div>
        )}
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

      {/* Resize Handle - Only show when not collapsed */}
      {!isCollapsed && (
        <div 
          className="relative w-2 transition-colors duration-200 bg-gray-200 select-none dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-blue-500 cursor-col-resize group"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-400/20"></div>
          <div className="absolute w-1 h-8 transition-colors duration-200 transform -translate-x-1/2 -translate-y-1/2 bg-gray-400 rounded top-1/2 left-1/2 dark:bg-gray-600 group-hover:bg-blue-500"></div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatSidebar } from './ChatSidebar';
import BranchNavigator from './BranchNavigator';
import ShareDialog from './ShareDialog';
import { useChatStore } from '@/store/chat';
import { useAuthStore } from '@/store/auth';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { apiClient } from '@/lib/api-client';
import { AlertCircle, Shield, X, GitBranch } from 'lucide-react';
import { CareerForgeAvatar } from '@/components/ui/CareerForgeAvatar';

interface ChatResponse {
  sessionId: string;
  reply: string;
  timestamp: string;
  messageCount: number;
}

export const ChatInterface: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const { user } = useAuthStore();
  const {
    currentSession,
    sessions,
    isLoading,
    isTyping,
    error,
    sendMessage,
    sendMessageWithFiles,
    loadSessions,
    createNewSession,
    loadSession,
    deleteSession,
    clearError,
    loadMessageReactions,
    branches,
    currentBranchId,
    showBranchNavigator,
    createBranch,
    switchBranch,
    renameBranch,
    deleteBranch,
    closeBranchNavigator,
    showShareDialog,
    openShareDialog,
    closeShareDialog,
    shareSession,
  } = useChatStore();

  // Load user sessions on mount and ensure fresh start
  useEffect(() => {
    if (user?.id) {
      // Add a small delay to prevent duplicate calls in React StrictMode
      const timer = setTimeout(() => {
        loadSessions();
        // Ensure we start with a fresh session instead of loading previous
        if (currentSession) {
          // Clear the current session to start fresh
          useChatStore.setState({ currentSession: null });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user?.id]); // Removed loadSessions from dependencies to prevent re-renders

  // Keyboard shortcut for sidebar toggle
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + S to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setIsSidebarCollapsed(!isSidebarCollapsed);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isSidebarCollapsed]);

  // Load message reactions when session changes
  useEffect(() => {
    if (currentSession?.id) {
      loadMessageReactions(currentSession.id);
    }
  }, [currentSession?.id, loadMessageReactions]);

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleSendMessage = async (message: string, files?: File[]) => {
    if (!currentSession && !files?.length) {
      // Create new session with the user's message
      await createNewSession(message);
      return;
    }
    
    if (files && files.length > 0) {
      // Handle file upload and analysis
      await sendMessageWithFiles(message, files);
    } else {
      // Regular text message
      await sendMessage(message);
    }
  };

  const handleNewSession = async () => {
    // Clear current session first to ensure clean state and prevent mixing
    console.log('ChatInterface: Creating new session, clearing current session first');
    useChatStore.setState({ 
      currentSession: null,
      isLoading: false,
      isTyping: false,
      error: null 
    });
    
    // Small delay to ensure state is cleared
    await new Promise(resolve => setTimeout(resolve, 50));
    await createNewSession();
  };

  const handleSidebarResize = (width: number) => {
    setSidebarWidth(width);
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === 'INPUT' || 
         e.target.tagName === 'TEXTAREA' || 
         e.target.contentEditable === 'true')
      ) {
        return;
      }

      const { 
        openTemplateSelector, 
        openExportDialog, 
        closeTemplateSelector, 
        closeExportDialog, 
        showTemplateSelector, 
        showExportDialog 
      } = useChatStore.getState();

      // Handle keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            handleNewSession();
            break;
          case 'k': {
            e.preventDefault();
            // Focus search bar
            const searchInput = document.querySelector('input[placeholder*="search"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
            break;
          }
          case 't':
            e.preventDefault();
            openTemplateSelector();
            break;
          case 'e':
            e.preventDefault();
            if (sessions.length > 0) {
              openExportDialog();
            }
            break;
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        // Close open dialogs
        if (showTemplateSelector) closeTemplateSelector();
        if (showExportDialog) closeExportDialog();
        // Close mobile sidebar
        if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
      } else if (e.key === '/') {
        // Focus message input to start slash command
        const messageInput = document.querySelector('textarea[placeholder*="Ask me"]') as HTMLTextAreaElement;
        if (messageInput) {
          e.preventDefault();
          messageInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleNewSession, sessions.length, isMobileSidebarOpen]);

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!currentSession) return;

    // Find the message index
    const messageIndex = currentSession.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // Remove all messages after the edited message (including AI responses)
    const messagesBeforeEdit = currentSession.messages.slice(0, messageIndex);
    
    // Create the updated user message
    const updatedUserMessage = {
      ...currentSession.messages[messageIndex],
      content: newContent,
      timestamp: new Date().toISOString() // Update timestamp
    };

    // Update the session with messages up to the edit point + the updated message
    const updatedSession = {
      ...currentSession,
      messages: [...messagesBeforeEdit, updatedUserMessage]
    };

    // Update the store with the edited message (no AI response yet)
    useChatStore.setState({ currentSession: updatedSession });

    // Set loading state for AI response
    useChatStore.setState({ isLoading: true, isTyping: true, error: null });

    try {
      // Send message to backend using apiClient (same as sendMessage function)
      const response = await apiClient.post<ChatResponse>('/chat', {
        message: newContent,
      });

      if (response.status === 'success' && response.data) {
        // Add AI response
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: response.data.reply,
          timestamp: response.data.timestamp,
        };

        const finalUpdatedSession = {
          ...updatedSession,
          messages: [...updatedSession.messages, aiMessage]
        };

        useChatStore.setState({ 
          currentSession: finalUpdatedSession,
          isLoading: false,
          isTyping: false 
        });
      } else {
        throw new Error('API response was not successful');
      }
    } catch (error) {
      console.error('Error editing message:', error);
      useChatStore.setState({ 
        isLoading: false, 
        isTyping: false, 
        error: 'Failed to get AI response' 
      });
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    if (sessionId !== currentSession?.id) {
      // Clear current session first to prevent data mixing
      useChatStore.setState({ currentSession: null });
      await loadSession(sessionId);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    console.log('ChatInterface: Handling delete session:', sessionId);
    
    // Find the session to get its title for confirmation
    const sessionToDelete = sessions.find(s => s.id === sessionId);
    const sessionTitle = sessionToDelete?.title || 'this session';
    
    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to delete "${sessionTitle}"? This action cannot be undone.`);
    
    if (!confirmed) {
      console.log('ChatInterface: Session deletion cancelled by user');
      return;
    }
    
    try {
      // Delete the session completely (this will also handle current session switching)
      await deleteSession(sessionId);
      console.log('ChatInterface: Session deletion completed');
    } catch (error) {
      console.error('ChatInterface: Failed to delete session:', error);
      // The error is already handled in the store, just log it here
    }
  };

  const handleShareSession = (sessionId: string) => {
    // Find the session and open share dialog
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      // Open share dialog for the found session
      openShareDialog();
      // Note: Currently shares the current session, could be enhanced to share specific session
    }
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            Please log in to access your personalized AI career mentor and chat history.
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800 flex items-center">
              <CareerForgeAvatar size="xs" className="mr-2" />
              Your AI career coach is waiting to help you succeed
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 relative ${isFullscreen ? 'fixed inset-0 z-50 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800' : ''}`}>
      {/* Desktop Sidebar - Fixed/Sticky - Hide in fullscreen */}
      {!isFullscreen && (
        <ErrorBoundary>
          <div className="hidden lg:block">
            <ChatSidebar
              sessions={sessions || []}
              currentSessionId={currentSession?.id}
              onSelectSession={handleSelectSession}
              onNewSession={handleNewSession}
              onDeleteSession={handleDeleteSession}
              onShareSession={handleShareSession}
              isLoading={isLoading && !currentSession}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              isCollapsed={isSidebarCollapsed}
              onResize={handleSidebarResize}
              onToggleFullscreen={handleFullscreenToggle}
              isFullscreen={isFullscreen}
            />
          </div>
        </ErrorBoundary>
      )}

      {/* Mobile Sidebar Overlay - Shows on mobile or when toggled in fullscreen */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          {/* Sidebar */}
          <div className="relative">
            <ChatSidebar
              sessions={sessions || []}
              currentSessionId={currentSession?.id}
              onSelectSession={(sessionId) => {
                handleSelectSession(sessionId);
                setIsMobileSidebarOpen(false);
              }}
              onNewSession={() => {
                handleNewSession();
                setIsMobileSidebarOpen(false);
              }}
              onDeleteSession={handleDeleteSession}
              onShareSession={handleShareSession}
              isLoading={isLoading && !currentSession}
              onToggleFullscreen={handleFullscreenToggle}
              isFullscreen={isFullscreen}
            />
            {/* Hide Sidebar Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg z-20"
              title="Hide sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Sidebar Overlay - Shows when navbar button is clicked in fullscreen */}
      {isFullscreen && isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          {/* Sidebar */}
          <div className="relative">
            <ChatSidebar
              sessions={sessions || []}
              currentSessionId={currentSession?.id}
              onSelectSession={(sessionId) => {
                handleSelectSession(sessionId);
                setIsMobileSidebarOpen(false);
              }}
              onNewSession={() => {
                handleNewSession();
                setIsMobileSidebarOpen(false);
              }}
              onDeleteSession={handleDeleteSession}
              onShareSession={handleShareSession}
              isLoading={isLoading && !currentSession}
              onToggleFullscreen={handleFullscreenToggle}
              isFullscreen={isFullscreen}
            />
            {/* Hide Sidebar Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg z-20"
              title="Hide navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Area - Responsive with sidebar spacing */}
      <div 
        className={`flex-1 flex flex-col bg-gradient-to-b from-white/80 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 shadow-sm border-l border-indigo-100/40 dark:border-slate-700 relative h-full ${isFullscreen ? '' : 'lg:transition-all lg:duration-300'}`}
        style={{ 
          marginLeft: isFullscreen ? 0 : isSidebarCollapsed ? '64px' : `${sidebarWidth}px`,
          height: '100vh'
        }}
      >

        {/* Professional Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mx-8 mt-6 rounded-r-lg shadow-sm">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-red-800 font-semibold mb-1">Error</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-100 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden h-full min-h-0">
          <MessageList
            messages={currentSession?.messages || []}
            isTyping={isTyping}
            isLoading={isLoading && !!currentSession}
            onEditMessage={handleEditMessage}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Professional Message Input */}
        <div className="bg-white dark:bg-gray-800">
          <MessageInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isTyping={isTyping}
            placeholder={
              currentSession 
                ? "Continue your conversation with your AI career mentor..." 
                : "Ask your AI career mentor anything about your professional journey..."
            }
          />
        </div>
      </div>

      {/* Branch Navigator Modal */}
      {showBranchNavigator && currentSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <GitBranch className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Conversation Branches</h2>
              </div>
              <button
                onClick={closeBranchNavigator}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <BranchNavigator
              branches={branches}
              currentBranchId={currentBranchId}
              onSelectBranch={switchBranch}
              onCreateBranch={createBranch}
              onRenameBranch={renameBranch}
              onDeleteBranch={deleteBranch}
            />
          </div>
        </div>
      )}

      {/* Share Dialog */}
      <ShareDialog
        isOpen={showShareDialog}
        onClose={closeShareDialog}
        session={currentSession}
        onShare={(options) => shareSession(currentSession?.id || '', options)}
      />
    </div>
  );
};

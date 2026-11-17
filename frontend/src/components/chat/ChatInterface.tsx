import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatSidebar } from './ChatSidebar';
import BranchNavigator from './BranchNavigator';
import ShareDialog from './ShareDialog';
import { useChatStore } from '@/store/chat';
import { useAuthStore } from '@/store/auth';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { apiClient } from '@/lib/api-client';
import { 
  AlertCircle, 
  Shield, 
  X, 
  GitBranch, 
  PanelLeft 
} from 'lucide-react';

interface ChatResponse {
  sessionId: string;
  reply: string;
  timestamp: string;
  messageCount: number;
}

export const ChatInterface: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(() => location.pathname.startsWith('/app/chat'));
  const [sidebarWidth, setSidebarWidth] = useState(280);
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

  // Load user sessions on mount and ensure clean initial state
  useEffect(() => {
    if (user?.id) {
      const timer = setTimeout(() => {
        loadSessions();
        if (currentSession) {
          useChatStore.setState({ currentSession: null });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  // Keyboard shortcut for sidebar toggle (Ctrl+Shift+S)
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setIsSidebarCollapsed(!isSidebarCollapsed);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isSidebarCollapsed]);

  // Load message reactions when session changes (skip temporary local session IDs)
  useEffect(() => {
    if (currentSession?.id && !currentSession.id.startsWith('temp-')) {
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

  const handleSendMessage = async (message: string, files?: File[]) => {
    if (!currentSession && !files?.length) {
      await createNewSession(message);
      return;
    }

    if (files && files.length > 0) {
      await sendMessageWithFiles(message, files);
    } else {
      await sendMessage(message);
    }
  };

  const handleNewSession = useCallback(async () => {
    useChatStore.setState({
      currentSession: null,
      isLoading: false,
      isTyping: false,
      error: null
    });

    await new Promise(resolve => setTimeout(resolve, 50));
    await createNewSession();
  }, [createNewSession]);

  const handleSidebarResize = (width: number) => {
    setSidebarWidth(width);
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!currentSession) return;

    const messageIndex = currentSession.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    const messagesBeforeEdit = currentSession.messages.slice(0, messageIndex);
    const updatedUserMessage = {
      ...currentSession.messages[messageIndex],
      content: newContent,
      timestamp: new Date().toISOString()
    };

    const updatedSession = {
      ...currentSession,
      messages: [...messagesBeforeEdit, updatedUserMessage]
    };

    useChatStore.setState({ currentSession: updatedSession });
    useChatStore.setState({ isLoading: true, isTyping: true, error: null });

    try {
      const response = await apiClient.post<ChatResponse>('/chat', {
        message: newContent,
      });

      if (response.status === 'success' && response.data) {
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
      useChatStore.setState({
        isLoading: false,
        isTyping: false,
        error: 'Failed to get AI response'
      });
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    if (sessionId !== currentSession?.id) {
      useChatStore.setState({ currentSession: null });
      await loadSession(sessionId);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    const sessionToDelete = sessions.find(s => s.id === sessionId);
    const sessionTitle = sessionToDelete?.title || 'this session';
    const confirmed = window.confirm(`Are you sure you want to delete "${sessionTitle}"?`);

    if (!confirmed) return;

    try {
      await deleteSession(sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleShareSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      openShareDialog();
    }
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center bg-[#090b10] text-white">
        <div className="text-center max-w-md mx-auto p-8 rounded-2xl bg-[#11141e] border border-white/10 shadow-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-cyan-500/10">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Authentication Required
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Please log in to access your personalized CareerForge AI mentor and chat history.
          </p>
        </div>
      </div>
    );
  }

  const hasMessages = currentSession && currentSession.messages && currentSession.messages.length > 0;

  return (
    <div className="h-full bg-[#090b10] text-zinc-100 relative overflow-hidden flex">
      {/* Desktop Chat Sidebar */}
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

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10">
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
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg z-20"
              title="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div
        className="flex-1 flex flex-col h-full bg-[#090b10] relative transition-all duration-300"
        style={{
          marginLeft: !isSidebarCollapsed ? `${sidebarWidth}px` : '64px',
          height: '100vh'
        }}
      >
        {/* Mobile Sidebar Toggle Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden absolute top-3 left-3 z-30 p-2 text-zinc-400 hover:text-white bg-[#11141e]/90 hover:bg-[#1a2030] border border-white/10 rounded-xl transition-colors shadow-lg"
          title="Open menu"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Error Alert Display */}
        {error && (
          <div className="bg-red-950/40 border border-red-500/30 p-3 mx-6 mt-3 rounded-xl shadow-lg flex items-center justify-between text-xs text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-white px-2 py-1 rounded hover:bg-white/5"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-hidden h-full min-h-0 relative">
          <MessageList
            messages={currentSession?.messages || []}
            isTyping={isTyping}
            isLoading={isLoading && !!currentSession}
            onEditMessage={handleEditMessage}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Pinned Bottom Input Dock - Only shown when in active conversation */}
        {hasMessages && (
          <div className="border-t border-white/[0.06] bg-[#090b10]/95 backdrop-blur-2xl">
            <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-3">
              <MessageInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                isTyping={isTyping}
                placeholder="Reply to CareerForge AI..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Branch Navigator Modal */}
      {showBranchNavigator && currentSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative bg-[#11141f] border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden text-white">
            <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <GitBranch className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-semibold text-white">Conversation Branches</h2>
              </div>
              <button
                onClick={closeBranchNavigator}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
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

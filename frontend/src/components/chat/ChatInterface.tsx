import React, { useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatSidebar } from './ChatSidebar';
import { useChatStore } from '@/store/chat';
import { useAuthStore } from '@/store/auth';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

export const ChatInterface: React.FC = () => {
  const { user } = useAuthStore();
  const {
    currentSession,
    sessions,
    isLoading,
    isTyping,
    error,
    sendMessage,
    loadSessions,
    createNewSession,
    loadSession,
    endSession,
    clearError,
  } = useChatStore();

  // Load user sessions on mount
  useEffect(() => {
    if (user?.id) {
      loadSessions();
    }
  }, [user?.id, loadSessions]);

  const handleSendMessage = async (message: string) => {
    if (!currentSession) {
      // Create new session with the user's message
      await createNewSession(message);
      return;
    }
    
    await sendMessage(message);
  };

  const handleNewSession = async () => {
    await createNewSession();
  };

  const handleSelectSession = async (sessionId: string) => {
    if (sessionId !== currentSession?.id) {
      await loadSession(sessionId);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    // End the session
    await endSession(sessionId);
    
    // If it was the current session, clear it
    if (sessionId === currentSession?.id) {
      // Could implement logic to select another session or clear current
    }
    
    // Reload sessions to update the list
    await loadSessions();
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600">
            Please log in to access the chat interface.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white">
      {/* Sidebar */}
      <ErrorBoundary>
        <ChatSidebar
          sessions={sessions || []}
          currentSessionId={currentSession?.id}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          isLoading={isLoading && !currentSession}
        />
      </ErrorBoundary>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentSession?.title || 'CareerForge AI Chat'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>AI Assistant Online</span>
                </div>
                {currentSession && (
                  <span className="text-sm text-gray-400">
                    • {currentSession.messages.length} messages
                  </span>
                )}
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {navigator.onLine ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm">Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600 text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <MessageList
          messages={currentSession?.messages || []}
          isTyping={isTyping}
          isLoading={isLoading && !!currentSession}
        />

        {/* Message Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={!navigator.onLine}
          placeholder={
            currentSession 
              ? "Continue your conversation..." 
              : "Start a new conversation about your career..."
          }
        />
      </div>
    </div>
  );
};

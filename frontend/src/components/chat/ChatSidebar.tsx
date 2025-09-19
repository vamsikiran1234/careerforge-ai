import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Plus, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ChatSession } from '@/store/chat';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession?: (sessionId: string) => void;
  isLoading?: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isLoading = false,
}) => {
  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Chat Sessions
          </h2>
          <Button
            onClick={onNewSession}
            disabled={isLoading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading sessions...</p>
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <div className="p-4 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-2">No chat sessions yet</p>
            <p className="text-xs text-gray-400">
              Start a new conversation to get career guidance
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={session.id === currentSessionId}
                onClick={() => onSelectSession(session.id)}
                onDelete={onDeleteSession}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="text-xs text-gray-500 text-center">
          💡 All your conversations are saved automatically
        </div>
      </div>
    </div>
  );
};

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onClick: () => void;
  onDelete?: (sessionId: string) => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  onClick,
  onDelete,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  
  // Safe access to messages with fallback
  const messages = session?.messages || [];
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const preview = lastMessage?.content?.slice(0, 60) + 
    (lastMessage?.content && lastMessage.content.length > 60 ? '...' : '') || 'No messages yet';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showDeleteConfirm) {
      onDelete?.(session.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      // Auto-cancel after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-3 rounded-lg cursor-pointer transition-all duration-200 group relative
        ${isActive 
          ? 'bg-blue-100 border border-blue-200' 
          : 'hover:bg-white hover:shadow-sm border border-transparent'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Session title */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`
              text-sm font-medium truncate
              ${isActive ? 'text-blue-900' : 'text-gray-900'}
            `}>
              {session?.title || 'Untitled Session'}
            </h3>
            {session?.endedAt && (
              <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
            )}
          </div>

          {/* Message preview */}
          <p className={`
            text-xs truncate
            ${isActive ? 'text-blue-700' : 'text-gray-600'}
          `}>
            {preview}
          </p>

          {/* Time and message count */}
          <div className="flex items-center justify-between mt-2">
            <span className={`
              text-xs
              ${isActive ? 'text-blue-600' : 'text-gray-500'}
            `}>
              {session?.updatedAt ? formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true }) : 'Unknown time'}
            </span>
            <span className={`
              text-xs
              ${isActive ? 'text-blue-600' : 'text-gray-500'}
            `}>
              {messages.length} messages
            </span>
          </div>
        </div>

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={handleDelete}
            className={`
              ml-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity
              hover:bg-red-100 text-red-600 flex-shrink-0
              ${showDeleteConfirm ? 'opacity-100 bg-red-100' : ''}
            `}
            title={showDeleteConfirm ? 'Click again to confirm delete' : 'Delete session'}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
          <span className="text-xs text-red-700 font-medium">
            Click delete again to confirm
          </span>
        </div>
      )}
    </div>
  );
};

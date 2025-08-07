import React, { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import { LoadingDots } from '@/components/ui/Loading';
import type { ChatMessage } from '@/store/chat';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  isLoading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isTyping = false, 
  isLoading = false 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <LoadingDots size="lg" />
          <p className="text-gray-500 mt-2">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Welcome to CareerForge AI
          </h3>
          <p className="text-gray-600 mb-4">
            I'm here to help you with your career journey. Ask me about career paths, skill development, interview preparation, or any career-related questions.
          </p>
          <div className="text-sm text-gray-500">
            <p className="mb-1">💡 Try asking:</p>
            <ul className="text-left space-y-1">
              <li>• "What skills do I need for data science?"</li>
              <li>• "How do I transition to frontend development?"</li>
              <li>• "What's the job market like for AI engineers?"</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-1">
        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            isLast={index === messages.length - 1 && !isTyping}
          />
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-4 p-4 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <div className="max-w-[70%]">
              <div className="bg-gray-100 text-gray-900 border border-gray-200 rounded-lg px-4 py-3">
                <LoadingDots size="sm" />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                CareerForge AI is typing...
              </div>
            </div>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

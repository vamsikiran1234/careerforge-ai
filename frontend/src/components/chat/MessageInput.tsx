import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading = false,
  disabled = false,
  placeholder = "Ask me about your career...",
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading || disabled) return;

    onSendMessage(trimmedMessage);
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isDisabled = disabled || isLoading;
  const canSend = message.trim().length > 0 && !isDisabled;

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-4">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            rows={1}
            className={`
              w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              resize-none overflow-hidden min-h-[48px] max-h-32
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${isDisabled ? 'opacity-50' : ''}
            `}
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db transparent'
            }}
          />
          
          {/* Character count (optional) */}
          {message.length > 0 && (
            <div className="absolute bottom-1 right-2 text-xs text-gray-400">
              {message.length}/1000
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={!canSend}
          size="lg"
          className={`
            min-w-[48px] h-12 px-3 flex items-center justify-center
            transition-all duration-200
            ${canSend 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </form>

      {/* Quick suggestions */}
      {message.length === 0 && !isLoading && (
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "What skills do I need for data science?",
            "How to transition to frontend development?",
            "Best practices for technical interviews?",
            "Career growth in AI/ML field"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setMessage(suggestion)}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200 border border-gray-300"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Help text */}
      <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
        <span>Press Enter to send, Shift+Enter for new line</span>
        {isLoading && <span>AI is thinking...</span>}
      </div>
    </div>
  );
};

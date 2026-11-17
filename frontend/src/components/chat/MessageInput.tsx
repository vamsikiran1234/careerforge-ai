import React, { useState, useRef, useCallback } from 'react';
import { Send, Mic, Paperclip, X, Sparkles } from 'lucide-react';
import SlashCommandDropdown from './SlashCommandDropdown';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import type { SlashCommand } from '@/data/slashCommands';

interface MessageInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  isLoading?: boolean;
  isTyping?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading = false,
  isTyping = false,
  placeholder = "Ask CareerForge AI anything...",
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Slash command state
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [slashCommandQuery, setSlashCommandQuery] = useState('');
  const [slashCommandPosition, setSlashCommandPosition] = useState({ top: 0, left: 0 });
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = useCallback(() => {
    const trimmedMessage = message.trim();
    if ((trimmedMessage || uploadedFiles.length > 0) && !isLoading) {
      onSendMessage(trimmedMessage || "Please analyze these files", uploadedFiles);
      setMessage('');
      setUploadedFiles([]);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [message, uploadedFiles, onSendMessage, isLoading]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (showSlashCommands) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashCommands(false);
        setSlashCommandQuery('');
        return;
      }
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex(prev => Math.min(prev + 1, 9));
        return;
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex(prev => Math.max(prev - 1, 0));
        return;
      }
      
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showSlashCommands) {
        setShowSlashCommands(false);
      } else {
        handleSendMessage();
      }
    }
  }, [handleSendMessage, showSlashCommands]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }

    // Slash command detection
    const lastSlashIndex = value.lastIndexOf('/');
    if (lastSlashIndex !== -1 && lastSlashIndex === value.length - 1) {
      setShowSlashCommands(true);
      setSlashCommandQuery('');
      if (textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect();
        setSlashCommandPosition({
          top: rect.top - 200,
          left: rect.left,
        });
      }
    } else if (showSlashCommands) {
      const match = value.match(/\/(\w*)$/);
      if (match) {
        setSlashCommandQuery(match[1]);
      } else {
        setShowSlashCommands(false);
      }
    }
  };

  const handleSlashCommandSelect = (command: SlashCommand) => {
    const textWithoutSlash = message.replace(/\/(\w*)$/, '');
    setMessage(textWithoutSlash + command.command + ' ');
    setShowSlashCommands(false);
    textareaRef.current?.focus();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleTranscript = useCallback((text: string) => {
    setMessage(prev => {
      const cleanPrev = prev.trim();
      return cleanPrev ? `${cleanPrev} ${text}` : text;
    });
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
      textareaRef.current.focus();
    }
  }, []);

  const {
    isListening,
    toggleListening,
    error: voiceError
  } = useVoiceRecognition({
    onTranscript: handleTranscript
  });

  return (
    <div className="w-full">
      {/* Uploaded Files Display */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#181d2c] border border-white/10 text-xs text-zinc-300">
              <Paperclip className="w-3 h-3 text-cyan-400" />
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button onClick={() => removeFile(index)} className="text-zinc-500 hover:text-red-400 ml-1">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Input Box (Grok / Claude Dark Pill Style) */}
      <div className={`relative flex flex-col rounded-2xl border transition-all duration-200 shadow-2xl bg-[#11141e]/95 backdrop-blur-2xl ${
        isFocused 
          ? 'border-cyan-500/50 ring-1 ring-cyan-500/25 shadow-cyan-500/5' 
          : 'border-white/[0.12] hover:border-white/20'
      }`}>
        {/* Text Input Row */}
        <div className="flex items-end gap-2.5 px-3.5 pt-3 pb-2">
          {/* AI Status / Avatar Icon */}
          <div className="flex-shrink-0 mb-1">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              isTyping ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/[0.06] text-zinc-400'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Text Area */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isTyping ? "CareerForge AI is thinking..." : placeholder}
              disabled={isLoading || isTyping}
              className="w-full resize-none bg-transparent border-0 outline-none text-zinc-100 placeholder-zinc-500 text-xs sm:text-sm leading-5 sm:leading-6 min-h-[22px] max-h-[160px] disabled:opacity-50"
              rows={1}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0 mb-0.5">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors"
              title="Attach document or resume"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={isLoading || isTyping}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                isListening 
                  ? 'text-red-400 bg-red-500/20 ring-1 ring-red-500/40 animate-pulse' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
              }`}
              title={isListening ? "Listening... Click to finish speaking" : "Voice input (Speak now)"}
            >
              <Mic className={`w-4 h-4 ${isListening ? 'text-red-400 animate-bounce' : ''}`} />
            </button>

            {/* Glowing Send Button */}
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={(!message.trim() && uploadedFiles.length === 0) || isLoading || isTyping}
              className={`p-2 rounded-xl font-semibold transition-all duration-200 shadow-md ${
                (message.trim() || uploadedFiles.length > 0) && !isLoading && !isTyping
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25 hover:scale-105 active:scale-95'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/[0.04]'
              }`}
              title="Send message"
            >
              {isLoading || isTyping ? (
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Voice Error Notice */}
      {voiceError && (
        <p className="text-[11px] text-amber-400 mt-2 px-1 flex items-center gap-1.5">
          <span>⚠️</span>
          <span>{voiceError}</span>
        </p>
      )}

      {/* Slash Command Dropdown */}
      <SlashCommandDropdown
        isOpen={showSlashCommands}
        query={slashCommandQuery}
        position={slashCommandPosition}
        onSelectCommand={handleSlashCommandSelect}
        selectedIndex={selectedCommandIndex}
      />
    </div>
  );
};

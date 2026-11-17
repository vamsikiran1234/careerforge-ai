import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MessageItem } from './MessageItem';
import { 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Paperclip, 
  Mic,
  FileText,
  Target,
  Compass,
  Zap,
  X 
} from 'lucide-react';
import { CareerForgeAvatar } from '@/components/ui/CareerForgeAvatar';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import type { ChatMessage } from '@/store/chat';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  isLoading?: boolean;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onSendMessage?: (content: string, files?: File[]) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isTyping = false, 
  isLoading = false,
  onEditMessage,
  onSendMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Centerpiece prompt box state (for Welcome state)
  const [welcomePrompt, setWelcomePrompt] = useState('');
  const [welcomeFiles, setWelcomeFiles] = useState<File[]>([]);
  const welcomeFileInputRef = useRef<HTMLInputElement>(null);
  const welcomeTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTranscript = useCallback((text: string) => {
    setWelcomePrompt(prev => {
      const cleanPrev = prev.trim();
      return cleanPrev ? `${cleanPrev} ${text}` : text;
    });
    welcomeTextareaRef.current?.focus();
  }, []);

  const {
    isListening,
    toggleListening,
    error: voiceError
  } = useVoiceRecognition({
    onTranscript: handleTranscript
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Handle scroll position to show/hide scroll buttons
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;
      const isNearTop = scrollTop <= 50;
      const hasScrollableContent = scrollHeight > clientHeight + 100;
      
      setShowScrollToBottom(!isNearBottom && hasScrollableContent);
      setShowScrollToTop(!isNearTop && hasScrollableContent);
    };

    container.addEventListener('scroll', handleScroll);
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(container);
    setTimeout(handleScroll, 100);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [messages.length, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWelcomeSend = useCallback(() => {
    const text = welcomePrompt.trim();
    if ((text || welcomeFiles.length > 0) && onSendMessage) {
      onSendMessage(text || "Please analyze these files and guide my career progression.", welcomeFiles);
      setWelcomePrompt('');
      setWelcomeFiles([]);
    }
  }, [welcomePrompt, welcomeFiles, onSendMessage]);

  const handleWelcomeKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleWelcomeSend();
    }
  };

  const handleWelcomeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setWelcomeFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeWelcomeFile = (index: number) => {
    setWelcomeFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Suggestion prompt cards below input box
  const starterSuggestions = [
    {
      title: 'Resume Review',
      description: 'Audit my resume for ATS keywords, measurable impact, and executive phrasing.',
      icon: FileText,
      prompt: 'Please audit my resume: evaluate its ATS friendliness, highlight weak action verbs, and suggest impactful bullet points with metrics.'
    },
    {
      title: 'Career Roadmap',
      description: 'Map out a strategic promotion roadmap with realistic milestones.',
      icon: Compass,
      prompt: 'Help me plan a 2-year promotion roadmap for my role with high-impact milestones, key metrics, and strategic visibility initiatives.'
    },
    {
      title: 'Skill Gap Analysis',
      description: 'Identify high-leverage technical and leadership gaps in my stack.',
      icon: Target,
      prompt: 'Analyze my current skills and identify the top 5 high-leverage technical and leadership capabilities I should master this quarter.'
    },
    {
      title: 'Interview Practice',
      description: 'Simulate a mock behavioral interview using the STAR method.',
      icon: Zap,
      prompt: 'Conduct a simulated behavioral and technical interview with me. Ask one challenging question at a time and critique my answer with the STAR method.'
    }
  ];

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#090b10]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-cyan-400">Booting CareerForge AI...</p>
        </div>
      </div>
    );
  }

  // WELCOME / EMPTY STATE SCREEN
  if (messages.length === 0) {
    return (
      <div className="flex-1 h-full overflow-y-auto custom-scrollbar flex flex-col items-center justify-center px-4 sm:px-6 py-8 relative bg-[#090b10] select-none">
        {/* Ambient Neon Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[300px] bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-2xl mx-auto my-auto py-4 flex flex-col items-center relative z-10">
          {/* Glowing Emblem */}
          <div className="relative mb-4 group cursor-pointer">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500"></div>
            <CareerForgeAvatar size="lg" showGradient={true} className="relative w-14 h-14 rounded-2xl border border-white/20 shadow-2xl" />
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2 text-center">
            Welcome to <span className="bg-gradient-to-r from-white via-zinc-200 to-cyan-300 bg-clip-text text-transparent">CareerForge AI</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md text-center leading-relaxed mb-6">
            Your elite AI career mentor. Ask anything to analyze your resume, prepare for interviews, or navigate your next career move.
          </p>

          {/* Centerpiece Prompt Card */}
          <div className="w-full bg-[#11141e]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl p-4 shadow-2xl shadow-black/80 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all duration-200 mb-6">
            {/* File Previews */}
            {welcomeFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {welcomeFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#181d2c] border border-white/10 text-xs text-zinc-300">
                    <Paperclip className="w-3 h-3 text-cyan-400" />
                    <span className="truncate max-w-[140px]">{f.name}</span>
                    <button onClick={() => removeWelcomeFile(i)} className="text-zinc-500 hover:text-red-400 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Textarea */}
            <textarea
              ref={welcomeTextareaRef}
              value={welcomePrompt}
              onChange={(e) => setWelcomePrompt(e.target.value)}
              onKeyDown={handleWelcomeKeyDown}
              placeholder="Ask CareerForge AI anything about your career, resume, interviews..."
              className="w-full resize-none bg-transparent border-0 outline-none text-zinc-100 placeholder-zinc-500 text-sm leading-6 min-h-[56px] max-h-[160px]"
              rows={2}
            />

            {/* Bottom Controls Row inside the Card */}
            <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06] mt-2">
              <div className="flex items-center gap-2">
                {/* File Attachment Button */}
                <button
                  type="button"
                  onClick={() => welcomeFileInputRef.current?.click()}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors flex items-center gap-1.5 text-xs"
                  title="Attach resume or documents"
                >
                  <Paperclip className="w-4 h-4 text-zinc-400" />
                  <span className="text-[11px] text-zinc-400 hidden sm:inline">Attach</span>
                </button>
                <input
                  ref={welcomeFileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,image/*"
                  onChange={handleWelcomeFileUpload}
                  className="hidden"
                />

                {/* Voice / Microphone Input Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 text-xs ${
                    isListening 
                      ? 'text-red-400 bg-red-500/20 ring-1 ring-red-500/40 animate-pulse' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                  title={isListening ? "Listening... Click to finish speaking" : "Voice input (Speak now)"}
                >
                  <Mic className={`w-4 h-4 ${isListening ? 'text-red-400 animate-bounce' : ''}`} />
                  <span className={`text-[11px] hidden sm:inline ${isListening ? 'text-red-300 font-medium' : ''}`}>
                    {isListening ? "Listening..." : "Voice"}
                  </span>
                </button>
              </div>

              {/* Glowing Send Button */}
              <button
                type="button"
                onClick={handleWelcomeSend}
                disabled={!welcomePrompt.trim() && welcomeFiles.length === 0}
                className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-md ${
                  welcomePrompt.trim() || welcomeFiles.length > 0
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/30 hover:scale-105 active:scale-95'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/[0.04]'
                }`}
                title="Send message"
              >
                <span className="hidden sm:inline">Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Voice Error Notice */}
            {voiceError && (
              <p className="text-[11px] text-amber-400 mt-2 px-1 flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{voiceError}</span>
              </p>
            )}
          </div>

          {/* 4 Clean Starter Suggestion Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
            {starterSuggestions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setWelcomePrompt(item.prompt);
                    welcomeTextareaRef.current?.focus();
                  }}
                  className="p-3 rounded-xl bg-[#11141e]/70 hover:bg-[#151926] border border-white/[0.06] hover:border-cyan-500/30 text-left transition-all group flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-medium text-zinc-200 group-hover:text-cyan-300 transition-colors truncate">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-zinc-500 leading-snug line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE MESSAGES STREAM
  return (
    <div className="flex-1 relative overflow-hidden h-full bg-[#090b10]">
      <div 
        ref={scrollContainerRef}
        className="h-full overflow-y-auto scroll-smooth custom-scrollbar px-4 sm:px-6"
      >
        <div className="space-y-4 py-6 pb-24 min-h-full max-w-3xl mx-auto">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onEdit={onEditMessage}
            />
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="py-4 px-4 bg-[#11141f]/70 border border-white/[0.06] rounded-2xl max-w-3xl mx-auto animate-pulse">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <CareerForgeAvatar size="xs" showGradient={true} className="w-7 h-7 rounded-lg" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white">CareerForge AI</span>
                  <span className="text-[11px] font-mono text-cyan-400">formulating strategic insights...</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to top button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed top-20 right-6 bg-[#161a26]/90 border border-white/10 text-white rounded-full p-2.5 shadow-xl hover:bg-[#1e2334] transition-all z-40 backdrop-blur-md"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-4 h-4 text-cyan-400" />
        </button>
      )}

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full p-2.5 shadow-xl transition-all z-40 shadow-cyan-500/20"
          aria-label="Scroll to bottom"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

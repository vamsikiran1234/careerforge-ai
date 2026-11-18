import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Plus, 
  ChevronDown, 
  Maximize2, 
  Minimize2, 
  Bot, 
  Copy, 
  Check, 
  ArrowRight,
  History,
  MessageSquare
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useChatStore } from '@/store/chat';
import { useAuthStore } from '@/store/auth';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { cn } from '@/utils';

const SUGGESTED_PROMPTS = [
  {
    icon: '☕',
    label: 'Java Full-Stack Projects',
    prompt: 'I want project ideas on Java Full Stack with Spring Boot and React that have less implementation complexity but high real-world impact to solve real problems.'
  },
  {
    icon: '🚀',
    label: 'AI Engineer Roadmap',
    prompt: 'Can you give me a comprehensive 5-phase career roadmap to become an AI Engineer as a fresher?'
  },
  {
    icon: '⚡',
    label: 'Production RAG Architecture',
    prompt: 'Explain the 5-stage production RAG architecture with vector databases, hybrid search (BM25 + Dense), and cross-encoder reranking.'
  },
  {
    icon: '🎯',
    label: 'Technical Interview Prep',
    prompt: 'What are the most critical system design and algorithm topics to prepare for technical interviews?'
  }
];

export const FloatingAIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { user } = useAuthStore();
  const { 
    currentSession, 
    sessions,
    isLoading, 
    isTyping, 
    sendMessage, 
    createNewSession, 
    loadSessions,
    loadSession
  } = useChatStore();

  // Listen for custom trigger events from top navbar or anywhere in the app
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    const handleToggleChat = () => setIsOpen(prev => !prev);

    window.addEventListener('open-ai-chat', handleOpenChat);
    window.addEventListener('toggle-ai-chat', handleToggleChat);

    return () => {
      window.removeEventListener('open-ai-chat', handleOpenChat);
      window.removeEventListener('toggle-ai-chat', handleToggleChat);
    };
  }, []);

  // Load chat sessions on mount and select the latest session if available
  useEffect(() => {
    loadSessions().then(() => {
      const state = useChatStore.getState();
      if (!state.currentSession && state.sessions.length > 0) {
        state.loadSession(state.sessions[0].id);
      }
    });
  }, [loadSessions]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentSession?.messages, isTyping, isOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  const handleSend = async (textToSend?: string) => {
    const message = (textToSend || inputMessage).trim();
    if (!message || isLoading || isTyping) return;

    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      if (!currentSession) {
        await createNewSession(message);
      } else {
        await sendMessage(message);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewChat = () => {
    createNewSession();
    setInputMessage('');
  };

  const messages = currentSession?.messages || [];

  return (
    <>
      {/* 1. Floating Action Button (FAB) at Bottom Right */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20"
          title="Chat with CareerForge AI"
          aria-label="Open AI Assistant"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-300"></span>
          </span>
          <Sparkles className="w-5 h-5 text-yellow-300 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-sm font-semibold tracking-wide pr-1">CareerForge AI</span>
        </button>
      )}

      {/* 2. Floating Chat Window / Modal Drawer */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-50 flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl transition-all duration-300 overflow-hidden',
            isExpanded
              ? 'inset-4 md:inset-10 rounded-2xl'
              : 'bottom-4 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] md:w-[440px] h-[640px] max-h-[85vh] rounded-2xl'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white border-b border-purple-600/40 select-none">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <Bot className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight">CareerForge AI</h3>
                  <span className="flex items-center gap-1 text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-purple-200/90 leading-tight">
                  Senior Technical Career Strategist
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={cn(
                  "p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors",
                  showHistory && "bg-white/20 text-white"
                )}
                title="View Chat History"
              >
                <History className="w-4 h-4" />
              </button>
              <button
                onClick={handleNewChat}
                className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
                title="Start New Conversation"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden md:block p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
                title={isExpanded ? 'Minimize Window' : 'Expand Window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
                title="Close Chat"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat History Dropdown / Panel */}
          {showHistory && (
            <div className="bg-purple-950/95 text-white border-b border-purple-800 p-3 max-h-56 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-purple-700">
              <div className="flex items-center justify-between text-[11px] font-semibold text-purple-300 uppercase tracking-wider px-1 mb-1">
                <span>Recent Conversations ({sessions.length})</span>
                <button
                  onClick={() => {
                    handleNewChat();
                    setShowHistory(false);
                  }}
                  className="flex items-center gap-1 text-purple-200 hover:text-white"
                >
                  <Plus className="w-3 h-3" />
                  <span>New</span>
                </button>
              </div>
              {sessions.length === 0 ? (
                <p className="text-xs text-purple-400 py-2 text-center">No previous conversations</p>
              ) : (
                sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      loadSession(s.id);
                      setShowHistory(false);
                    }}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-lg text-xs truncate flex items-center gap-2 transition-colors",
                      currentSession?.id === s.id
                        ? "bg-purple-800 text-white font-medium"
                        : "text-purple-200 hover:bg-purple-900/60"
                    )}
                  >
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" />
                    <span className="truncate">{s.title || 'Untitled Session'}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Active Session Indicator Bar */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-purple-50 dark:bg-gray-800/90 border-b border-gray-200/60 dark:border-gray-800 text-[11px] text-gray-600 dark:text-gray-400">
            <span className="truncate font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span className="truncate">{currentSession?.title || 'New Conversation'}</span>
            </span>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-purple-600 dark:text-purple-400 hover:underline flex-shrink-0 font-medium ml-2"
            >
              {showHistory ? 'Hide history' : 'Switch chat'}
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-gray-900/60 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center px-2 py-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  How can I help your career today?
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                  Ask for project ideas, system architecture, interview prep, or career transition roadmaps.
                </p>

                {/* Quick Starter Pills */}
                <div className="grid grid-cols-1 gap-2 w-full mt-6 text-left">
                  {SUGGESTED_PROMPTS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(item.prompt)}
                      className="group flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all text-xs"
                    >
                      <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-medium">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id || index}
                    className={cn(
                      'flex gap-2.5 max-w-[90%]',
                      isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        'w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold mt-1 shadow-sm',
                        isUser
                          ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                          : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                      )}
                    >
                      {isUser ? (user?.name ? user.name[0].toUpperCase() : 'U') : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={cn(
                        'relative group rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm',
                        isUser
                          ? 'bg-purple-600 text-white rounded-tr-none'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200/80 dark:border-gray-700/80 rounded-tl-none prose prose-xs dark:prose-invert max-w-none'
                      )}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="space-y-2">
                          <ReactMarkdown
                            components={{
                              code({ inline, className, children, ...props }: any) {
                                return !inline ? (
                                  <CodeBlock className={className}>
                                    {String(children).replace(/\n$/, '')}
                                  </CodeBlock>
                                ) : (
                                  <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded text-[11px] font-mono text-purple-600 dark:text-purple-400" {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>

                          {/* Copy Message Action */}
                          <button
                            onClick={() => handleCopy(msg.content, msg.id || String(index))}
                            className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 p-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                            title="Copy response"
                          >
                            {copiedId === (msg.id || String(index)) ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing Indicator */}
            {(isLoading || isTyping) && (
              <div className="flex gap-2.5 mr-auto">
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800/80 rounded-xl p-1.5 border border-gray-200 dark:border-gray-700 focus-within:border-purple-500 dark:focus-within:border-purple-500 transition-colors">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask CareerForge AI anything..."
                rows={1}
                disabled={isLoading || isTyping}
                className="flex-1 bg-transparent border-0 resize-none px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-0 max-h-28"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputMessage.trim() || isLoading || isTyping}
                className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                title="Send message (Enter)"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-gray-400 dark:text-gray-500">
              <span>Shift + Enter for new line</span>
              <span>CareerForge AI Engine</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

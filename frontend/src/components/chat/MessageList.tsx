import React, { useEffect, useRef, useState } from 'react';
import { MessageItem } from './MessageItem';
import { LoadingDots } from '@/components/ui/Loading';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CareerForgeAvatar } from '@/components/ui/CareerForgeAvatar';
import type { ChatMessage } from '@/store/chat';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  isLoading?: boolean;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onSendMessage?: (content: string) => void;
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
      
      // Show buttons when there's meaningful scroll distance
      const hasScrollableContent = scrollHeight > clientHeight + 100;
      
      setShowScrollToBottom(!isNearBottom && hasScrollableContent);
      setShowScrollToTop(!isNearTop && hasScrollableContent);
    };

    container.addEventListener('scroll', handleScroll);
    
    // Also check on resize
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(container);
    
    // Initial check with delay to ensure content is rendered
    setTimeout(handleScroll, 100);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [messages.length, isTyping]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-white/70 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Welcome Header */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 w-full min-h-0 pt-16">
          <div className="text-center mb-8">
            {/* CareerForge AI Logo */}
            <div className="inline-flex items-center justify-center w-24 h-24 mb-6">
              <CareerForgeAvatar size="lg" showGradient={true} />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Hi there! 👋
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-200">
              How can I assist you today?
            </p>
          </div>

          {/* Feature Cards - Modern Canva-inspired design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl mx-auto mb-8">
            {/* Career Goals Card */}
            <div 
              onClick={() => onSendMessage?.("I want to set clear and achievable career goals for the next 2-3 years. Can you help me create a strategic career plan with specific milestones, timelines, and actionable steps to advance in my profession?")}
              className="group p-5 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-indigo-100 dark:border-slate-700 hover:shadow-lg hover:border-indigo-200 dark:hover:border-slate-600 transition-all duration-300 cursor-pointer hover:-translate-y-1 flex flex-col justify-between min-h-[140px]"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Set career goals</h3>
              <p className="text-xs text-gray-600 dark:text-gray-200 leading-relaxed">Plan your career path and set achievable milestones</p>
            </div>

            {/* Resume Review Card */}
            <div 
              onClick={() => onSendMessage?.("I would like you to review my resume and provide detailed feedback on how to improve it. Please analyze the content, format, keywords, and overall presentation to help me make it more compelling for potential employers in my target industry.")}
              className="group p-5 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-emerald-100 dark:border-slate-700 hover:shadow-lg hover:border-emerald-200 dark:hover:border-slate-600 transition-all duration-300 cursor-pointer hover:-translate-y-1 flex flex-col justify-between min-h-[140px]"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Resume review</h3>
              <p className="text-xs text-gray-600 dark:text-gray-200 leading-relaxed">Get expert feedback on your resume</p>
            </div>

            {/* Skill Gaps Card */}
            <div 
              onClick={() => onSendMessage?.("Please help me identify skill gaps in my current profession and recommend specific skills I should develop to stay competitive and advance in my career. I'd like to understand both technical and soft skills that are in high demand in my industry.")}
              className="group p-5 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-violet-100 dark:border-slate-700 hover:shadow-lg hover:border-violet-200 dark:hover:border-slate-600 transition-all duration-300 cursor-pointer hover:-translate-y-1 flex flex-col justify-between min-h-[140px]"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-violet-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Skill gaps</h3>
              <p className="text-xs text-gray-600 dark:text-gray-200 leading-relaxed">Identify skills you need to develop</p>
            </div>

            {/* Interview Prep Card */}
            <div 
              onClick={() => onSendMessage?.("I have upcoming job interviews and need comprehensive preparation. Can you help me prepare for common interview questions, develop compelling answers using the STAR method, and provide tips on how to make a strong impression during the interview process?")}
              className="group p-5 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-amber-100 dark:border-slate-700 hover:shadow-lg hover:border-amber-200 dark:hover:border-slate-600 transition-all duration-300 cursor-pointer hover:-translate-y-1 flex flex-col justify-between min-h-[140px]"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Interview prep</h3>
              <p className="text-xs text-gray-600 dark:text-gray-200 leading-relaxed">Practice and prepare for interviews</p>
            </div>
          </div>


        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden h-full">
      <div 
        ref={scrollContainerRef}
        className="h-full overflow-y-auto scroll-smooth custom-scrollbar px-4 md:px-6 lg:px-8"
        style={{ 
          maxHeight: 'calc(100vh - 140px)',
          paddingRight: '1.5rem' // Extra padding to prevent content from touching scrollbar
        }}
      >
        <div className="space-y-1 pb-2 min-h-full max-w-5xl mx-auto">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onEdit={onEditMessage}
            />
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="group py-6 px-4 bg-gray-50/50">
              <div className="max-w-4xl mx-auto flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm text-gray-900">CareerForge AI</span>
                    <span className="text-xs text-gray-500">typing...</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LoadingDots size="sm" />
                    <span className="text-sm text-gray-600 ml-2">Thinking about your career question...</span>
                  </div>
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
          className="fixed top-20 right-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full p-3 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 z-50 hover:scale-105 backdrop-blur-sm"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      )}

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 z-50 hover:scale-105 backdrop-blur-sm"
          aria-label="Scroll to bottom"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

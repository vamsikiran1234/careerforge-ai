import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  Copy,
  Download,
  Lock,
  Eye,
  Shield,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Calendar,
  User,
  Clock,
  Info,
  Home,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CareerForgeAvatar } from '@/components/ui/CareerForgeAvatar';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { MessageInput } from './MessageInput';
import { MessageItem } from './MessageItem';
import { apiClient } from '@/lib/api-client';
import type { SharedConversation } from '@/types/sharing';
import type { ChatMessage } from '@/store/chat';

interface MessageResponse {
  reply: string;
  timestamp: string;
  sessionId: string;
}

interface SharedConversationViewProps {
  onDownload?: (conversation: SharedConversation) => void;
}

const SharedConversationView: React.FC<SharedConversationViewProps> = ({
  onDownload,
}) => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const [conversation, setConversation] = useState<SharedConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);

  const [allowScroll, setAllowScroll] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Interactive chat state

  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (shareCode) {
      loadSharedConversation(shareCode);
    }
  }, [shareCode]);

  const loadSharedConversation = async (code: string, pwd?: string) => {
    console.log('=== LOAD SHARED CONVERSATION START ===');
    console.log('Share code:', code);
    console.log('Password provided:', !!pwd);
    setLoading(true);
    setError(null);
    
    try {
      console.log('Making API request to:', `/api/v1/share/${code}`);
      
      const headers: Record<string, string> = {};
      
      if (pwd) {
        headers['X-Share-Password'] = pwd;
      }

      const response = await apiClient.get<SharedConversation>(`/share/${code}`, {
        headers,
      });

      console.log('API Response:', response);
      console.log('API Response data:', response.data);

      // Check if password is required (from direct response or error handler)
      if (response.status === 'error' && 
          (response.message === 'Password required' || response.data?.requiresPassword)) {
        console.log('Password required');
        setNeedsPassword(true);
        setLoading(false);
        return;
      }

      if (response.status !== 'success') {
        console.log('API Response error:', response);
        throw new Error(response.message || 'Conversation not found or expired');
      }

      // Handle both wrapped and direct responses
      // The API returns {status: 'success', data: {conversation data}}
      const conversationData = response.data;
      console.log('Conversation data to set:', conversationData);
      console.log('Conversation data keys:', Object.keys(conversationData || {}));
      
      // Ensure messages array exists and log detailed info
      const messages = (conversationData?.messages || []).map((msg: any, idx: number) => ({
        ...msg,
        id: msg.id || idx.toString(),
      }));
      console.log('Messages array direct:', messages);
      console.log('Messages array length:', messages.length);
      console.log('Messages array type:', Array.isArray(messages));
      
      if (conversationData) {
        // Ensure the conversation data has properly formatted messages
        const formattedConversation = {
          ...conversationData,
          messages: Array.isArray(messages) ? messages : []
        };
        
        console.log('Setting conversation state with formatted data:', formattedConversation);
        console.log('Formatted messages count:', formattedConversation.messages.length);
        
        setConversation(formattedConversation);
        setMessages(formattedConversation.messages || []); // Set messages for interactive chat
        setAllowScroll(conversationData.allowScroll || false);
        setNeedsPassword(false);
        console.log('Conversation state set, disabling loading');
      } else {
        console.log('No conversation data received');
        throw new Error('No conversation data received');
      }
    } catch (err: any) {
      console.log('=== ERROR IN LOAD SHARED CONVERSATION ===');
      console.error('Error details:', err);
      console.error('Error response:', err.response);
      
      // Check if it's a 401 error with password requirement
      if (err.response?.status === 401 && err.response?.data?.data?.requiresPassword) {
        console.log('Password required (from error response)');
        setNeedsPassword(true);
        setLoading(false);
        return;
      }
      
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
      setLoading(false);
    } finally {
      console.log('=== LOAD SHARED CONVERSATION COMPLETE ===');
      setLoading(false);
    }
  };

  // Send message in shared conversation
  const handleSendMessage = async (message: string) => {
    if (!shareCode || !message.trim() || isSending) return;
    
    setIsSending(true);
    setIsTyping(true);
    
    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    try {
      // Prepare headers with password if set
      const headers: Record<string, string> = {};
      if (password) {
        headers['X-Share-Password'] = password;
      }

      // Send message to the shared conversation endpoint using apiClient
      const response = await apiClient.post<MessageResponse>(
        `/share/${shareCode}/message`, 
        {
          message: message.trim(),
        },
        { headers }
      );

      if (response.status === 'success' && response.data) {
        // Add AI response
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: (response.data as any).reply,
          timestamp: (response.data as any).timestamp,
        };
        
        setMessages([...updatedMessages, aiMessage]);
        
        // Update the conversation object if it exists
        if (conversation) {
          setConversation(prev => prev ? {
            ...prev,
            messages: [...updatedMessages, aiMessage]
          } : null);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the user message on error
      setMessages(messages);
      // Could add toast notification here
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shareCode && password) {
      loadSharedConversation(shareCode, password);
    }
  };

  const handleCopyConversation = async () => {
    if (!conversation || !conversation.messages) return;
    
    const text = conversation.messages
      .map(msg => `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`)
      .join('\n\n');
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy conversation:', error);
    }
  };

  const handleDownload = () => {
    if (!conversation || !conversation.messages) return;
    
    // Create downloadable content
    const content = `# ${conversation.title || 'Shared Conversation'}\n\n` +
      `**Shared by:** ${conversation.createdBy?.name || 'CareerForge AI User'}\n` +
      `**Date:** ${new Date(conversation.createdAt || Date.now()).toLocaleString()}\n` +
      `**Messages:** ${conversation.messages.length}\n\n---\n\n` +
      conversation.messages
        .map(msg => `**${msg.role === 'user' ? 'You' : 'AI Career Mentor'}** (${new Date(msg.timestamp).toLocaleTimeString()}):\n${msg.content}\n`)
        .join('\n---\n\n');
    
    // Create and download file
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(conversation.title || 'conversation').replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Call optional onDownload prop if provided
    if (onDownload) {
      onDownload(conversation);
    }
  };

  if (!shareCode) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 dark:border-blue-400 rounded-full animate-spin border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading shared conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500 dark:text-red-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Conversation Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error}
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Go to CareerForge AI
          </Button>
        </div>
      </div>
    );
  }

  if (needsPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border border-gray-200 dark:border-slate-700">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Password Required
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              This conversation is password protected
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg 
                         bg-white dark:bg-slate-900 text-gray-900 dark:text-white 
                         placeholder-gray-400 dark:placeholder-gray-500
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Access Conversation
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Show loading only if we're actually loading OR if we have an error OR if we need password
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading conversation...</p>
        </div>
      </div>
    );
  }

  // If we have conversation data, render it regardless of missing fields
  // Debug: Log conversation state when rendering
  console.log('=== RENDER CHECK ===');
  console.log('Conversation state:', conversation);
  console.log('Conversation messages:', conversation?.messages);
  console.log('Messages count:', conversation?.messages?.length);

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500 dark:text-red-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Conversation Data
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Unable to load conversation data.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Go to CareerForge AI
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Minimal Professional Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex-shrink-0`}>
        <div className="h-full flex flex-col p-4">
          {/* Sidebar Header - Conversation Title with Close Button */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex-1 pr-2">
                {conversation?.title || 'Shared Career Chat'}
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                title="Close sidebar"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 mb-4">
            {/* Theme Toggle Button */}
            <button
              onClick={() => {
                const themeToggle = document.querySelector('[data-theme-toggle]') as HTMLButtonElement;
                themeToggle?.click();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Sun className="w-4 h-4 dark:hidden" />
              <Moon className="w-4 h-4 hidden dark:block" />
              <span>Toggle theme</span>
            </button>

            {/* Open CareerForge AI Button */}
            <button
              onClick={() => window.location.href = '/'}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Open CareerForge AI</span>
            </button>
          </div>

          {/* Details Collapsible Button */}
          <button
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors mb-2"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span>Details</span>
            </div>
            {detailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Conversation Info - Collapsible */}
          {detailsOpen && (
          <div className="space-y-3 flex-1 overflow-y-auto mb-4">
            {/* Shared By */}
            <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Shared by</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {conversation?.createdBy?.name || 'CareerForge User'}
                </p>
              </div>
            </div>

            {/* Messages Count */}
            <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
              <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Messages</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                </p>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {conversation?.createdAt ? new Date(conversation.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Shared Date */}
            <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
              <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Shared on</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {conversation?.sharedAt ? new Date(conversation.sharedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* View Count */}
            <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Views</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {conversation?.viewCount || 0} {conversation?.viewCount === 1 ? 'view' : 'views'}
                </p>
              </div>
            </div>

            {/* Expiration */}
            {conversation?.expiresAt && (
              <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Expires</p>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    {new Date(conversation.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Sidebar Actions */}
          <div className="pt-4 border-t border-gray-200 dark:border-slate-700 space-y-2 mt-auto">
            <button
              onClick={handleCopyConversation}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                copied 
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy conversation'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download as Markdown</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Hidden ThemeToggle for sidebar button to trigger */}
        <div className="hidden">
          <ThemeToggle />
        </div>

        {/* Floating Sidebar Toggle Button - Only shown when sidebar is closed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors shadow-lg border border-gray-200 dark:border-slate-700"
            title="Open sidebar"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Main Chat Container */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 shadow-xl min-h-screen">

        {/* Messages Area - Match main interface */}
        <div className="flex-1 overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <div className="h-full overflow-y-auto px-4 lg:px-8" id="messages-container">
            <div className="max-w-4xl mx-auto py-6 space-y-6">
              {/* Welcome Screen - Show when no messages */}
              {messages.length === 0 && !isTyping && (
                <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
                  <div className="text-center max-w-3xl px-4">
                    {/* Avatar */}
                    <div className="mb-8">
                      <CareerForgeAvatar size="xl" className="mx-auto" />
                    </div>

                    {/* Welcome Message */}
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                      Hi there! 👋
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12">
                      How can I assist you today?
                    </p>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      {/* Set career goals */}
                      <button className="group p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 text-left">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                          Set career goals
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Plan your career path and set achievable milestones
                        </p>
                      </button>

                      {/* Resume review */}
                      <button className="group p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 text-left">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                          Resume review
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Get expert feedback on your resume
                        </p>
                      </button>

                      {/* Skill gaps */}
                      <button className="group p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 text-left">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                          Skill gaps
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Identify skills you need to develop
                        </p>
                      </button>

                      {/* Interview prep */}
                      <button className="group p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 text-left">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                          Interview prep
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Practice and prepare for interviews
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages List */}
              {messages.map((message, index) => (
                <MessageItem
                  key={message.id || index}
                  message={message}
                />
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                    <CareerForgeAvatar size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">AI Career Mentor</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">typing...</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Professional Message Input */}
        <div className="border-t border-gray-200 dark:border-slate-700 bg-gradient-to-r from-white to-gray-50 dark:from-slate-800 dark:to-slate-900">
          <div className="max-w-4xl mx-auto px-4 lg:px-8">
            <MessageInput
              onSendMessage={handleSendMessage}
              isLoading={isSending}
              placeholder="Continue your conversation with your AI career mentor..."
            />
          </div>
        </div>
        
        {/* Privacy Notice - Below input */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800/50 px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <span className="font-medium">Shared Career Conversation</span> - 
              This conversation was shared by {conversation.createdBy?.name || 'a CareerForge AI user'}. 
              All data is secured and shared with privacy controls.
            </p>
          </div>
        </div>
        
        {/* Scroll Controls - Show only if allowScroll is enabled */}
        {allowScroll && (
          <div className="fixed right-6 bottom-6 flex flex-col gap-2">
            <button
              onClick={() => {
                const container = document.getElementById('messages-container');
                if (container) {
                  container.scrollTop = Math.max(0, container.scrollTop - 300);
                }
              }}
              className="p-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full shadow-lg 
                       transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                       focus:ring-offset-2 hover:scale-110"
              title="Scroll Up"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const container = document.getElementById('messages-container');
                if (container) {
                  container.scrollTop = Math.min(
                    container.scrollHeight - container.clientHeight,
                    container.scrollTop + 300
                  );
                }
              }}
              className="p-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full shadow-lg 
                       transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                       focus:ring-offset-2 hover:scale-110"
              title="Scroll Down"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default SharedConversationView;
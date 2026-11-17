import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Share2, 
  Search, 
  PanelLeftClose, 
  PanelLeft,
  Sparkles, 
  Clock,
  Settings,
  LogOut,
  LayoutDashboard,
  ChevronRight
} from 'lucide-react';
import { CareerForgeAvatar } from '@/components/ui/CareerForgeAvatar';
import ExportDialog from './ExportDialog';
import TemplateSelector from './TemplateSelector';
import { useChatStore } from '@/store/chat';
import { useAuthStore } from '@/store/auth';
import type { ChatSession } from '@/store/chat';
import type { CareerTemplate } from '@/data/careerTemplates';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession?: (sessionId: string) => void;
  onShareSession?: (sessionId: string) => void;
  isLoading?: boolean;
  onToggleCollapse?: () => void;
  isCollapsed?: boolean;
  onResize?: (width: number) => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onShareSession,
  isLoading = false,
  onToggleCollapse,
  isCollapsed = false,
  onResize,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    showExportDialog,
    closeExportDialog,
    showTemplateSelector,
    closeTemplateSelector,
    createNewSession
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleTemplateSelect = async (template: CareerTemplate) => {
    await createNewSession(template.initialPrompt);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const diff = e.clientX - startX.current;
    const newWidth = Math.min(Math.max(startWidth.current + diff, 250), 450);
    setSidebarWidth(newWidth);
    onResize?.(newWidth);
  }, [isResizing, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Click outside to close profile popup
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredSessions = sessions.filter(session => {
    if (!searchQuery.trim()) return session.messages.length > 0;
    const q = searchQuery.toLowerCase();
    const titleMatch = (session.title || '').toLowerCase().includes(q);
    const contentMatch = session.messages.some(m => m.content.toLowerCase().includes(q));
    return titleMatch || contentMatch;
  });

  return (
    <aside
      className="chat-sidebar-fixed fixed top-0 left-0 h-screen overflow-hidden bg-[#0a0c12] text-zinc-200 border-r border-white/[0.08] flex flex-col z-50 select-none transition-all duration-300 ease-in-out"
      style={{ width: isCollapsed ? '64px' : `${sidebarWidth}px` }}
    >
      {/* Top Header / Brand with Single Professional Collapse/Expand Button */}
      <div className={`border-b border-white/[0.06] flex items-center justify-between ${isCollapsed ? 'p-3 justify-center' : 'px-4 py-3.5'}`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <CareerForgeAvatar size="sm" showGradient={true} className="w-8 h-8 rounded-lg shadow-md shadow-cyan-500/20" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 border-2 border-[#0a0c12] rounded-full animate-pulse"></span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-white tracking-tight truncate">
                    CareerForge AI
                  </h2>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-cyan-400">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                  <span>AI Career Mentor</span>
                </div>
              </div>
            </div>

            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors"
            title="Expand sidebar"
          >
            <PanelLeft className="w-5 h-5 text-zinc-300" />
          </button>
        )}
      </div>

      {/* Main Sidebar Scroll Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
        {!isCollapsed ? (
          <div className="p-3 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <div className="relative flex items-center bg-[#11141f] border border-white/[0.08] rounded-xl px-2.5 py-1.5 focus-within:border-cyan-500/40 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
                <Search className="w-3.5 h-3.5 text-zinc-500 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="bg-transparent text-xs text-zinc-200 placeholder-zinc-500 outline-none w-full"
                />
                {searchQuery ? (
                  <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-zinc-300 text-xs px-1">✕</button>
                ) : (
                  <span className="text-[10px] text-zinc-600 font-mono px-1 border border-white/5 rounded">⌘K</span>
                )}
              </div>
            </div>

            {/* Single Primary "New Conversation" Button */}
            <button
              onClick={onNewSession}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-200 rounded-xl font-medium text-xs flex items-center justify-between transition-all group shadow-sm shadow-cyan-500/5"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-90 transition-transform duration-200" />
                <span>New Conversation</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono group-hover:text-cyan-400">⌘N</span>
            </button>

            {/* Recent Chats Section */}
            <div className="pt-2">
              <div className="px-2 pb-2 flex items-center justify-between text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-zinc-600" />
                  <span>Recent Conversations</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-600">{filteredSessions.length}</span>
              </div>

              {isLoading && filteredSessions.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-500 flex flex-col items-center gap-2">
                  <div className="w-4 h-4 border-2 border-cyan-500/40 border-t-cyan-400 rounded-full animate-spin"></div>
                  <span>Loading conversations...</span>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="py-8 px-2 text-center text-xs text-zinc-500">
                  <p>No conversations yet</p>
                  <p className="text-[11px] text-zinc-600 mt-1">Start a new chat to begin</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredSessions.map((session) => {
                    const isSelected = session.id === currentSessionId;
                    return (
                      <div
                        key={session.id}
                        onClick={() => onSelectSession(session.id)}
                        className={`group relative px-2.5 py-2 rounded-xl cursor-pointer transition-all duration-150 flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#141824] border border-cyan-500/30 text-white shadow-sm shadow-cyan-500/10'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs truncate font-medium">
                              {session.title || 'Career Thread'}
                            </p>
                            {session.messages.length > 0 && (
                              <p className="text-[10px] truncate text-zinc-500 mt-0.5">
                                {session.messages[session.messages.length - 1]?.content || ''}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Hover Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5 flex-shrink-0">
                          {onShareSession && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onShareSession(session.id);
                              }}
                              className="p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-cyan-400 transition-colors"
                              title="Share thread"
                            >
                              <Share2 className="w-3 h-3" />
                            </button>
                          )}
                          {onDeleteSession && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.id);
                              }}
                              className="p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-red-400 transition-colors"
                              title="Delete thread"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Collapsed Icons Only */
          <div className="p-2 space-y-2 flex flex-col items-center">
            {filteredSessions.slice(0, 10).map((session) => {
              const isSelected = session.id === currentSessionId;
              return (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-[#151a26] border border-cyan-500/40 text-cyan-300'
                      : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05]'
                  }`}
                  title={session.title || 'Career Thread'}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Profile Popover Menu (Opens above Profile row) */}
      {isProfileMenuOpen && (
        <div
          ref={profileMenuRef}
          className="absolute bottom-16 left-2 right-2 bg-[#121522] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 backdrop-blur-2xl"
          style={{ minWidth: isCollapsed ? '230px' : 'auto' }}
        >
          {/* User Info Header */}
          <div className="p-2.5 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-sm font-bold uppercase shadow-sm">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-zinc-400 truncate">{user?.email || ''}</p>
                <span className="inline-block mt-1 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {(user?.roles && user.roles[0]) || 'Member'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-1 space-y-0.5">
            <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                navigate('/app/dashboard');
              }}
              className="w-full px-2.5 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] flex items-center justify-between transition-colors text-left group"
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-zinc-400 group-hover:text-cyan-400" />
                <span>Career Dashboard</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
            </button>

            <button
              onClick={() => {
                setIsProfileMenuOpen(false);
                navigate('/app/settings');
              }}
              className="w-full px-2.5 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] flex items-center justify-between transition-colors text-left group"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-zinc-400 group-hover:text-cyan-400" />
                <span>Profile & Settings</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.08] my-1"></div>

          {/* Real Working Logout Action */}
          <button
            onClick={handleLogout}
            className="w-full px-2.5 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors text-left font-medium"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Log Out</span>
          </button>
        </div>
      )}

      {/* Bottom Profile Section (Single Profile in Most Preferable Position) */}
      {!isCollapsed ? (
        <div className="p-3 border-t border-white/[0.06] bg-[#090b10]">
          {user && (
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-full flex items-center justify-between p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors text-left group"
              title="View account options"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm group-hover:ring-2 group-hover:ring-cyan-500/40 transition-all">
                  {user.name ? user.name[0] : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">{user.name || 'User'}</p>
                  <p className="text-[10px] text-zinc-500 truncate capitalize">{(user.roles && user.roles[0]) || 'Member'}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
            </button>
          )}
        </div>
      ) : (
        <div className="p-3 border-t border-white/[0.06] flex justify-center">
          {user && (
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm hover:ring-2 hover:ring-cyan-500/40 transition-all"
              title={user.name || 'User Account'}
            >
              {user.name ? user.name[0] : 'U'}
            </button>
          )}
        </div>
      )}

      {/* Dialogs */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={closeExportDialog}
        sessions={sessions}
        currentSessionId={currentSessionId}
      />
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={closeTemplateSelector}
        onSelectTemplate={handleTemplateSelect}
      />

      {/* Drag Resize Handle */}
      {!isCollapsed && (
        <div
          className="absolute top-0 right-0 bottom-0 w-1 transition-colors duration-200 bg-transparent select-none cursor-col-resize group hover:w-1.5 hover:bg-cyan-500/30"
          onMouseDown={handleMouseDown}
        />
      )}
    </aside>
  );
};

export default ChatSidebar;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api-client';
import type { ConversationBranch } from '@/types/threading';
import { generateTitleFromMessage, generateTitleFromConversation, shouldUpdateTitle } from '@/utils/titleGenerator';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  files?: Array<{
    name: string;
    type: string;
    size: number;
    pages?: number;
  }>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  endedAt?: string;
}

interface ChatResponse {
  sessionId: string;
  title?: string; // Backend returns smart title
  reply: string;
  timestamp: string;
  messageCount: number;
}

interface SessionsResponse {
  sessions: ChatSession[];
  totalSessions: number;
}

interface SessionResponse {
  session: ChatSession;
}

export interface MessageReaction {
  id: string;
  reactionType: 'THUMBS_UP' | 'THUMBS_DOWN' | 'BOOKMARK' | 'STAR';
  feedback?: string;
  createdAt: string;
}

interface ChatState {
  // State
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  messageReactions: Record<string, MessageReaction[]>; // messageId -> reactions
  
  // Search state
  searchQuery: string;
  searchResults: ChatSession[];
  isSearching: boolean;
  
  // Export state
  showExportDialog: boolean;
  
  // Template state
  showTemplateSelector: boolean;
  
  // Keyboard shortcuts state
  showKeyboardShortcuts: boolean;
  
  // Threading state
  branches: ConversationBranch[];
  currentBranchId: string | null;
  showBranchNavigator: boolean;
  
  // Sharing state
  showShareDialog: boolean;
  
  // Actions
  sendMessage: (message: string) => Promise<void>;
  sendMessageWithFiles: (message: string, files: File[]) => Promise<void>;
  loadSessions: () => Promise<void>;
  createNewSession: (initialMessage?: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  endSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  clearError: () => void;
  setTyping: (typing: boolean) => void;
  
  // Reaction actions
  addReaction: (sessionId: string, messageId: string, reactionType: string, feedback?: string) => Promise<void>;
  removeReaction: (reactionId: string) => Promise<void>;
  loadMessageReactions: (sessionId: string) => Promise<void>;
  
  // Search actions
  searchSessions: (query: string) => void;
  clearSearch: () => void;
  
  // Export actions
  openExportDialog: () => void;
  closeExportDialog: () => void;
  
  // Template actions
  openTemplateSelector: () => void;
  closeTemplateSelector: () => void;
  
  // Keyboard shortcuts actions
  openKeyboardShortcuts: () => void;
  closeKeyboardShortcuts: () => void;
  
  // Threading actions
  createBranch: (fromMessageId: string, branchName?: string) => void;
  switchBranch: (branchId: string | null) => void;
  renameBranch: (branchId: string, newName: string) => void;
  deleteBranch: (branchId: string) => void;
  openBranchNavigator: () => void;
  closeBranchNavigator: () => void;
  
  // Sharing actions
  openShareDialog: () => void;
  closeShareDialog: () => void;
  shareSession: (sessionId: string, options: any) => Promise<any>;
  
  // Title management actions
  updateSessionTitle: (sessionId: string, newTitle?: string) => void;
  regenerateAllTitles: () => Promise<void>;
  
  // Storage management
  clearAllSessions: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      sessions: [],
      isLoading: false,
      isTyping: false,
      error: null,
      messageReactions: {},
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      showExportDialog: false,
      showTemplateSelector: false,
      showKeyboardShortcuts: false,
      branches: [],
      currentBranchId: null,
      showBranchNavigator: false,
      showShareDialog: false,

      // Actions
      sendMessage: async (message: string) => {
        const { currentSession } = get();
        if (!currentSession) {
          console.error('SendMessage: No current session available');
          return;
        }

        console.log('SendMessage: Sending message to session:', {
          sessionId: currentSession.id,
          sessionTitle: currentSession.title,
          existingMessageCount: currentSession.messages.length,
          message: message.substring(0, 50) + (message.length > 50 ? '...' : '')
        });
        
        set({ isLoading: true, isTyping: true, error: null });

        try {
          // Add user message immediately to UI
          const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
          };

          const updatedMessages = [...currentSession.messages, userMessage];
          
          set({
            currentSession: {
              ...currentSession,
              messages: updatedMessages,
            },
          });

          // Determine if we should send sessionId to backend
          const isTemporarySession = currentSession.id.startsWith('temp-');
          
          // For temporary sessions, don't send sessionId - let backend create new session with smart title
          // For permanent sessions, send the clean sessionId
          let sessionIdToSend = undefined;
          
          if (!isTemporarySession) {
            // Extract clean session ID (remove timestamp suffix if present)
            let cleanSessionId = currentSession.id;
            if (currentSession.id.includes('-') && /\d{13}$/.test(currentSession.id)) {
              const lastDashIndex = currentSession.id.lastIndexOf('-');
              const potentialTimestamp = currentSession.id.substring(lastDashIndex + 1);
              if (/^\d{13}$/.test(potentialTimestamp)) {
                cleanSessionId = currentSession.id.substring(0, lastDashIndex);
                console.log('SendMessage: Using clean session ID:', cleanSessionId);
              }
            }
            sessionIdToSend = cleanSessionId;
          } else {
            console.log('SendMessage: Temporary session - not sending sessionId, backend will create new session');
          }

          // Send message to backend
          const requestBody: any = { message };
          if (sessionIdToSend) {
            requestBody.sessionId = sessionIdToSend;
          }
          
          const response = await apiClient.post<ChatResponse>('/chat', requestBody);

          if (response.status === 'success' && response.data) {
            // Backend returns AI response
            const aiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: response.data.reply,
              timestamp: response.data.timestamp,
            };

            // Use backend's title if provided, otherwise generate smart title
            let newTitle = currentSession.title;
            
            // Check if backend returned a title (for new sessions)
            if (response.data.title) {
              console.log('SendMessage: Using backend-generated title:', response.data.title);
              newTitle = response.data.title;
            } else if (currentSession.title === 'New Chat' || currentSession.title === 'New Career Session') {
              // First message - generate title from user input
              newTitle = generateTitleFromMessage(message);
            } else if (shouldUpdateTitle(currentSession.title, [...updatedMessages, aiMessage].length)) {
              // Update title based on conversation context after a few messages
              newTitle = generateTitleFromConversation([...updatedMessages, aiMessage]);
            }

            // Handle session updates properly to prevent mixing
            const isTemporarySession = currentSession.id.startsWith('temp-');
            
            // Update session with real ID if it was temporary
            const backendSessionId = response.data.sessionId;
            console.log('SendMessage: Backend returned session ID:', backendSessionId);
            
            // For temporary sessions, ensure the backend sessionId doesn't conflict
            let finalSessionId = backendSessionId;
            if (isTemporarySession) {
              const currentSessions = get().sessions;
              const conflictingSession = currentSessions.find((s: ChatSession) => 
                s.id === backendSessionId && s.id !== currentSession.id
              );
              
              if (conflictingSession) {
                console.error('SendMessage: Backend returned conflicting session ID!', {
                  backendSessionId,
                  conflictingSession: conflictingSession,
                  currentTempId: currentSession.id
                });
                
                // Generate a unique session ID to avoid conflict
                finalSessionId = `${backendSessionId}-${Date.now()}`;
                console.log('SendMessage: Using modified session ID to avoid conflict:', finalSessionId);
              }
            }
            
            const updatedSession = {
              ...currentSession,
              id: finalSessionId, // Use safe session ID
              title: newTitle,
              messages: [...updatedMessages, aiMessage],
              updatedAt: new Date().toISOString(),
            };
            const currentSessions = get().sessions;
            const newSessionId = finalSessionId; // Use the safe session ID
            
            console.log('SendMessage: Session conversion details:', {
              isTemporary: isTemporarySession,
              currentId: currentSession.id,
              newId: newSessionId,
              currentSessionsCount: currentSessions.length,
              currentSessionTitles: currentSessions.map((s: ChatSession) => `${s.id}: "${s.title}"`).join(', ')
            });
            
            let updatedSessions: ChatSession[];
            if (isTemporarySession) {
              console.log('SendMessage: Converting temporary session to permanent:', currentSession.id, '->', newSessionId);
              
              // CRITICAL: Check if the new session ID already exists in permanent sessions
              const existingPermanentSession = currentSessions.find((s: ChatSession) => 
                s.id === newSessionId && !s.id.startsWith('temp-')
              );
              
              if (existingPermanentSession) {
                console.error('SendMessage: CRITICAL ERROR - Backend returned existing session ID!', {
                  existingSession: existingPermanentSession,
                  newSessionId: newSessionId,
                  tempSessionId: currentSession.id
                });
                throw new Error(`Backend returned existing session ID: ${newSessionId}`);
              }
              
              // PROFESSIONAL: Add the converted session to the sidebar (it wasn't there before)
              // Since temp sessions aren't in the sidebar, we need to add this as new session
              console.log('SendMessage: Adding converted temp session to sidebar as new permanent session');
              updatedSessions = [updatedSession, ...currentSessions];
              
              console.log('SendMessage: Session successfully added to sidebar with messages:', updatedSession.messages.length);
              
              // Verify no duplicates after conversion
              const sessionIds = updatedSessions.map(s => s.id);
              const duplicateIds = sessionIds.filter((id, index) => sessionIds.indexOf(id) !== index);
              if (duplicateIds.length > 0) {
                console.error('SendMessage: DUPLICATE SESSION IDS DETECTED:', duplicateIds);
                // Remove duplicates, keeping the first occurrence
                const seenIds = new Set<string>();
                updatedSessions = updatedSessions.filter((s: ChatSession) => {
                  if (seenIds.has(s.id)) {
                    console.log('SendMessage: Removing duplicate session:', s.id);
                    return false;
                  }
                  seenIds.add(s.id);
                  return true;
                });
              }
            } else {
              console.log('SendMessage: Updating existing permanent session:', currentSession.id);
              // Update existing session, ensuring no duplicates
              updatedSessions = currentSessions.map((s: ChatSession) => 
                s.id === currentSession.id ? updatedSession : s
              );
            }

            console.log('SendMessage: Updated session:', {
              id: updatedSession.id,
              title: updatedSession.title,
              messageCount: updatedSession.messages.length
            });
            console.log('SendMessage: Final sessions list length:', updatedSessions.length);
            console.log('SendMessage: All sessions in sidebar:');
            updatedSessions.forEach((sess, idx) => {
              console.log(`  ${idx + 1}. ${sess.id} - "${sess.title}" (${sess.messages.length} messages)`);
            });

            set({
              currentSession: updatedSession,
              sessions: updatedSessions,
              isLoading: false,
              isTyping: false,
            });
          } else {
            throw new Error(response.message || 'Failed to send message');
          }
        } catch (error: any) {
          console.error('Send message error:', error);
          
          let errorMessage = 'Failed to send message. Please try again.';
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          }

          set({
            isLoading: false,
            isTyping: false,
            error: errorMessage,
          });
        }
      },

      sendMessageWithFiles: async (message: string, files: File[]) => {
        const { currentSession } = get();
        console.log('Sending message with files:', message, 'Files:', files.length);
        set({ isLoading: true, isTyping: true, error: null });

        try {
          // Check authentication
          const token = localStorage.getItem('authToken');
          if (!token) {
            throw new Error('Authentication required. Please log in again.');
          }
          
          console.log('Auth token found:', {
            length: token.length,
            preview: token.substring(0, 50) + '...',
            type: typeof token
          });

          // Create FormData for file upload
          const formData = new FormData();
          formData.append('message', message);
          files.forEach((file) => {
            formData.append('files', file);
          });

          // Add user message immediately to UI
          const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
            files: files.map(f => ({
              name: f.name,
              type: f.type,
              size: f.size
            })),
            timestamp: new Date().toISOString(),
          };

          const currentMessages = currentSession?.messages || [];
          const updatedMessages = [...currentMessages, userMessage];
          
          set({
            currentSession: currentSession ? {
              ...currentSession,
              messages: updatedMessages,
            } : {
              id: `temp-${Date.now()}`,
              title: 'New Chat with Files',
              messages: updatedMessages,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });

          // Extract clean session ID (remove timestamp suffix if present)
          let cleanSessionId = currentSession?.id;
          if (cleanSessionId && cleanSessionId.includes('-') && /\d{13}$/.test(cleanSessionId)) {
            const lastDashIndex = cleanSessionId.lastIndexOf('-');
            const potentialTimestamp = cleanSessionId.substring(lastDashIndex + 1);
            if (/^\d{13}$/.test(potentialTimestamp)) {
              cleanSessionId = cleanSessionId.substring(0, lastDashIndex);
              console.log('SendMessageWithFiles: Using clean session ID:', cleanSessionId);
            }
          }

          // Add session ID to formData if available
          if (cleanSessionId && !cleanSessionId.startsWith('temp-')) {
            formData.append('sessionId', cleanSessionId);
          }

          // Send files to backend using direct axios call with proper authentication
          const response = await fetch('/api/v1/chat/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (data.status === 'success' && data.data) {
            // Backend returns AI response
            const aiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: data.data.reply,
              timestamp: data.data.timestamp,
            };

            // Generate smart title for file uploads
            let newTitle = currentSession?.title || 'New Chat';
            
            if (newTitle === 'New Chat' || !currentSession?.title) {
              // Generate title based on message content and file context
              if (message && message.trim()) {
                newTitle = generateTitleFromMessage(message);
              } else {
                // Generate title from file types
                const fileTypes = files.map(f => f.type);
                const hasImages = fileTypes.some(type => type.startsWith('image/'));
                const hasDocs = fileTypes.some(type => 
                  type.includes('pdf') || 
                  type.includes('word') || 
                  type.includes('document')
                );
                
                if (hasImages && hasDocs) {
                  newTitle = 'Document & Image Analysis';
                } else if (hasImages) {
                  newTitle = 'Image Analysis';
                } else if (hasDocs) {
                  newTitle = 'Document Review';
                } else {
                  newTitle = 'File Analysis';
                }
              }
            }

            // Update session with real ID and AI response
            const finalSession = {
              ...(currentSession || {
                id: `temp-${Date.now()}`,
                title: 'Chat with Files',
                createdAt: new Date().toISOString(),
              }),
              id: data.data.sessionId, // Use real session ID from backend
              title: newTitle,
              messages: [...updatedMessages, aiMessage],
              updatedAt: new Date().toISOString(),
            };

            // Add to sessions list if it was a temporary session
            const isTemporarySession = !currentSession || currentSession.id.startsWith('temp-');
            const updatedSessions = isTemporarySession 
              ? [finalSession, ...get().sessions]
              : get().sessions.map(s => s.id === currentSession.id ? finalSession : s);

            set({
              currentSession: finalSession,
              sessions: updatedSessions,
              isLoading: false,
              isTyping: false,
            });
          } else {
            throw new Error(data.message || 'Failed to upload files and get response');
          }
        } catch (error: any) {
          console.error('Send message with files error:', error);
          
          let errorMessage = 'Failed to upload files and send message. Please try again.';
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          }

          set({
            isLoading: false,
            isTyping: false,
            error: errorMessage,
          });
        }
      },

      loadSessions: async () => {
        const state = get();
        
        // Prevent duplicate calls if already loading
        if (state.isLoading) {
          console.log('LoadSessions: Already loading, skipping...');
          return;
        }
        
        console.log('LoadSessions: Starting to load sessions...');
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.get<SessionsResponse>('/chat/sessions');
          console.log('LoadSessions: API response:', response);
          
          if (response.status === 'success' && response.data) {
            // Ensure all sessions have properly initialized messages arrays
            const validatedSessions = (response.data.sessions || []).map(session => ({
              ...session,
              messages: Array.isArray(session.messages) ? session.messages : [],
              title: session.title || 'Untitled Session',
              createdAt: session.createdAt || new Date().toISOString(),
              updatedAt: session.updatedAt || new Date().toISOString(),
            }));

            console.log('LoadSessions: Validated sessions:', validatedSessions.length, 'sessions');
            validatedSessions.forEach((session, index) => {
              console.log(`Session ${index + 1}:`, {
                id: session.id,
                title: session.title,
                messageCount: session.messages.length,
                createdAt: session.createdAt
              });
            });

            // Merge with existing sessions in local storage to maintain all sessions
            const currentSessions = state.sessions || [];
            const mergedSessions = [...validatedSessions];
            
            // Add any local sessions that might not be on the server yet (temp sessions)
            currentSessions.forEach((localSession: ChatSession) => {
              if (!mergedSessions.find((s: ChatSession) => s.id === localSession.id)) {
                console.log('Adding local session to merged list:', localSession.id);
                mergedSessions.push(localSession);
              }
            });

            console.log('LoadSessions: Final merged sessions count:', mergedSessions.length);

            set({
              sessions: mergedSessions,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || 'Failed to load sessions');
          }
        } catch (error: any) {
          console.error('Load sessions error:', error);
          
          // Check if it's a rate limit error and provide better message
          const errorMessage = error.response?.status === 429 
            ? 'Too many requests. Please wait a moment before trying again.'
            : error.response?.data?.message || 'Failed to load chat sessions';
          
          // On error, keep existing sessions from local storage
          const currentSessions = state.sessions || [];
          console.log('LoadSessions: Error occurred, keeping existing sessions:', currentSessions.length);
          
          set({
            sessions: currentSessions,
            isLoading: false,
            error: errorMessage,
          });
        }
      },

      createNewSession: async (initialMessage?: string) => {
        // Clear current session first to ensure isolation
        set({ isLoading: true, error: null, currentSession: null });

        try {
          if (initialMessage) {
            // If there's an initial message, create session by sending it
            console.log('Creating new session with message:', initialMessage);
            
            const response = await apiClient.post<ChatResponse>('/chat', {
              message: initialMessage,
            });

            console.log('Create session response:', response);

            if (response.status === 'success' && response.data) {
              // Use backend-generated title if provided, otherwise generate from message
              const sessionTitle = response.data.title || generateTitleFromMessage(initialMessage);
              console.log('CreateNewSession: Using title:', sessionTitle);
              
              const newSession: ChatSession = {
                id: response.data.sessionId,
                title: sessionTitle,
                messages: [
                  {
                    id: `${response.data.sessionId}-1`,
                    role: 'user',
                    content: initialMessage,
                    timestamp: new Date().toISOString(),
                  },
                  {
                    id: `${response.data.sessionId}-2`,
                    role: 'assistant',
                    content: response.data.reply,
                    timestamp: response.data.timestamp,
                  },
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };

              // Ensure this session doesn't already exist in sessions list
              const currentSessions = get().sessions;
              const newSessionId = response.data.sessionId;
              const filteredSessions = currentSessions.filter(s => s.id !== newSessionId);

              console.log('CreateNewSession: Created new session with messages:', newSession);
              console.log('CreateNewSession: Updated sessions list length:', [newSession, ...filteredSessions].length);
              
              set({
                currentSession: newSession,
                sessions: [newSession, ...filteredSessions],
                isLoading: false,
              });
            } else {
              throw new Error(response.message || 'Failed to create new session');
            }
          } else {
            // Create TEMPORARY session for fresh chat experience (like ChatGPT)
            // This session will NOT be added to the sidebar until user sends first message
            console.log('Creating temporary session for fresh chat (not added to sidebar yet)');
            
            // Generate truly unique temporary ID with timestamp and random components
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
            console.log('CreateNewSession: Generated temporary ID:', tempId);
            
            const newSession: ChatSession = {
              id: tempId, // Unique temporary ID until first message
              title: 'New Career Session',
              messages: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            // PROFESSIONAL: Do NOT add empty session to sessions list (sidebar)
            // Only set as currentSession for the chat interface to work
            console.log('CreateNewSession: Created temporary session, NOT adding to sidebar yet');

            set({
              currentSession: newSession,
              // Keep existing sessions unchanged - don't add empty session
              isLoading: false,
            });
          }
        } catch (error: any) {
          console.error('Create session error:', error);
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to create new chat session',
            currentSession: null, // Clear on error
          });
        }
      },

      loadSession: async (sessionId: string) => {
        const state = get();
        
        // Prevent duplicate calls if already loading the same session
        if (state.isLoading && state.currentSession?.id === sessionId) {
          return;
        }
        
        // If it's already the current session, don't reload
        if (state.currentSession?.id === sessionId && !state.isLoading) {
          return;
        }
        
        set({ isLoading: true, error: null, currentSession: null }); // Clear current session first

        try {
          // First check if session exists in local storage
          const existingSession = state.sessions.find(s => s.id === sessionId);
          
          if (existingSession) {
            // Use local session data
            console.log('Loading session from local storage:', sessionId);
            set({
              currentSession: existingSession,
              isLoading: false,
            });
          } else {
            // Load from backend
            console.log('Loading session from backend:', sessionId);
            const response = await apiClient.get<SessionResponse>(`/chat/session/${sessionId}`);
            
            if (response.status === 'success' && response.data) {
              // Validate and normalize the session data
              const session = response.data.session;
              const validatedSession: ChatSession = {
                ...session,
                messages: Array.isArray(session.messages) ? session.messages : [],
                title: session.title || 'Untitled Session',
                createdAt: session.createdAt || new Date().toISOString(),
                updatedAt: session.updatedAt || new Date().toISOString(),
              };

              // Also update sessions list if not present
              const sessions = state.sessions;
              const sessionExists = sessions.some(s => s.id === sessionId);
              const updatedSessions = sessionExists 
                ? sessions.map(s => s.id === sessionId ? validatedSession : s)
                : [validatedSession, ...sessions];

              set({
                currentSession: validatedSession,
                sessions: updatedSessions,
                isLoading: false,
              });
            } else {
              throw new Error(response.message || 'Failed to load session');
            }
          }
        } catch (error: any) {
          console.error('Load session error:', error);
          
          // Check if it's a rate limit error and provide better message
          const errorMessage = error.response?.status === 429 
            ? 'Too many requests. Please wait a moment before trying again.'
            : error.response?.data?.message || 'Failed to load chat session';
          
          set({
            isLoading: false,
            error: errorMessage,
            currentSession: null, // Ensure current session is cleared on error
          });
        }
      },

      endSession: async (sessionId: string) => {
        try {
          await apiClient.put(`/chat/session/${sessionId}/end`);
          
          // Update local state
          const { sessions, currentSession } = get();
          const updatedSessions = sessions.map(session =>
            session.id === sessionId
              ? { ...session, endedAt: new Date().toISOString() }
              : session
          );

          set({
            sessions: updatedSessions,
            currentSession: currentSession?.id === sessionId 
              ? { ...currentSession, endedAt: new Date().toISOString() }
              : currentSession,
          });
        } catch (error: any) {
          console.error('End session error:', error);
          set({
            error: error.response?.data?.message || 'Failed to end session',
          });
        }
      },

      deleteSession: async (sessionId: string) => {
        console.log('DeleteSession: Starting deletion for session:', sessionId);
        
        const { sessions, currentSession } = get();
        const isTemporarySession = sessionId.startsWith('temp-');
        
        try {
          // Only call API for permanent sessions (not temporary ones)
          if (!isTemporarySession) {
            console.log('DeleteSession: Calling API to delete permanent session');
            await apiClient.delete(`/chat/session/${sessionId}`);
          } else {
            console.log('DeleteSession: Skipping API call for temporary session');
          }
          
          // Update local state - remove the session completely
          console.log('DeleteSession: Sessions before deletion:', sessions.length);
          
          // Filter out the deleted session
          const updatedSessions = sessions.filter((session: ChatSession) => session.id !== sessionId);
          console.log('DeleteSession: Sessions after deletion:', updatedSessions.length);
          
          // If the deleted session was the current one, handle current session
          let newCurrentSession = currentSession;
          if (currentSession?.id === sessionId) {
            // If we have other sessions, select the first one, otherwise clear current session
            newCurrentSession = updatedSessions.length > 0 ? updatedSessions[0] : null;
            console.log('DeleteSession: Current session was deleted, new current session:', newCurrentSession?.id || 'none');
          }

          set({
            sessions: updatedSessions,
            currentSession: newCurrentSession,
          });
          
          console.log('DeleteSession: Session successfully deleted and state updated');
          
          // Log updated session list for sidebar
          console.log('DeleteSession: Updated sessions in sidebar:');
          updatedSessions.forEach((sess: ChatSession, idx: number) => {
            console.log(`  ${idx + 1}. ${sess.id} - "${sess.title}" (${sess.messages.length} messages)`);
          });
          
        } catch (error: any) {
          console.error('Delete session error:', error);
          set({
            error: error.response?.data?.message || 'Failed to delete session',
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setTyping: (typing: boolean) => {
        set({ isTyping: typing });
      },

      // Reaction actions
      addReaction: async (sessionId: string, messageId: string, reactionType: string, feedback?: string) => {
        try {
          const response = await apiClient.post<{reaction: MessageReaction}>('/reactions', {
            sessionId,
            messageId,
            reactionType,
            feedback,
          });

          if (response.status === 'success' && response.data) {
            // Update local reactions state
            const { messageReactions } = get();
            const updatedReactions = { ...messageReactions };
            
            if (!updatedReactions[messageId]) {
              updatedReactions[messageId] = [];
            }
            
            // Remove existing reaction of same type if any
            updatedReactions[messageId] = updatedReactions[messageId].filter(
              r => r.reactionType !== reactionType
            );
            
            // Add new reaction
            updatedReactions[messageId].push(response.data.reaction);
            
            set({ messageReactions: updatedReactions });
          }
        } catch (error: any) {
          console.error('Add reaction error:', error);
          set({ error: error.response?.data?.message || 'Failed to add reaction' });
        }
      },

      removeReaction: async (reactionId: string) => {
        try {
          await apiClient.delete(`/reactions/${reactionId}`);
          
          // Update local reactions state
          const { messageReactions } = get();
          const updatedReactions = { ...messageReactions };
          
          // Remove reaction from all messages
          Object.keys(updatedReactions).forEach(messageId => {
            updatedReactions[messageId] = updatedReactions[messageId].filter(
              r => r.id !== reactionId
            );
          });
          
          set({ messageReactions: updatedReactions });
        } catch (error: any) {
          console.error('Remove reaction error:', error);
          set({ error: error.response?.data?.message || 'Failed to remove reaction' });
        }
      },

      loadMessageReactions: async (sessionId: string) => {
        try {
          const response = await apiClient.get<{reactions: Record<string, MessageReaction[]>}>(`/reactions/session/${sessionId}`);
          
          if (response.status === 'success' && response.data) {
            set({ messageReactions: response.data.reactions });
          }
        } catch (error: any) {
          console.error('Load reactions error:', error);
          // Don't set error for reactions loading failure as it's not critical
        }
      },

      // Search actions
      searchSessions: (query: string) => {
        const { sessions } = get();
        set({ searchQuery: query, isSearching: true });

        if (!query.trim()) {
          set({ searchResults: [], isSearching: false });
          return;
        }

        const lowerQuery = query.toLowerCase().trim();
        
        // Search through sessions and their messages
        const results = sessions.filter(session => {
          // Search in session title
          if (session.title?.toLowerCase().includes(lowerQuery)) {
            return true;
          }

          // Search in message content
          return session.messages.some(message => 
            message.content.toLowerCase().includes(lowerQuery)
          );
        });

        // Sort results by relevance and recency
        const sortedResults = results.sort((a, b) => {
          // Prioritize title matches
          const aTitleMatch = a.title?.toLowerCase().includes(lowerQuery);
          const bTitleMatch = b.title?.toLowerCase().includes(lowerQuery);
          
          if (aTitleMatch && !bTitleMatch) return -1;
          if (!aTitleMatch && bTitleMatch) return 1;
          
          // Then by most recent
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

        set({ searchResults: sortedResults, isSearching: false });
      },

      clearSearch: () => {
        set({ 
          searchQuery: '', 
          searchResults: [], 
          isSearching: false 
        });
      },

      // Export actions
      openExportDialog: () => {
        set({ showExportDialog: true });
      },

      closeExportDialog: () => {
        set({ showExportDialog: false });
      },

      // Template actions
      openTemplateSelector: () => {
        set({ showTemplateSelector: true });
      },

      closeTemplateSelector: () => {
        set({ showTemplateSelector: false });
      },

      // Keyboard shortcuts actions
      openKeyboardShortcuts: () => {
        set({ showKeyboardShortcuts: true });
      },

      closeKeyboardShortcuts: () => {
        set({ showKeyboardShortcuts: false });
      },

      // Threading actions
      createBranch: (fromMessageId: string, branchName?: string) => {
        const { currentSession } = get();
        if (!currentSession) return;

        // Find the message where the branch starts
        const messageIndex = currentSession.messages.findIndex(msg => msg.id === fromMessageId);
        if (messageIndex === -1) return;

        // Create new branch with messages up to the branching point
        const messagesUpToBranch = currentSession.messages.slice(0, messageIndex + 1);
        
        const newBranch: ConversationBranch = {
          id: `branch-${Date.now()}`,
          sessionId: currentSession.id,
          branchFromId: fromMessageId,
          branchName: branchName,
          messages: messagesUpToBranch,
          isActive: true,
          branchOrder: get().branches.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set({ 
          branches: [...get().branches, newBranch],
          currentBranchId: newBranch.id,
          showBranchNavigator: false
        });
      },

      switchBranch: (branchId: string | null) => {
        const { branches, currentSession } = get();
        
        if (branchId === null) {
          // Switch to main thread
          set({ currentBranchId: null });
        } else {
          // Switch to specific branch
          const branch = branches.find(b => b.id === branchId);
          if (branch && currentSession) {
            // Update current session to show branch messages
            set({ 
              currentBranchId: branchId,
              currentSession: {
                ...currentSession,
                messages: branch.messages
              }
            });
          }
        }
      },

      renameBranch: (branchId: string, newName: string) => {
        set({
          branches: get().branches.map(branch =>
            branch.id === branchId
              ? { ...branch, branchName: newName, updatedAt: new Date().toISOString() }
              : branch
          )
        });
      },

      deleteBranch: (branchId: string) => {
        const { currentBranchId } = get();
        
        set({
          branches: get().branches.filter(branch => branch.id !== branchId),
          // If deleting current branch, switch to main thread
          currentBranchId: currentBranchId === branchId ? null : currentBranchId
        });
      },

      openBranchNavigator: () => {
        set({ showBranchNavigator: true });
      },

      closeBranchNavigator: () => {
        set({ showBranchNavigator: false });
      },

      // Sharing actions
      openShareDialog: () => {
        set({ showShareDialog: true });
      },

      closeShareDialog: () => {
        set({ showShareDialog: false });
      },

      shareSession: async (sessionId: string, options: any) => {
        try {
          console.log('=== SHARE SESSION START ===');
          console.log('Session ID (original):', sessionId);
          
          // Extract the real session ID if it was modified with a timestamp
          // Format: "originalId-timestamp" -> extract "originalId"
          let cleanSessionId = sessionId;
          if (sessionId.includes('-') && /\d{13}$/.test(sessionId)) {
            // If ends with a 13-digit timestamp, extract the part before the last dash
            const lastDashIndex = sessionId.lastIndexOf('-');
            const potentialTimestamp = sessionId.substring(lastDashIndex + 1);
            if (/^\d{13}$/.test(potentialTimestamp)) {
              cleanSessionId = sessionId.substring(0, lastDashIndex);
              console.log('Extracted clean session ID:', cleanSessionId);
            }
          }
          
          console.log('Session ID (cleaned):', cleanSessionId);
          console.log('Options:', options);
          
          const response = await apiClient.post('/share', {
            sessionId: cleanSessionId,
            ...options,
          });

          console.log('Share response:', response);

          if (response.status === 'success' && response.data) {
            return response.data;
          } else {
            const errorMsg = response.message || 'Failed to create share link';
            console.error('Share failed with message:', errorMsg);
            throw new Error(errorMsg);
          }
        } catch (error: any) {
          console.error('=== SHARE SESSION ERROR ===');
          console.error('Error object:', error);
          console.error('Error message:', error.message);
          console.error('Error response:', error.response);
          throw new Error(error.message || 'Failed to create share link');
        }
      },

      // Title management actions
      updateSessionTitle: (sessionId: string, newTitle?: string) => {
        const sessions = get().sessions;
        const session = sessions.find(s => s.id === sessionId);
        
        if (session) {
          const updatedTitle = newTitle || generateTitleFromConversation(session.messages);
          
          const updatedSessions = sessions.map(s => 
            s.id === sessionId 
              ? { ...s, title: updatedTitle, updatedAt: new Date().toISOString() }
              : s
          );
          
          // Update current session if it's the one being updated
          const currentSession = get().currentSession;
          const updatedCurrentSession = currentSession?.id === sessionId
            ? { ...currentSession, title: updatedTitle, updatedAt: new Date().toISOString() }
            : currentSession;
          
          set({
            sessions: updatedSessions,
            currentSession: updatedCurrentSession,
          });
        }
      },

      regenerateAllTitles: async () => {
        const sessions = get().sessions;
        const updatedSessions = sessions.map(session => {
          if (session.messages.length > 0) {
            const newTitle = generateTitleFromConversation(session.messages);
            return {
              ...session,
              title: newTitle,
              updatedAt: new Date().toISOString(),
            };
          }
          return session;
        });
        
        set({ sessions: updatedSessions });
      },

      clearAllSessions: () => {
        console.log('🧹 Clearing all frontend chat sessions...');
        set({
          currentSession: null,
          sessions: [],
          searchQuery: '',
          searchResults: [],
          branches: [],
          currentBranchId: null,
          messageReactions: {},
        });
        console.log('✅ All chat sessions cleared from frontend!');
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        // Don't persist currentSession to ensure fresh start each time
      }),
      // Add merge function to handle state conflicts
      merge: (persistedState: any, currentState: any) => ({
        ...currentState,
        sessions: persistedState?.sessions || [],
        currentSession: null, // Always start with no current session
      }),
    }
  )
);

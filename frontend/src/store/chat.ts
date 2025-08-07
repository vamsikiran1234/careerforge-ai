import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api-client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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

interface ChatState {
  // State
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (message: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  createNewSession: (initialMessage?: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  endSession: (sessionId: string) => Promise<void>;
  clearError: () => void;
  setTyping: (typing: boolean) => void;
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

      // Actions
      sendMessage: async (message: string) => {
        const { currentSession } = get();
        if (!currentSession) return;

        console.log('Sending message:', message, 'to session:', currentSession.id);
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

          // Send message to backend (no userId needed - from auth token)
          const response = await apiClient.post<ChatResponse>('/chat', {
            message,
          });

          if (response.status === 'success' && response.data) {
            // Backend returns AI response
            const aiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: response.data.reply,
              timestamp: response.data.timestamp,
            };

            set({
              currentSession: {
                ...currentSession,
                messages: [...updatedMessages, aiMessage],
                updatedAt: new Date().toISOString(),
              },
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

      loadSessions: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.get<SessionsResponse>('/chat/sessions');
          
          if (response.status === 'success' && response.data) {
            set({
              sessions: response.data.sessions || [],
              isLoading: false,
            });
          } else {
            throw new Error(response.message || 'Failed to load sessions');
          }
        } catch (error: any) {
          console.error('Load sessions error:', error);
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to load chat sessions',
          });
        }
      },

      createNewSession: async (initialMessage?: string) => {
        set({ isLoading: true, error: null });

        try {
          // Create new session by sending initial message
          const message = initialMessage || 'Hello! I need career guidance.';
          console.log('Creating new session with message:', message);
          
          const response = await apiClient.post<ChatResponse>('/chat', {
            message,
          });

          console.log('Create session response:', response);

          if (response.status === 'success' && response.data) {
            const newSession: ChatSession = {
              id: response.data.sessionId,
              title: `Career Chat - ${new Date().toLocaleDateString()}`,
              messages: [
                {
                  id: '1',
                  role: 'user',
                  content: message,
                  timestamp: new Date().toISOString(),
                },
                {
                  id: '2',
                  role: 'assistant',
                  content: response.data.reply,
                  timestamp: response.data.timestamp,
                },
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            set({
              currentSession: newSession,
              sessions: [newSession, ...get().sessions],
              isLoading: false,
            });
          } else {
            throw new Error(response.message || 'Failed to create session');
          }
        } catch (error: any) {
          console.error('Create session error:', error);
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to create new chat session',
          });
        }
      },

      loadSession: async (sessionId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.get<SessionResponse>(`/chat/session/${sessionId}`);
          
          if (response.status === 'success' && response.data) {
            set({
              currentSession: response.data.session,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || 'Failed to load session');
          }
        } catch (error: any) {
          console.error('Load session error:', error);
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to load chat session',
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

      clearError: () => {
        set({ error: null });
      },

      setTyping: (typing: boolean) => {
        set({ isTyping: typing });
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        currentSession: state.currentSession,
      }),
    }
  )
);

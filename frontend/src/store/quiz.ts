import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../lib/api-client';

export interface QuizQuestion {
  id?: string;
  text: string;
  options: string[];
  stage: string;
  order?: number;
}

export interface QuizSession {
  sessionId: string;
  currentStage: string;
  question: QuizQuestion;
  progress: {
    currentStage: number;
    totalStages: number;
    percentage: number;
  };
}

export interface QuizResult {
  sessionId: string;
  recommendations: any[];
  careerSuggestions: any[];
  completedAt: string;
}

interface QuizState {
  currentSession: QuizSession | null;
  isLoading: boolean;
  error: string | null;
  completedSessions: string[];
  results: QuizResult | null;
  
  // Actions
  startQuiz: (userId: string) => Promise<void>;
  submitAnswer: (sessionId: string, answer: string, questionId?: string) => Promise<void>;
  getQuizSession: (sessionId: string) => Promise<void>;
  getUserQuizSessions: (userId: string) => Promise<any[]>;
  resetQuiz: () => void;
  clearError: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      isLoading: false,
      error: null,
      completedSessions: [],
      results: null,

      startQuiz: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post('/quiz/start', { userId });
          const data = response.data as any;
          
          set({
            currentSession: {
              sessionId: data.data.sessionId,
              currentStage: data.data.currentStage,
              question: data.data.question,
              progress: data.data.progress,
            },
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to start quiz';
          set({ 
            error: errorMessage, 
            isLoading: false,
            currentSession: null 
          });
          throw new Error(errorMessage);
        }
      },

      submitAnswer: async (sessionId: string, answer: string, questionId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post(`/quiz/${sessionId}/answer`, {
            answer,
            questionId,
          });

          const data = (response.data as any).data;

          if (data.isComplete) {
            // Quiz completed
            set({
              results: {
                sessionId,
                recommendations: data.recommendations || [],
                careerSuggestions: data.careerSuggestions || [],
                completedAt: new Date().toISOString(),
              },
              currentSession: null,
              completedSessions: [...get().completedSessions, sessionId],
              isLoading: false,
            });
          } else {
            // Update with next question
            set({
              currentSession: {
                sessionId,
                currentStage: data.currentStage,
                question: data.question,
                progress: data.progress,
              },
              isLoading: false,
            });
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to submit answer';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      getQuizSession: async (sessionId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.get(`/quiz/session/${sessionId}`);
          const data = (response.data as any).data;

          set({
            currentSession: {
              sessionId: data.sessionId,
              currentStage: data.currentStage,
              question: data.currentQuestion,
              progress: data.progress,
            },
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to get quiz session';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      getUserQuizSessions: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.get(`/quiz/sessions/${userId}`);
          set({ isLoading: false });
          return (response.data as any).data;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to get quiz sessions';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      resetQuiz: () => {
        set({
          currentSession: null,
          results: null,
          error: null,
          isLoading: false,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'quiz-store',
      partialize: (state) => ({
        completedSessions: state.completedSessions,
        // Don't persist current session to avoid stale data
      }),
    }
  )
);

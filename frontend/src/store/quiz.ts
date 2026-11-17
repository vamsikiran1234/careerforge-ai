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
    currentQuestion?: number;
    totalQuestions?: number;
    stageQuestion?: number;
    stageTotalQuestions?: number;
  };
}

export interface QuizResult {
  sessionId: string;
  recommendations: {
    topCareers?: any[];
    skillsToFocus?: any[];
    learningPath?: any;
    nextSteps?: string[];
    marketInsights?: any;
  };
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
          
          console.log('Quiz start response:', response);
          
          // Check if the response indicates an error
          if (response.status === 'error') {
            const errorMsg = response.message || 'Failed to start quiz';
            set({ 
              error: errorMsg, 
              isLoading: false,
              currentSession: null 
            });
            return; // Don't throw, just set error and return
          }
          
          const data = response as any;
          
          if (!data.data) {
            set({ 
              error: 'Invalid response format from server', 
              isLoading: false,
              currentSession: null 
            });
            return;
          }
          
          const sessionData = {
            sessionId: data.data.sessionId,
            currentStage: data.data.currentStage,
            question: data.data.question,
            progress: data.data.progress,
          };
          
          console.log('Setting current session:', sessionData);
          
          set({
            currentSession: sessionData,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('startQuiz Error:', error);
          
          const errorMessage = error.message || 'Failed to start quiz';
          
          set({ 
            error: errorMessage, 
            isLoading: false,
            currentSession: null 
          });
          // Don't throw, error is already set in state
        }
      },

      submitAnswer: async (sessionId: string, answer: string, questionId?: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('🔷 [QUIZ] Submitting answer:', { sessionId, answer, questionId });
          
          const response = await apiClient.post(`/quiz/${sessionId}/answer`, {
            answer,
            questionId,
          });

          console.log('🔷 [QUIZ] Full API response:', response);
          console.log('🔷 [QUIZ] Response type:', typeof response);
          console.log('🔷 [QUIZ] Response.data:', (response as any).data);
          console.log('🔷 [QUIZ] Response keys:', Object.keys(response));
          
          // Handle different response structures
          let data;
          const resp = response as any;
          
          if (resp.data && resp.data.data) {
            // Standard format: { status: 'success', data: {...} }
            data = resp.data.data;
            console.log('🔷 [QUIZ] Using response.data.data:', data);
          } else if (resp.data) {
            // Direct format: { sessionId: '...', nextQuestion: {...} }
            data = resp.data;
            console.log('🔷 [QUIZ] Using response.data directly:', data);
          } else if (resp.sessionId) {
            // Response is the data itself
            data = resp;
            console.log('🔷 [QUIZ] Using response directly:', data);
          } else {
            console.error('❌ [QUIZ] Cannot find data in response!', response);
            throw new Error('Invalid API response: cannot find data field');
          }

          if (!data) {
            console.error('❌ [QUIZ] Data is null or undefined!', response);
            throw new Error('Invalid API response: data is null');
          }

          console.log('🔷 [QUIZ] Final extracted data:', data);

          if (data.isComplete) {
            // Quiz completed
            console.log('✅ [QUIZ] Quiz completed!', data);
            
            // Parse results if it's a string (from database)
            let resultsData = data.results || data.recommendations || {};
            if (typeof resultsData === 'string') {
              try {
                resultsData = JSON.parse(resultsData);
                console.log('📦 [QUIZ] Parsed results from string:', resultsData);
              } catch (e) {
                console.error('Failed to parse results:', e);
                resultsData = {};
              }
            }
            
            console.log('📊 [QUIZ] Final results data structure:', resultsData);
            
            // Store the complete results object with all nested data
            set({
              results: {
                sessionId,
                recommendations: resultsData, // Store the complete object with topCareers, skillsToFocus, etc.
                completedAt: data.completedAt || new Date().toISOString(),
              } as any,
              currentSession: null,
              completedSessions: [...get().completedSessions, sessionId],
              isLoading: false,
            });
          } else {
            // Update with next question
            const nextQuestion = data.nextQuestion;
            console.log('🔷 [QUIZ] Next question data:', nextQuestion);
            
            if (!nextQuestion) {
              console.error('❌ [QUIZ] No nextQuestion in response!', data);
              throw new Error('Invalid response: missing nextQuestion object');
            }
            
            if (!nextQuestion.text) {
              console.error('❌ [QUIZ] No text in nextQuestion!', nextQuestion);
              throw new Error('Invalid response: missing question text');
            }

            console.log('✅ [QUIZ] Updating session with next question');
            set({
              currentSession: {
                sessionId,
                currentStage: nextQuestion.stage,
                question: {
                  id: nextQuestion.id,
                  text: nextQuestion.text,
                  options: nextQuestion.options || [],
                  stage: nextQuestion.stage,
                },
                progress: data.progress,
              },
              isLoading: false,
            });
            console.log('✅ [QUIZ] Session updated successfully');
          }
        } catch (error: any) {
          console.error('❌ [QUIZ] Error in submitAnswer:', error);
          console.error('❌ [QUIZ] Error details:', {
            message: error.message,
            response: error.response,
            responseData: error.response?.data,
            status: error.response?.status,
          });
          
          // Better error message
          let errorMessage = 'Failed to submit answer';
          
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message && error.message !== 'Failed to submit answer') {
            errorMessage = error.message;
          } else if (error.response?.status) {
            errorMessage = `Server error (${error.response.status}): ${error.response.statusText || 'Unknown error'}`;
          }
          
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
          console.log('🔍 Quiz Store: Fetching sessions for user:', userId);
          // Add cache-busting query parameter and headers
          const timestamp = new Date().getTime();
          const response = await apiClient.get(`/quiz/sessions/${userId}?_t=${timestamp}`);
          console.log('📦 Quiz Store: Raw response:', response);
          console.log('📦 Quiz Store: Response structure:', JSON.stringify(response, null, 2));
          
          set({ isLoading: false });
          
          // Handle different response structures
          let sessions = [];
          
          if (response && typeof response === 'object') {
            // Case 1: response = { status, message, data: { sessions: [...], statistics: {...} } }
            if (response.data && (response.data as any).sessions) {
              sessions = (response.data as any).sessions;
              console.log('✅ Quiz Store: Found sessions in response.data.sessions:', sessions);
            }
            // Case 2: response already is { sessions: [...], statistics: {...} }
            else if ((response as any).sessions) {
              sessions = (response as any).sessions;
              console.log('✅ Quiz Store: Found sessions in response.sessions:', sessions);
            }
            // Case 3: response is an array directly
            else if (Array.isArray(response)) {
              sessions = response;
              console.log('✅ Quiz Store: Response is array directly:', sessions);
            }
          }
          
          console.log('📊 Quiz Store: Final sessions array:', sessions);
          console.log('📊 Quiz Store: Sessions count:', sessions?.length || 0);
          
          return Array.isArray(sessions) ? sessions : [];
        } catch (error: any) {
          console.error('❌ Quiz Store: Error fetching sessions:', error);
          console.error('❌ Quiz Store: Error response:', error.response?.data);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to get quiz sessions';
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

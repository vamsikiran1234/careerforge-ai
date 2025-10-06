// API Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: string[];
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roles: string[]; // Changed from role?: string to roles: string[]
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Chat Types
export interface ChatMessage {
  id: string;
  sessionId: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  metadata?: Record<string, any>;
}

// Quiz Types
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  category: string;
  weight: number;
}

export interface QuizAnswer {
  questionId: string;
  selectedOption: string;
  score: number;
}

export interface QuizResult {
  id: string;
  userId: string;
  answers: QuizAnswer[];
  totalScore: number;
  recommendations: string[];
  careerSuggestions: CareerSuggestion[];
  createdAt: string;
}

export interface CareerSuggestion {
  title: string;
  description: string;
  matchScore: number;
  requiredSkills: string[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
}

// Mentor Types
export interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  domain: string;
  skills: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  hourlyRate?: number;
  availability: MentorAvailability[];
  bio: string;
  avatar?: string;
  languages: string[];
}

export interface MentorAvailability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  timezone: string;
}

export interface MentorSession {
  id: string;
  mentorId: string;
  userId: string;
  studentId: string;
  scheduledAt: string;
  duration: number; // in minutes
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  sessionType: 'VIDEO' | 'VOICE' | 'IN_PERSON';
  title: string;
  description?: string;
  timezone: string;
  meetingLink?: string;
  meetingRoom?: string;
  agendaNotes?: string;
  sessionNotes?: string;
  startedAt?: string;
  endedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  topic: string;
  notes?: string;
  rating?: number;
  review?: string;
  mentor?: {
    id: string;
    userId: string;
    company: string;
    jobTitle: string;
    user: {
      name: string;
      email: string;
    };
  };
}

// Dashboard Types
export interface DashboardStats {
  totalSessions: number;
  completedQuizzes: number;
  mentorSessions: number;
  learningProgress: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'quiz' | 'chat' | 'mentor' | 'learning';
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  progress: number;
  estimatedDuration: number; // in hours
  skills: string[];
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  order: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ChatForm {
  message: string;
}

export interface MentorSearchFilters {
  domain?: string;
  skills?: string[];
  experience?: {
    min: number;
    max: number;
  };
  hourlyRate?: {
    min: number;
    max: number;
  };
  rating?: number;
  availability?: {
    day: number;
    time: string;
  };
}

// UI Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

export interface NotificationState {
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: string;
}

// Route Types
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  protected?: boolean;
  title?: string;
}

// API Client Types
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

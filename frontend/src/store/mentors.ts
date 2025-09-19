import { create } from 'zustand';

export interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  expertise: string[];
  experience: number;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  bio: string;
  availability: 'available' | 'busy' | 'offline';
  languages: string[];
  timezone: string;
  responseTime: string;
  sessions: number;
}

export interface MentorSession {
  id: string;
  mentorId: string;
  userId: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  topic: string;
  notes?: string;
  rating?: number;
  feedback?: string;
}

export interface Review {
  id: string;
  mentorId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  session: string;
}

interface MentorState {
  mentors: Mentor[];
  sessions: MentorSession[];
  reviews: Review[];
  selectedMentor: Mentor | null;
  loading: boolean;
  error: string | null;
  filters: {
    expertise: string[];
    experience: string;
    rating: number;
    priceRange: [number, number];
    availability: string;
  };
  
  // Actions
  fetchMentors: () => Promise<void>;
  selectMentor: (mentor: Mentor) => void;
  bookSession: (session: Omit<MentorSession, 'id'>) => Promise<void>;
  cancelSession: (sessionId: string) => Promise<void>;
  submitReview: (review: Omit<Review, 'id' | 'date'>) => Promise<void>;
  updateFilters: (filters: Partial<MentorState['filters']>) => void;
  clearFilters: () => void;
}

// Mock data for development
const mockMentors: Mentor[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    title: 'Senior Software Engineer',
    company: 'Google',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    expertise: ['Software Engineering', 'Career Growth', 'Technical Leadership', 'System Design'],
    experience: 8,
    rating: 4.9,
    totalReviews: 127,
    hourlyRate: 85,
    bio: 'Passionate software engineer with 8+ years of experience at top tech companies. I help developers advance their careers, improve technical skills, and navigate the tech industry.',
    availability: 'available',
    languages: ['English', 'Mandarin'],
    timezone: 'PST',
    responseTime: '< 2 hours',
    sessions: 234,
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    title: 'Product Manager',
    company: 'Microsoft',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    expertise: ['Product Management', 'Strategy', 'Leadership', 'Data Analysis'],
    experience: 12,
    rating: 4.8,
    totalReviews: 89,
    hourlyRate: 120,
    bio: 'Experienced product manager with a track record of launching successful products. I mentor aspiring PMs and help professionals transition into product roles.',
    availability: 'available',
    languages: ['English', 'Spanish'],
    timezone: 'EST',
    responseTime: '< 1 hour',
    sessions: 156,
  },
  {
    id: '3',
    name: 'Priya Patel',
    title: 'UX Design Director',
    company: 'Airbnb',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    expertise: ['UX Design', 'Design Leadership', 'User Research', 'Design Systems'],
    experience: 10,
    rating: 4.9,
    totalReviews: 203,
    hourlyRate: 95,
    bio: 'Creative UX leader passionate about creating user-centered experiences. I help designers grow their skills and advance to senior and leadership roles.',
    availability: 'busy',
    languages: ['English', 'Hindi'],
    timezone: 'PST',
    responseTime: '< 3 hours',
    sessions: 187,
  },
  {
    id: '4',
    name: 'David Kim',
    title: 'Data Science Manager',
    company: 'Netflix',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    expertise: ['Data Science', 'Machine Learning', 'Analytics', 'Team Management'],
    experience: 9,
    rating: 4.7,
    totalReviews: 156,
    hourlyRate: 110,
    bio: 'Data science leader with experience building ML systems at scale. I mentor data scientists and help professionals break into the field.',
    availability: 'available',
    languages: ['English', 'Korean'],
    timezone: 'PST',
    responseTime: '< 2 hours',
    sessions: 143,
  },
  {
    id: '5',
    name: 'Emily Rodriguez',
    title: 'Marketing Director',
    company: 'Spotify',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    expertise: ['Digital Marketing', 'Brand Strategy', 'Growth Marketing', 'Content Strategy'],
    experience: 7,
    rating: 4.8,
    totalReviews: 92,
    hourlyRate: 75,
    bio: 'Marketing professional with expertise in digital marketing and brand building. I help marketers develop strategic thinking and advance their careers.',
    availability: 'available',
    languages: ['English', 'Spanish'],
    timezone: 'EST',
    responseTime: '< 1 hour',
    sessions: 108,
  },
];

const mockSessions: MentorSession[] = [
  {
    id: '1',
    mentorId: '1',
    userId: 'current-user',
    date: '2024-01-15',
    time: '14:00',
    duration: 60,
    status: 'scheduled',
    topic: 'Career Growth Strategy',
  },
  {
    id: '2',
    mentorId: '2',
    userId: 'current-user',
    date: '2024-01-10',
    time: '16:30',
    duration: 45,
    status: 'completed',
    topic: 'Product Management Transition',
    notes: 'Discussed roadmap planning and stakeholder management',
    rating: 5,
    feedback: 'Excellent session with actionable insights!',
  },
];

export const useMentorStore = create<MentorState>((set) => ({
  mentors: mockMentors,
  sessions: mockSessions,
  reviews: [],
  selectedMentor: null,
  loading: false,
  error: null,
  filters: {
    expertise: [],
    experience: '',
    rating: 0,
    priceRange: [0, 200],
    availability: '',
  },

  fetchMentors: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ mentors: mockMentors, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch mentors', loading: false });
    }
  },

  selectMentor: (mentor) => {
    set({ selectedMentor: mentor });
  },

  bookSession: async (session) => {
    set({ loading: true });
    try {
      const newSession: MentorSession = {
        ...session,
        id: Date.now().toString(),
      };
      set(state => ({
        sessions: [...state.sessions, newSession],
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to book session', loading: false });
    }
  },

  cancelSession: async (sessionId) => {
    set({ loading: true });
    try {
      set(state => ({
        sessions: state.sessions.map(session =>
          session.id === sessionId
            ? { ...session, status: 'cancelled' as const }
            : session
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to cancel session', loading: false });
    }
  },

  submitReview: async (review) => {
    set({ loading: true });
    try {
      const newReview: Review = {
        ...review,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };
      set(state => ({
        reviews: [...state.reviews, newReview],
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to submit review', loading: false });
    }
  },

  updateFilters: (filters) => {
    set(state => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        expertise: [],
        experience: '',
        rating: 0,
        priceRange: [0, 200],
        availability: '',
      },
    });
  },
}));

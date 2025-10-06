import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface MentorProfile {
  id: string;
  userId: string;
  company: string;
  jobTitle: string;
  industry: string;
  yearsOfExperience: number;
  collegeName: string;
  degree: string;
  graduationYear: number;
  major: string | null;
  expertiseAreas: string[];
  bio: string;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  availableHoursPerWeek: number;
  preferredMeetingType: string;
  timezone: string;
  isVerified: boolean;
  status: string;
  totalConnections: number;
  activeConnections: number;
  totalSessions: number;
  averageRating: number | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  receivedReviews?: MentorReview[];
}

export interface MentorReview {
  id: string;
  rating: number;
  feedback: string;
  isPublic: boolean;
  createdAt: string;
}

export interface MentorFilters {
  expertise: string[];
  industry: string;
  company: string;
  minExperience: number;
  maxExperience: number;
  rating: number;
  page: number;
  limit: number;
}

interface MentorStore {
  // State
  mentors: MentorProfile[];
  selectedMentor: MentorProfile | null;
  loading: boolean;
  error: string | null;
  filters: MentorFilters;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };

  // Actions
  fetchMentors: () => Promise<void>;
  fetchMentorById: (id: string) => Promise<void>;
  selectMentor: (mentor: MentorProfile | null) => void;
  updateFilters: (filters: Partial<MentorFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
}

const defaultFilters: MentorFilters = {
  expertise: [],
  industry: '',
  company: '',
  minExperience: 0,
  maxExperience: 50,
  rating: 0,
  page: 1,
  limit: 12,
};

export const useMentorStore = create<MentorStore>((set, get) => ({
  // Initial state
  mentors: [],
  selectedMentor: null,
  loading: false,
  error: null,
  filters: defaultFilters,
  pagination: {
    total: 0,
    page: 1,
    limit: 12,
    pages: 0,
  },

  // Fetch all mentors with current filters
  fetchMentors: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      
      // Get token from auth-storage (Zustand persist)
      let token = localStorage.getItem('token');
      if (!token) {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          try {
            const parsed = JSON.parse(authStorage);
            token = parsed.state?.token;
          } catch (e) {
            console.error('Failed to parse auth-storage:', e);
          }
        }
      }

      if (!token) {
        throw new Error('Authentication required');
      }

      // Build query params
      const params: Record<string, string> = {
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      };

      if (filters.expertise.length > 0) {
        params.expertise = filters.expertise.join(',');
      }
      if (filters.industry) {
        params.industry = filters.industry;
      }
      if (filters.company) {
        params.company = filters.company;
      }
      if (filters.minExperience > 0) {
        params.minExperience = filters.minExperience.toString();
      }
      if (filters.maxExperience < 50) {
        params.maxExperience = filters.maxExperience.toString();
      }

      const response = await axios.get(`${API_URL}/mentorship/mentors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      if (response.data.success) {
        set({
          mentors: response.data.data,
          pagination: response.data.pagination,
          loading: false,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch mentors');
      }
    } catch (error: any) {
      console.error('Error fetching mentors:', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch mentors',
        loading: false,
        mentors: [],
      });
    }
  },

  // Fetch mentor by ID with full details
  fetchMentorById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // Get token from auth-storage (Zustand persist)
      let token = localStorage.getItem('token');
      if (!token) {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          try {
            const parsed = JSON.parse(authStorage);
            token = parsed.state?.token;
          } catch (e) {
            console.error('Failed to parse auth-storage:', e);
          }
        }
      }

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(`${API_URL}/mentorship/mentors/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        set({
          selectedMentor: response.data.data,
          loading: false,
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch mentor details');
      }
    } catch (error: any) {
      console.error('Error fetching mentor:', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch mentor',
        loading: false,
      });
    }
  },

  // Select a mentor (for viewing profile)
  selectMentor: (mentor: MentorProfile | null) => {
    set({ selectedMentor: mentor });
  },

  // Update filters and refetch
  updateFilters: (newFilters: Partial<MentorFilters>) => {
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...newFilters, page: 1 }; // Reset to page 1 on filter change
    set({ filters: updatedFilters });
    get().fetchMentors();
  },

  // Reset all filters
  resetFilters: () => {
    set({ filters: defaultFilters });
    get().fetchMentors();
  },

  // Change page
  setPage: (page: number) => {
    set({ filters: { ...get().filters, page } });
    get().fetchMentors();
  },
}));

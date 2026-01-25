import { create } from 'zustand';
import { apiClient } from '../lib/api-client';

// ========================================
// TYPES & INTERFACES
// ========================================

export interface CareerGoal {
  id: string;
  userId: string;
  currentRole: string;
  currentCompany?: string;
  currentLevel?: string;
  yearsExperience?: number;
  targetRole: string;
  targetCompany?: string;
  targetLevel?: string;
  targetSalary?: number;
  timeframeMonths: number;
  startDate: string;
  targetDate: string;
  status: 'ACTIVE' | 'ACHIEVED' | 'POSTPONED' | 'CANCELLED';
  progress: number;
  aiGenerated: boolean;
  aiAnalysis?: string | AIAnalysis;
  notes?: string;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SHARED';
  createdAt: string;
  updatedAt: string;
  achievedAt?: string;
  milestones?: Milestone[];
  skillGaps?: SkillGap[];
  learningResources?: LearningResource[];
  _count?: {
    milestones: number;
    skillGaps: number;
    learningResources: number;
  };
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  category: 'SKILL_DEVELOPMENT' | 'NETWORKING' | 'PROJECT' | 'CERTIFICATION' | 'JOB_SEARCH';
  targetDate: string;
  order: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  progress: number;
  completedAt?: string;
  evidence?: string;
  aiSuggested: boolean;
  aiGuidance?: string | AIGuidance;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SkillGap {
  id: string;
  goalId: string;
  skillName: string;
  category: 'TECHNICAL' | 'SOFT_SKILL' | 'DOMAIN_KNOWLEDGE';
  currentLevel: number;
  targetLevel: number;
  gap: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedWeeks?: number;
  progress: number;
  lastPracticed?: string;
  learningStrategy?: string | LearningStrategy;
  status: 'IDENTIFIED' | 'LEARNING' | 'PROFICIENT';
  resourceCount?: number; // Added for UI display
  createdAt: string;
  updatedAt: string;
}

export interface LearningResource {
  id: string;
  goalId: string;
  skillGapId?: string;
  title: string;
  type: 'COURSE' | 'BOOK' | 'ARTICLE' | 'VIDEO' | 'PROJECT' | 'CERTIFICATION';
  url?: string;
  platform?: string;
  provider?: string; // Added for UI display
  description?: string; // Added for UI display
  duration?: string;
  cost?: number;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  rating?: number;
  status: 'RECOMMENDED' | 'IN_PROGRESS' | 'COMPLETED' | 'NOT_STARTED';
  relatedSkills?: string[]; // Added for UI display
  startedAt?: string;
  completedAt?: string;
  aiRecommended: boolean;
  relevanceScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysis {
  feasibility: 'HIGH' | 'MEDIUM' | 'LOW';
  successProbability: number;
  recommendedTimeframe?: number;
  keyRequirements: string[];
  majorChallenges: string[];
  quickWins: string[];
  suggestedAdjustments: string[];
  marketDemand?: 'HIGH' | 'MEDIUM' | 'LOW';
  salaryIncreasePotential?: string;
  summary: string;
}

export interface AIGuidance {
  actionSteps: string[];
  resources: string[];
  successCriteria: string;
}

export interface LearningStrategy {
  approach: string;
  resources: string[];
  practiceIdeas: string[];
}

export interface AIsuggestion {
  overallAssessment: string;
  onTrack: boolean;
  suggestedAdjustments: {
    type: 'TIMELINE' | 'MILESTONE' | 'SKILL' | 'FOCUS';
    suggestion: string;
    reason: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
  nextBestActions: string[];
  motivationalInsight: string;
  warningFlags: string[];
  celebrationPoints: string[];
}

export interface CareerOverview {
  activeGoals: number;
  totalMilestones: number;
  completedMilestones: number;
  skillsLearning: number;
  completionRate: number;
}

export interface CareerStats {
  totalGoals: number;
  activeGoals: number;
  achievedGoals: number;
  totalProgress: number;
  milestones: {
    total: number;
    completed: number;
    inProgress: number;
  };
  skills: {
    total: number;
    proficient: number;
    learning: number;
  };
  resources: {
    total: number;
    completed: number;
    inProgress: number;
  };
}

export interface CreateGoalInput {
  currentRole: string;
  currentCompany?: string;
  currentLevel?: string;
  yearsExperience?: number;
  targetRole: string;
  targetCompany?: string;
  targetLevel?: string;
  targetSalary?: number;
  timeframeMonths: number;
  notes?: string;
  visibility?: 'PRIVATE' | 'PUBLIC' | 'SHARED';
}

export interface CreateMilestoneInput {
  title: string;
  description?: string;
  category: string;
  targetDate: string;
  priority?: string;
  estimatedHours?: number;
}

export interface CreateSkillGapInput {
  skillName: string;
  category: string;
  currentLevel?: number;
  targetLevel: number;
  priority?: string;
  estimatedWeeks?: number;
}

export interface CreateResourceInput {
  title: string;
  type: string;
  url?: string;
  platform?: string;
  duration?: string;
  cost?: number;
  difficulty?: string;
  rating?: number;
  skillGapId?: string;
}

// ========================================
// ZUSTAND STORE
// ========================================

interface CareerState {
  // State
  currentGoal: CareerGoal | null;
  goals: CareerGoal[];
  milestones: Milestone[];
  skillGaps: SkillGap[];
  resources: LearningResource[];
  overview: CareerOverview | null;
  stats: CareerStats | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  
  // Undo state
  undoStack: {
    type: 'milestone' | 'skill' | 'resource' | 'goal';
    data: any;
    goalId: string;
    timeout?: NodeJS.Timeout;
  } | null;
  
  // Actions
  
  // Actions - Goals
  loadGoals: (status?: string) => Promise<void>;
  createGoal: (data: CreateGoalInput) => Promise<CareerGoal>;
  updateGoal: (id: string, data: Partial<CareerGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  setCurrentGoal: (id: string) => Promise<void>;
  fetchGoalById: (id: string) => Promise<void>;
  updateGoalProgress: (id: string, progress: number) => Promise<void>;
  
  // Actions - Milestones
  loadMilestones: (goalId: string) => Promise<void>;
  createMilestone: (goalId: string, data: CreateMilestoneInput) => Promise<Milestone>;
  updateMilestone: (goalId: string, milestoneId: string, data: Partial<Milestone>) => Promise<void>;
  deleteMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  completeMilestone: (goalId: string, milestoneId: string, evidence?: string) => Promise<void>;
  updateMilestoneProgress: (goalId: string, milestoneId: string, progress: number) => Promise<void>;
  
  // Actions - Skills
  loadSkillGaps: (goalId: string) => Promise<void>;
  createSkillGap: (goalId: string, data: CreateSkillGapInput) => Promise<SkillGap>;
  updateSkillGap: (goalId: string, skillId: string, data: Partial<SkillGap>) => Promise<void>;
  deleteSkillGap: (goalId: string, skillId: string) => Promise<void>;
  updateSkillProgress: (goalId: string, skillId: string, progress: number, currentLevel?: number) => Promise<void>;
  
  // Actions - Resources
  loadResources: (goalId: string, status?: string, type?: string) => Promise<void>;
  createResource: (goalId: string, data: CreateResourceInput) => Promise<LearningResource>;
  updateResource: (goalId: string, resourceId: string, data: Partial<LearningResource>) => Promise<void>;
  deleteResource: (goalId: string, resourceId: string) => Promise<void>;
  updateResourceStatus: (goalId: string, resourceId: string, status: string) => Promise<void>;
  generateSkillResources: (goalId: string, skillName: string) => Promise<LearningResource[]>;
  
  // Actions - AI
  analyzeCareerPath: (data: { currentRole: string; targetRole: string; yearsExperience?: number; timeframeMonths?: number }) => Promise<AIAnalysis>;
  getAISuggestions: (goalId: string) => Promise<AIsuggestion>;
  generateTrajectory: (goalId: string) => Promise<any>;
  
  // Actions - Overview & Stats
  loadOverview: () => Promise<void>;
  loadStats: () => Promise<void>;
  
  // Actions - Undo
  undoDelete: () => void;
  
  // Utility
  clearError: () => void;
  resetState: () => void;
}

const useCareerStore = create<CareerState>((set, get) => ({
  // Initial State
  currentGoal: null,
  goals: [],
  milestones: [],
  skillGaps: [],
  resources: [],
  overview: null,
  stats: null,
  isLoading: false,
  isAnalyzing: false,
  error: null,
  undoStack: null,

  // ========================================
  // GOALS ACTIONS
  // ========================================

  loadGoals: async (status?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get('/career/goals', { params });
      set({ goals: (response.data as any).goals, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to load goals', isLoading: false });
      throw error;
    }
  },

  createGoal: async (data: CreateGoalInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/career/goals', data);
      const newGoal = (response.data as any).goal;
      set((state) => ({
        goals: [newGoal, ...state.goals],
        currentGoal: newGoal,
        isLoading: false
      }));
      return newGoal;
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to create goal', isLoading: false });
      throw error;
    }
  },

  updateGoal: async (id: string, data: Partial<CareerGoal>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put(`/career/goals/${id}`, data);
      const updatedGoal = (response.data as any).goal;
      set((state) => ({
        goals: state.goals.map(g => g.id === id ? updatedGoal : g),
        currentGoal: state.currentGoal?.id === id ? updatedGoal : state.currentGoal,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to update goal', isLoading: false });
      throw error;
    }
  },

  deleteGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/career/goals/${id}`);
      set((state) => ({
        goals: state.goals.filter(g => g.id !== id),
        currentGoal: state.currentGoal?.id === id ? null : state.currentGoal,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to delete goal', isLoading: false });
      throw error;
    }
  },

  setCurrentGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/career/goals/${id}`);
      const goalData = (response.data as any).goal;
      set((state) => ({
        currentGoal: goalData,
        goals: state.goals.map(g => g.id === id ? goalData : g),
        milestones: goalData.milestones || [],
        skillGaps: goalData.skillGaps || [],
        resources: goalData.learningResources || [],
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to load goal', isLoading: false });
      throw error;
    }
  },

  updateGoalProgress: async (id: string, progress: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch(`/career/goals/${id}/progress`, { progress });
      const updatedGoal = (response.data as any).goal;
      set((state) => ({
        goals: state.goals.map(g => g.id === id ? updatedGoal : g),
        currentGoal: state.currentGoal?.id === id ? updatedGoal : state.currentGoal,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to update progress', isLoading: false });
      throw error;
    }
  },

  // ========================================
  // MILESTONES ACTIONS
  // ========================================

  loadMilestones: async (goalId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/career/goals/${goalId}/milestones`);
      set({ milestones: (response.data as any).milestones, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to load milestones', isLoading: false });
      throw error;
    }
  },

  createMilestone: async (goalId: string, data: CreateMilestoneInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/career/goals/${goalId}/milestones`, data);
      const newMilestone = (response.data as any).milestone;
      set((state) => ({
        milestones: [...state.milestones, newMilestone],
        currentGoal: state.currentGoal ? {
          ...state.currentGoal,
          milestones: [...(state.currentGoal.milestones || []), newMilestone]
        } : null,
        isLoading: false
      }));
      return newMilestone;
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to create milestone', isLoading: false });
      throw error;
    }
  },

  updateMilestone: async (goalId: string, milestoneId: string, data: Partial<Milestone>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put(`/career/goals/${goalId}/milestones/${milestoneId}`, data);
      const updatedMilestone = (response.data as any).milestone;
      set((state) => ({
        milestones: state.milestones.map(m => m.id === milestoneId ? updatedMilestone : m),
        currentGoal: state.currentGoal ? {
          ...state.currentGoal,
          milestones: state.currentGoal.milestones?.map(m => m.id === milestoneId ? updatedMilestone : m)
        } : null,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to update milestone', isLoading: false });
      throw error;
    }
  },

  deleteMilestone: async (goalId: string, milestoneId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Find and store the milestone for undo
      const milestone = get().milestones.find(m => m.id === milestoneId);
      if (!milestone) throw new Error('Milestone not found');

      // Optimistically remove from UI
      set((state) => ({
        milestones: state.milestones.filter(m => m.id !== milestoneId),
        currentGoal: state.currentGoal ? {
          ...state.currentGoal,
          milestones: state.currentGoal.milestones?.filter(m => m.id !== milestoneId)
        } : null,
        isLoading: false
      }));

      // Clear any existing undo timeout
      if (get().undoStack?.timeout) {
        clearTimeout(get().undoStack!.timeout);
      }

      // Set up undo state with auto-delete after 5 seconds
      const timeout = setTimeout(async () => {
        try {
          // Permanently delete after timeout
          await apiClient.delete(`/career/goals/${goalId}/milestones/${milestoneId}`);
          set({ undoStack: null });
        } catch (error) {
          console.error('Failed to permanently delete milestone:', error);
          set({ undoStack: null });
        }
      }, 5000);

      set({ 
        undoStack: { 
          type: 'milestone', 
          data: milestone, 
          goalId,
          timeout 
        } 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to delete milestone', isLoading: false });
      throw error;
    }
  },

  completeMilestone: async (goalId: string, milestoneId: string, evidence?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch(
        `/career/goals/${goalId}/milestones/${milestoneId}/complete`,
        { evidence }
      );
      const updatedMilestone = (response.data as any).milestone;
      set((state) => ({
        milestones: state.milestones.map(m => m.id === milestoneId ? updatedMilestone : m),
        currentGoal: state.currentGoal ? {
          ...state.currentGoal,
          milestones: state.currentGoal.milestones?.map(m => m.id === milestoneId ? updatedMilestone : m)
        } : null,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to complete milestone', isLoading: false });
      throw error;
    }
  },

  fetchGoalById: async (id: string) => {
    return get().setCurrentGoal(id);
  },

  updateMilestoneProgress: async (goalId: string, milestoneId: string, progress: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch(
        `/career/goals/${goalId}/milestones/${milestoneId}/progress`,
        { progress }
      );
      const updatedMilestone = (response.data as any).milestone;
      set((state) => ({
        milestones: state.milestones.map(m => m.id === milestoneId ? updatedMilestone : m),
        currentGoal: state.currentGoal ? {
          ...state.currentGoal,
          milestones: state.currentGoal.milestones?.map(m => m.id === milestoneId ? updatedMilestone : m)
        } : null,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to update progress', isLoading: false });
      throw error;
    }
  },

  // ========================================
  // SKILL GAPS ACTIONS
  // ========================================

  loadSkillGaps: async (goalId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/career/goals/${goalId}/skills`);
      set({ skillGaps: (response.data as any).skillGaps, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to load skill gaps', isLoading: false });
      throw error;
    }
  },

  createSkillGap: async (goalId: string, data: CreateSkillGapInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/career/goals/${goalId}/skills`, data);
      const newSkill = (response.data as any).skillGap;
      set((state) => ({
        skillGaps: [...state.skillGaps, newSkill],
        currentGoal: state.currentGoal ? {
          ...state.currentGoal,
          skillGaps: [...(state.currentGoal.skillGaps || []), newSkill]
        } : null,
        isLoading: false
      }));
      return newSkill;
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to create skill gap', isLoading: false });
      throw error;
    }
  },

  updateSkillGap: async (goalId: string, skillId: string, data: Partial<SkillGap>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put(`/career/goals/${goalId}/skills/${skillId}`, data);
      const updatedSkill = (response.data as any).skillGap;
      set((state) => ({
        skillGaps: state.skillGaps.map(s => s.id === skillId ? updatedSkill : s),
        currentGoal: state.currentGoal ? {
          ...state.currentGoal,
          skillGaps: state.currentGoal.skillGaps?.map(s => s.id === skillId ? updatedSkill : s)
        } : null,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to update skill gap', isLoading: false });
      throw error;
    }
  },

  deleteSkillGap: async (goalId: string, skillId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Find and store the skill for undo
      const skill = get().skillGaps.find(s => s.id === skillId);
      if (!skill) throw new Error('Skill not found');

      // Optimistically remove from UI
      set((state) => ({
        skillGaps: state.skillGaps.filter(s => s.id !== skillId),
        currentGoal: state.currentGoal ? {
          ...state.currentGoal,
          skillGaps: state.currentGoal.skillGaps?.filter(s => s.id !== skillId)
        } : null,
        isLoading: false
      }));

      // Clear any existing undo timeout
      if (get().undoStack?.timeout) {
        clearTimeout(get().undoStack!.timeout);
      }

      // Set up undo state with auto-delete after 5 seconds
      const timeout = setTimeout(async () => {
        try {
          await apiClient.delete(`/career/goals/${goalId}/skills/${skillId}`);
          set({ undoStack: null });
        } catch (error) {
          console.error('Failed to permanently delete skill:', error);
          set({ undoStack: null });
        }
      }, 5000);

      set({ 
        undoStack: { 
          type: 'skill', 
          data: skill, 
          goalId,
          timeout 
        } 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to delete skill gap', isLoading: false });
      throw error;
    }
  },

  updateSkillProgress: async (goalId: string, skillId: string, progress: number, currentLevel?: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch(
        `/career/goals/${goalId}/skills/${skillId}/progress`,
        { progress, currentLevel }
      );
      const updatedSkill = (response.data as any).skillGap;
      set((state) => ({
        skillGaps: state.skillGaps.map(s => s.id === skillId ? updatedSkill : s),
        currentGoal: state.currentGoal ? {
          ...state.currentGoal,
          skillGaps: state.currentGoal.skillGaps?.map(s => s.id === skillId ? updatedSkill : s)
        } : null,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to update skill progress', isLoading: false });
      throw error;
    }
  },

  // ========================================
  // RESOURCES ACTIONS
  // ========================================

  loadResources: async (goalId: string, status?: string, type?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params: any = {};
      if (status) params.status = status;
      if (type) params.type = type;
      const response = await apiClient.get(`/career/goals/${goalId}/resources`, { params });
      set({ resources: (response.data as any).resources, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to load resources', isLoading: false });
      throw error;
    }
  },

  createResource: async (goalId: string, data: CreateResourceInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/career/goals/${goalId}/resources`, data);
      const newResource = (response.data as any).resource;
      set((state) => ({
        resources: [...state.resources, newResource],
        currentGoal: state.currentGoal ? {
          ...state.currentGoal,
          learningResources: [...(state.currentGoal.learningResources || []), newResource]
        } : null,
        isLoading: false
      }));
      return newResource;
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to create resource', isLoading: false });
      throw error;
    }
  },

  updateResource: async (goalId: string, resourceId: string, data: Partial<LearningResource>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put(`/career/goals/${goalId}/resources/${resourceId}`, data);
      const updatedResource = (response.data as any).resource;
      set((state) => ({
        resources: state.resources.map(r => r.id === resourceId ? updatedResource : r),
        currentGoal: state.currentGoal ? {
          ...state.currentGoal,
          learningResources: state.currentGoal.learningResources?.map(r => r.id === resourceId ? updatedResource : r)
        } : null,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to update resource', isLoading: false });
      throw error;
    }
  },

  deleteResource: async (goalId: string, resourceId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Find and store the resource for undo
      const resource = get().resources.find(r => r.id === resourceId);
      if (!resource) throw new Error('Resource not found');

      // Optimistically remove from UI
      set((state) => ({
        resources: state.resources.filter(r => r.id !== resourceId),
        currentGoal: state.currentGoal ? {
          ...state.currentGoal,
          learningResources: state.currentGoal.learningResources?.filter(r => r.id !== resourceId)
        } : null,
        isLoading: false
      }));

      // Clear any existing undo timeout
      if (get().undoStack?.timeout) {
        clearTimeout(get().undoStack!.timeout);
      }

      // Set up undo state with auto-delete after 5 seconds
      const timeout = setTimeout(async () => {
        try {
          await apiClient.delete(`/career/goals/${goalId}/resources/${resourceId}`);
          set({ undoStack: null });
        } catch (error) {
          console.error('Failed to permanently delete resource:', error);
          set({ undoStack: null });
        }
      }, 5000);

      set({ 
        undoStack: { 
          type: 'resource', 
          data: resource, 
          goalId,
          timeout 
        } 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to delete resource', isLoading: false });
      throw error;
    }
  },

  updateResourceStatus: async (goalId: string, resourceId: string, status: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch(
        `/career/goals/${goalId}/resources/${resourceId}/status`,
        { status }
      );
      const updatedResource = (response.data as any).resource;
      set((state) => ({
        resources: state.resources.map(r => r.id === resourceId ? updatedResource : r),
        currentGoal: state.currentGoal ? {
          ...state.currentGoal,
          learningResources: state.currentGoal.learningResources?.map(r => r.id === resourceId ? updatedResource : r)
        } : null,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to update resource status', isLoading: false });
      throw error;
    }
  },

  generateSkillResources: async (goalId: string, skillName: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log(`🎯 Generating resources for skill: ${skillName}`);
      const response = await apiClient.post(
        `/career/goals/${goalId}/resources/generate`,
        { skillName }
      );
      const newResources = (response.data as any).resources;
      
      // Add new resources to state
      set((state) => ({
        resources: [...state.resources, ...newResources],
        currentGoal: state.currentGoal ? {
          ...state.currentGoal,
          learningResources: [...(state.currentGoal.learningResources || []), ...newResources]
        } : null,
        isLoading: false
      }));
      
      console.log(`✅ Generated ${newResources.length} resources`);
      return newResources;
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to generate resources', isLoading: false });
      throw error;
    }
  },

  // ========================================
  // AI ACTIONS
  // ========================================

  analyzeCareerPath: async (data) => {
    set({ isAnalyzing: true, error: null });
    try {
      const response = await apiClient.post('/career/analyze', data);
      set({ isAnalyzing: false });
      return (response.data as any).analysis;
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to analyze career path', isAnalyzing: false });
      throw error;
    }
  },

  getAISuggestions: async (goalId: string) => {
    set({ isAnalyzing: true, error: null });
    try {
      const response = await apiClient.post(`/career/goals/${goalId}/suggest`);
      set({ isAnalyzing: false });
      return (response.data as any).suggestions;
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to get AI suggestions', isAnalyzing: false });
      throw error;
    }
  },

  generateTrajectory: async (goalId: string) => {
    set({ isAnalyzing: true, error: null });
    try {
      const response = await apiClient.post(`/career/goals/${goalId}/generate`);
      // Reload goal to get updated milestones and skills
      await get().setCurrentGoal(goalId);
      // Also reload all goals to update the list
      await get().loadGoals();
      set({ isAnalyzing: false });
      return (response.data as any).trajectory;
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to generate trajectory', isAnalyzing: false });
      throw error;
    }
  },

  // ========================================
  // OVERVIEW & STATS ACTIONS
  // ========================================

  loadOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/career/overview');
      set({ overview: (response.data as any).overview, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to load overview', isLoading: false });
      throw error;
    }
  },

  loadStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/career/stats');
      set({ stats: (response.data as any).stats, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to load stats', isLoading: false });
      throw error;
    }
  },

  // ========================================
  // UTILITY ACTIONS
  // ========================================

  clearError: () => set({ error: null }),

  undoDelete: () => {
    const undoData = get().undoStack;
    if (!undoData) return;

    // Clear the timeout to prevent permanent deletion
    if (undoData.timeout) {
      clearTimeout(undoData.timeout);
    }

    // Restore the item to the appropriate array
    switch (undoData.type) {
      case 'milestone':
        set((state) => ({
          milestones: [...state.milestones, undoData.data].sort((a, b) => a.order - b.order),
          currentGoal: state.currentGoal ? {
            ...state.currentGoal,
            milestones: [...(state.currentGoal.milestones || []), undoData.data].sort((a, b) => a.order - b.order)
          } : null,
          undoStack: null
        }));
        break;
      case 'skill':
        set((state) => ({
          skillGaps: [...state.skillGaps, undoData.data],
          currentGoal: state.currentGoal ? {
            ...state.currentGoal,
            skillGaps: [...(state.currentGoal.skillGaps || []), undoData.data]
          } : null,
          undoStack: null
        }));
        break;
      case 'resource':
        set((state) => ({
          resources: [...state.resources, undoData.data],
          currentGoal: state.currentGoal ? {
            ...state.currentGoal,
            learningResources: [...(state.currentGoal.learningResources || []), undoData.data]
          } : null,
          undoStack: null
        }));
        break;
    }
  },

  resetState: () => set({
    currentGoal: null,
    goals: [],
    milestones: [],
    skillGaps: [],
    resources: [],
    overview: null,
    stats: null,
    isLoading: false,
    isAnalyzing: false,
    error: null,
    undoStack: null
  })
}));

// Named export for consistent import style
export { useCareerStore };
export default useCareerStore;

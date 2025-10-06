export interface ConversationBranch {
  id: string;
  sessionId: string;
  branchFromId: string; // Message ID where this branch starts
  branchName?: string;
  messages: ChatMessage[];
  isActive: boolean;
  branchOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BranchPoint {
  messageId: string;
  messageContent: string;
  branches: ConversationBranch[];
  timestamp: string;
}

export interface ThreadingContext {
  currentBranch: ConversationBranch | null;
  mainThread: ChatMessage[];
  branches: ConversationBranch[];
  branchPoints: BranchPoint[];
  activeBranchId: string | null;
}

// Import ChatMessage type
import type { ChatMessage } from '@/store/chat';
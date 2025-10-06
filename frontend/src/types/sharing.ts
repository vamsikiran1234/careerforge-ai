export interface ShareSettings {
  id: string;
  sessionId: string;
  isPublic: boolean;
  shareLink: string;
  shareCode: string;
  expiresAt?: string;
  password?: string;
  allowedViewers?: string[];
  createdAt: string;
  viewCount: number;
  maxViews?: number;
}

export interface SharePermissions {
  canView: boolean;
  canCopy: boolean;
  canDownload: boolean;
  canComment: boolean;
}

export interface SharedConversation {
  id: string;
  title: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  shareSettings?: ShareSettings;
  permissions?: SharePermissions;
  allowScroll?: boolean;
  allowComments?: boolean;
  isPublic?: boolean;
  viewCount?: number;
  expiresAt?: string;
  createdAt?: string;
  sharedAt?: string;
  createdBy?: {
    name?: string;
    avatar?: string;
  };
  sharedBy?: {
    name?: string;
    avatar?: string;
  };
}

export interface ShareLinkOptions {
  isPublic: boolean;
  expirationDays?: number;
  password?: string;
  maxViews?: number;
  allowCopy?: boolean;
  allowDownload?: boolean;
  allowScroll?: boolean;
}

export const generateShareCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const generateShareLink = (shareCode: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/share/${shareCode}`;
};

export const validateShareCode = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code);
};

export const formatShareDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'Expired';
  } else if (diffDays === 0) {
    return 'Expires today';
  } else if (diffDays === 1) {
    return 'Expires tomorrow';
  } else {
    return `Expires in ${diffDays} days`;
  }
};

export default {
  generateShareCode,
  generateShareLink,
  validateShareCode,
  formatShareDate,
};
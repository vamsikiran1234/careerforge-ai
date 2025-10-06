import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: any;
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  
  // Auto-refresh
  startPolling: () => void;
  stopPolling: () => void;
}

let pollInterval: NodeJS.Timeout | null = null;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async (unreadOnly = false) => {
    try {
      set({ loading: true, error: null });
      
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      // Don't attempt to fetch if no token
      if (!token || token === 'null' || token === 'undefined') {
        console.log('⚠️ No valid token found, skipping notification fetch');
        set({ loading: false });
        return;
      }
      
      const response = await axios.get(
        `${API_URL}/notifications${unreadOnly ? '?unreadOnly=true' : ''}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        set({ 
          notifications: response.data.notifications,
          loading: false 
        });
      }
    } catch (error: any) {
      // Only log error if it's not a 401/403 (authentication issues)
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        console.error('Error fetching notifications:', error);
        set({ 
          error: error.response?.data?.message || 'Failed to fetch notifications',
          loading: false 
        });
      } else {
        // Silent fail for auth errors - user probably logged out
        console.log('⚠️ Authentication error fetching notifications (user may be logged out)');
        set({ loading: false });
      }
    }
  },

  fetchUnreadCount: async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      // Don't attempt to fetch if no token
      if (!token || token === 'null' || token === 'undefined') {
        console.log('⚠️ No valid token found, skipping unread count fetch');
        return;
      }
      
      const response = await axios.get(
        `${API_URL}/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        set({ unreadCount: response.data.count });
      }
    } catch (error: any) {
      // Silent fail for auth errors
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        console.error('Error fetching unread count:', error);
      }
    }
  },

  markAsRead: async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Update local state
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id
              ? { ...notif, isRead: true, readAt: new Date().toISOString() }
              : notif
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }));
      }
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      set({ error: error.response?.data?.message || 'Failed to mark as read' });
    }
  },

  markAllAsRead: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Update local state
        set((state) => ({
          notifications: state.notifications.map((notif) => ({
            ...notif,
            isRead: true,
            readAt: new Date().toISOString()
          })),
          unreadCount: 0
        }));
      }
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      set({ error: error.response?.data?.message || 'Failed to mark all as read' });
    }
  },

  deleteNotification: async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/notifications/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Update local state
        set((state) => {
          const deletedNotif = state.notifications.find((n) => n.id === id);
          return {
            notifications: state.notifications.filter((notif) => notif.id !== id),
            unreadCount: deletedNotif && !deletedNotif.isRead
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount
          };
        });
      }
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      set({ error: error.response?.data?.message || 'Failed to delete notification' });
    }
  },

  deleteAllNotifications: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/notifications/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        set({ notifications: [], unreadCount: 0 });
      }
    } catch (error: any) {
      console.error('Error deleting all notifications:', error);
      set({ error: error.response?.data?.message || 'Failed to delete all notifications' });
    }
  },

  startPolling: () => {
    // Fetch immediately
    get().fetchUnreadCount();
    
    // Then poll every 30 seconds
    if (!pollInterval) {
      pollInterval = setInterval(() => {
        get().fetchUnreadCount();
      }, 30000); // 30 seconds
    }
  },

  stopPolling: () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }
}));

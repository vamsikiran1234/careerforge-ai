import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  autoConnect?: boolean;
}

interface SocketMessage {
  roomId: number;
  content: string;
  messageType: string;
  senderId: number;
  createdAt: string;
}

interface TypingEvent {
  userId: number;
  roomId: number;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { autoConnect = true } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    // Get token from localStorage
    let token = localStorage.getItem('token');
    if (!token) {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token;
        } catch (err) {
          console.error('Failed to parse auth storage:', err);
        }
      }
    }

    if (!token) {
      setError('No authentication token found');
      return;
    }

    // Initialize Socket.io connection
    const socket = io(import.meta.env.VITE_API_URL.replace('/api/v1', ''), {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Socket.io connected');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket.io disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.io connection error:', err);
      setError(err.message);
      setIsConnected(false);
    });

    socket.on('error', (err) => {
      console.error('Socket.io error:', err);
      setError(err.message);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [autoConnect]);

  // Join a chat room
  const joinRoom = (roomId: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-room', roomId);
      console.log(`📥 Joined room ${roomId}`);
    }
  };

  // Leave a chat room
  const leaveRoom = (roomId: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-room', roomId);
      console.log(`📤 Left room ${roomId}`);
    }
  };

  // Send a message
  const sendMessage = (roomId: number, content: string, messageType: string = 'TEXT') => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-message', {
        roomId,
        content,
        messageType,
      });
    }
  };

  // Start typing indicator
  const startTyping = (roomId: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing-start', { roomId });
    }
  };

  // Stop typing indicator
  const stopTyping = (roomId: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing-stop', { roomId });
    }
  };

  // Mark messages as read
  const markAsRead = (roomId: number, messageIds: number[]) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('mark-read', { roomId, messageIds });
    }
  };

  // Subscribe to new messages
  const onNewMessage = (callback: (message: SocketMessage) => void) => {
    if (socketRef.current) {
      socketRef.current.on('new-message', callback);
      return () => {
        socketRef.current?.off('new-message', callback);
      };
    }
  };

  // Subscribe to typing events
  const onUserTyping = (callback: (data: TypingEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('user-typing', callback);
      return () => {
        socketRef.current?.off('user-typing', callback);
      };
    }
  };

  // Subscribe to stop typing events
  const onUserStopTyping = (callback: (data: TypingEvent) => void) => {
    if (socketRef.current) {
      socketRef.current.on('user-stop-typing', callback);
      return () => {
        socketRef.current?.off('user-stop-typing', callback);
      };
    }
  };

  // Subscribe to read receipts
  const onMessagesRead = (callback: (data: { userId: number; roomId: number; messageIds?: number[] }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('messages-read', callback);
      return () => {
        socketRef.current?.off('messages-read', callback);
      };
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    error,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    onNewMessage,
    onUserTyping,
    onUserStopTyping,
    onMessagesRead,
  };
};

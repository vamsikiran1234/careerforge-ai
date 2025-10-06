import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '@/hooks/useSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Send,
  Paperclip,
  X,
  Loader2,
  CheckCheck,
  Check,
  Phone,
  Video,
  MoreVertical,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: number;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
  fileUrl?: string;
  fileName?: string;
  senderId: number;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: number;
    name: string;
    email: string;
  };
}

interface ChatWindowProps {
  roomId: number;
  otherUser: {
    id: number;
    name: string;
    email: string;
  };
  currentUserId: number;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  roomId,
  otherUser,
  currentUserId,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    isConnected,
    joinRoom,
    leaveRoom,
    startTyping,
    stopTyping,
    onNewMessage,
    onUserTyping,
    onUserStopTyping,
  } = useSocket();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch initial messages
  useEffect(() => {
    fetchMessages();
  }, [roomId]);

  // Join room and set up listeners
  useEffect(() => {
    if (isConnected) {
      joinRoom(roomId);

      // Mark messages as read
      markMessagesAsRead();
    }

    return () => {
      if (isConnected) {
        leaveRoom(roomId);
      }
    };
  }, [roomId, isConnected]);

  // Listen for new messages
  useEffect(() => {
    const cleanup = onNewMessage?.((message: any) => {
      if (message.roomId === roomId) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
        
        // Mark as read if it's from other user
        if (message.senderId !== currentUserId) {
          markMessagesAsRead();
        }
      }
    });

    return cleanup;
  }, [roomId, currentUserId]);

  // Listen for typing indicators
  useEffect(() => {
    const cleanupTyping = onUserTyping?.((data: any) => {
      if (data.roomId === roomId && data.userId !== currentUserId) {
        setIsTyping(true);
      }
    });

    const cleanupStopTyping = onUserStopTyping?.((data: any) => {
      if (data.roomId === roomId && data.userId !== currentUserId) {
        setIsTyping(false);
      }
    });

    return () => {
      cleanupTyping?.();
      cleanupStopTyping?.();
    };
  }, [roomId, currentUserId]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      let token = localStorage.getItem('token');
      if (!token) {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token;
        }
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/mentor-chat/rooms/${roomId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setMessages(response.data.data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      let token = localStorage.getItem('token');
      if (!token) {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token;
        }
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/mentor-chat/rooms/${roomId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      let token = localStorage.getItem('token');
      if (!token) {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token;
        }
      }

      // Send via HTTP API
      await axios.post(
        `${import.meta.env.VITE_API_URL}/mentor-chat/rooms/${roomId}/messages`,
        {
          content: newMessage,
          messageType: 'TEXT',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewMessage('');
      stopTyping(roomId);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    // Start typing indicator
    if (value.trim() && isConnected) {
      startTyping(roomId);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(roomId);
      }, 2000);
    } else if (!value.trim()) {
      stopTyping(roomId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach((message) => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <CardHeader className="border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {otherUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-lg">{otherUser.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={isConnected ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {isConnected ? 'Online' : 'Offline'}
                  </Badge>
                  {isTyping && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      typing...
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="rounded-full">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full">
                <MoreVertical className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <p className="text-lg">No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            <>
              {Object.entries(messageGroups).map(([date, msgs]) => (
                <div key={date}>
                  {/* Date Separator */}
                  <div className="flex items-center justify-center my-4">
                    <div className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
                      {date}
                    </div>
                  </div>

                  {/* Messages for this date */}
                  {msgs.map((message) => {
                    const isSender = message.senderId === currentUserId;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-3`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isSender
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="break-words">{message.content}</p>
                          <div
                            className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                              isSender ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            <span>
                              {formatDistanceToNow(new Date(message.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                            {isSender && (
                              <span>
                                {message.isRead ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="rounded-full">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
              disabled={!isConnected}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending || !isConnected}
              className="rounded-full"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          {!isConnected && (
            <p className="text-xs text-red-500 mt-2">
              Disconnected from chat server. Trying to reconnect...
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

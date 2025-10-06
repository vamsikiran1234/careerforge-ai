import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  MessageCircle,
  Loader2,
  Users,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ChatWindow } from './ChatWindow';
import { useSocket } from '@/hooks/useSocket';

interface ChatRoom {
  id: number;
  connectionId: number;
  otherUser: {
    id: number;
    name: string;
    email: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: number;
  } | null;
  unreadCount: number;
  lastActivity: string;
  isActive: boolean;
}

export const ChatList: React.FC = () => {
  const { connectionId } = useParams<{ connectionId?: string }>();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const { isConnected, onNewMessage } = useSocket();

  useEffect(() => {
    fetchChatRooms();
    getCurrentUser();
  }, []);

  // Auto-select room when connectionId is provided in URL
  useEffect(() => {
    if (connectionId && rooms.length > 0 && !selectedRoom) {
      const room = rooms.find(r => r.connectionId === parseInt(connectionId));
      if (room) {
        handleRoomClick(room);
      }
    }
  }, [connectionId, rooms, selectedRoom]);

  useEffect(() => {
    // Filter rooms based on search query
    if (searchQuery.trim()) {
      const filtered = rooms.filter((room) =>
        room.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.otherUser.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRooms(filtered);
    } else {
      setFilteredRooms(rooms);
    }
  }, [searchQuery, rooms]);

  // Listen for new messages and update room list
  useEffect(() => {
    const cleanup = onNewMessage?.((message: any) => {
      // Update the lastMessage and unread count for the room
      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room.id === message.roomId) {
            return {
              ...room,
              lastMessage: {
                content: message.content,
                createdAt: message.createdAt,
                senderId: message.senderId,
              },
              unreadCount: message.senderId !== currentUserId 
                ? room.unreadCount + 1 
                : room.unreadCount,
              lastActivity: message.createdAt,
            };
          }
          return room;
        }).sort((a, b) => 
          new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
        )
      );
    });

    return cleanup;
  }, [currentUserId]);

  const getCurrentUser = () => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        setCurrentUserId(parsed.state?.user?.id);
      } catch (err) {
        console.error('Failed to get current user:', err);
      }
    }
  };

  const fetchChatRooms = async () => {
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
        `${import.meta.env.VITE_API_URL}/mentor-chat/rooms`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setRooms(response.data.data);
        setFilteredRooms(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomClick = (room: ChatRoom) => {
    setSelectedRoom(room);
    
    // Reset unread count for this room
    setRooms((prevRooms) =>
      prevRooms.map((r) => (r.id === room.id ? { ...r, unreadCount: 0 } : r))
    );
  };

  const handleCloseChat = () => {
    setSelectedRoom(null);
    // Refresh room list to get updated unread counts
    fetchChatRooms();
  };

  const getTotalUnreadCount = () => {
    return rooms.reduce((total, room) => total + room.unreadCount, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Messages
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Chat with your mentors and mentees
        </p>
      </div>

      <Card>
        <CardHeader className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-6 w-6" />
              <span>Conversations</span>
              {getTotalUnreadCount() > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {getTotalUnreadCount()}
                </Badge>
              )}
            </CardTitle>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <Users className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No conversations yet</p>
              <p className="text-sm">
                {searchQuery
                  ? 'No conversations match your search'
                  : 'Start connecting with mentors to begin chatting'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredRooms.map((room) => {
                const lastMessageTime = room.lastMessage
                  ? formatDistanceToNow(new Date(room.lastMessage.createdAt), {
                      addSuffix: true,
                    })
                  : 'No messages yet';

                const isLastMessageFromMe = room.lastMessage?.senderId === currentUserId;

                return (
                  <button
                    key={room.id}
                    onClick={() => handleRoomClick(room)}
                    className="w-full px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {room.otherUser.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {room.otherUser.name}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                            {lastMessageTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {room.lastMessage ? (
                              <>
                                {isLastMessageFromMe && 'You: '}
                                {room.lastMessage.content}
                              </>
                            ) : (
                              <span className="italic">No messages yet</span>
                            )}
                          </p>
                          {room.unreadCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="ml-2 flex-shrink-0"
                            >
                              {room.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Window Modal */}
      {selectedRoom && currentUserId && (
        <ChatWindow
          roomId={selectedRoom.id}
          otherUser={selectedRoom.otherUser}
          currentUserId={currentUserId}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};

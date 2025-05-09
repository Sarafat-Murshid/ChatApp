import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  messages: Message[];
  sendMessage: (content: string) => void;
  onlineUsers: User[];
  friends: string[];
  privateMessages: Map<string, Message[]>;
  searchUsers: (term: string) => Promise<User[]>;
  addFriend: (friendId: string) => void;
  sendPrivateMessage: (recipientId: string, content: string) => void;
  getPrivateMessages: (friendId: string) => Promise<Message[]>;
}

export interface Message {
  id: string;
  sender: string;
  senderId: string;
  content: string;
  timestamp: number;
  roomId?: string;
}

export interface User {
  id: string;
  username: string;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [privateMessages, setPrivateMessages] = useState<Map<string, Message[]>>(new Map());
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const socketInstance = io('http://localhost:3001', {
        query: { userId: currentUser.id, username: currentUser.username },
      });

      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        console.log('Connected to socket server');
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from socket server');
        setIsConnected(false);
      });

      socketInstance.on('message', (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });

      socketInstance.on('initialMessages', (initialMessages: Message[]) => {
        setMessages(initialMessages);
      });

      socketInstance.on('onlineUsers', (users: User[]) => {
        setOnlineUsers(users);
      });

      socketInstance.on('friends', (friendList: string[]) => {
        setFriends(friendList);
      });

      socketInstance.on('privateMessage', (message: Message) => {
        setPrivateMessages((prev) => {
          const newMap = new Map(prev);
          const roomId = message.roomId!;
          const messages = newMap.get(roomId) || [];
          newMap.set(roomId, [...messages, message]);
          return newMap;
        });
      });

      return () => {
        socketInstance.disconnect();
      };
    } else if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setMessages([]);
      setOnlineUsers([]);
      setFriends([]);
      setPrivateMessages(new Map());
    }
  }, [isAuthenticated, currentUser]);

  const searchUsers = async (term: string): Promise<User[]> => {
    return new Promise((resolve) => {
      if (socket) {
        socket.emit('searchUser', term, (users: User[]) => {
          resolve(users);
        });
      } else {
        resolve([]);
      }
    });
  };

  const addFriend = (friendId: string) => {
    if (socket) {
      socket.emit('addFriend', friendId);
    }
  };

  const sendPrivateMessage = (recipientId: string, content: string) => {
    if (socket && currentUser && content.trim()) {
      socket.emit('privateMessage', { recipientId, content });
    }
  };

  const getPrivateMessages = async (friendId: string): Promise<Message[]> => {
    return new Promise((resolve) => {
      if (socket) {
        socket.emit('getPrivateMessages', friendId, (messages: Message[]) => {
          const roomId = [currentUser?.id, friendId].sort().join('-');
          setPrivateMessages((prev) => {
            const newMap = new Map(prev);
            newMap.set(roomId, messages);
            return newMap;
          });
          resolve(messages);
        });
      } else {
        resolve([]);
      }
    });
  };

  const sendMessage = (content: string) => {
    if (socket && currentUser && content.trim()) {
      const message = {
        id: Date.now().toString(),
        sender: currentUser.username,
        senderId: currentUser.id,
        content,
        timestamp: Date.now(),
      };

      socket.emit('message', message);
    }
  };

  const value = {
    socket,
    isConnected,
    messages,
    sendMessage,
    onlineUsers,
    friends,
    privateMessages,
    searchUsers,
    addFriend,
    sendPrivateMessage,
    getPrivateMessages,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
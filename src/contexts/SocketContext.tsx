import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  messages: Message[];
  sendMessage: (content: string) => void;
  onlineUsers: string[];
}

export interface Message {
  id: string;
  sender: string;
  senderId: string;
  content: string;
  timestamp: number;
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
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Connect to WebSocket server
      const socketInstance = io('http://localhost:3001', {
        query: { userId: currentUser.id, username: currentUser.username },
      });

      setSocket(socketInstance);

      // Socket event handlers
      socketInstance.on('connect', () => {
        console.log('Connected to socket server');
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from socket server');
        setIsConnected(false);
      });

      socketInstance.on('message', (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      socketInstance.on('initialMessages', (initialMessages: Message[]) => {
        setMessages(initialMessages);
      });

      socketInstance.on('onlineUsers', (users: string[]) => {
        setOnlineUsers(users);
      });

      // Clean up on unmount
      return () => {
        socketInstance.disconnect();
      };
    } else if (socket) {
      // Disconnect when logging out
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setMessages([]);
      setOnlineUsers([]);
    }
  }, [isAuthenticated, currentUser]);

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
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
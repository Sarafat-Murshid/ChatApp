import React, { useState, useRef, useEffect } from 'react';
import { Users, Send, LogOut, Settings, Menu, X } from 'lucide-react';
import Button from '../components/Button';
import TextField from '../components/TextField';
import Message from '../components/Message';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';

const Chat: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { messages, sendMessage, isConnected, onlineUsers } = useSocket();
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-primary-600 text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="block md:hidden mr-4"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-xl font-bold">ChatApp</h1>
          <div className="ml-4 text-primary-200 flex items-center text-sm">
            <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            className="p-2"
            onClick={handleLogout}
          >
            <LogOut size={18} />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`
            bg-white shadow-md w-64 flex-shrink-0 flex flex-col 
            ${isSidebarOpen ? 'block absolute z-10 h-full md:relative' : 'hidden md:flex'}
          `}
        >
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-medium text-primary-800 flex items-center gap-2">
              <Users size={18} />
              Online Users ({onlineUsers.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {onlineUsers.map((user) => (
              <div key={user} className="p-2 hover:bg-gray-100 rounded-md flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>{user}</span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-gray-700">
              <Settings size={16} />
              <span className="text-sm font-medium">
                Logged in as <span className="text-primary-700">{currentUser?.username}</span>
              </span>
            </div>
          </div>
        </aside>

        {/* Main chat area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <Message key={message.id} message={message} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <TextField
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                fullWidth
                className="m-0"
              />
              <Button type="submit" variant="primary" disabled={!isConnected}>
                <Send size={18} />
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chat;
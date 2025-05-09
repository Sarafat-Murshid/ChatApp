import React, { useState, useRef, useEffect } from 'react';
import { Users, Send, LogOut, Settings, Menu, X, Search, UserPlus, MessageCircle } from 'lucide-react';
import Button from '../components/Button';
import TextField from '../components/TextField';
import Message from '../components/Message';
import { useAuth } from '../contexts/AuthContext';
import { useSocket, User } from '../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';

const Chat: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { 
    messages, 
    sendMessage, 
    isConnected, 
    onlineUsers,
    searchUsers,
    addFriend,
    friends,
    sendPrivateMessage,
    getPrivateMessages,
    privateMessages
  } = useSocket();
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, privateMessages]);

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      const results = await searchUsers(searchTerm);
      setSearchResults(results);
    }
  };

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleSearch();
    }
  };

  const handleAddFriend = (friendId: string) => {
    addFriend(friendId);
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      if (selectedFriend) {
        sendPrivateMessage(selectedFriend, messageInput);
      } else {
        sendMessage(messageInput);
      }
      setMessageInput('');
    }
  };

  const handleSelectFriend = async (friendId: string) => {
    setSelectedFriend(friendId);
    await getPrivateMessages(friendId);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getCurrentMessages = () => {
    if (selectedFriend) {
      const roomId = [currentUser?.id, selectedFriend].sort().join('-');
      return privateMessages.get(roomId) || [];
    }
    return messages;
  };

  const getFriendName = (friendId: string) => {
    return onlineUsers.find(user => user.id === friendId)?.username || 'Unknown User';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
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
        <aside 
          className={`
            bg-white shadow-md w-64 flex-shrink-0 flex flex-col 
            ${isSidebarOpen ? 'block absolute z-10 h-full md:relative' : 'hidden md:flex'}
          `}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600"
              >
                <Search size={18} />
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mb-4 bg-gray-50 rounded-md p-2">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Search Results</h3>
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 hover:bg-white rounded-md transition-colors duration-150">
                    <span className="text-sm">{user.username}</span>
                    <Button
                      variant="secondary"
                      onClick={() => handleAddFriend(user.id)}
                      className="p-1"
                    >
                      <UserPlus size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <h2 className="font-medium text-primary-800 flex items-center gap-2">
              <Users size={18} />
              Friends ({friends.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div 
              className={`p-2 hover:bg-gray-100 rounded-md flex items-center cursor-pointer ${!selectedFriend ? 'bg-gray-100' : ''}`}
              onClick={() => setSelectedFriend(null)}
            >
              <MessageCircle size={16} className="mr-2" />
              <span>Group Chat</span>
            </div>
            {friends.map((friendId) => (
              <div 
                key={friendId}
                className={`p-2 hover:bg-gray-100 rounded-md flex items-center cursor-pointer ${selectedFriend === friendId ? 'bg-gray-100' : ''}`}
                onClick={() => handleSelectFriend(friendId)}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>{getFriendName(friendId)}</span>
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

        <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">
              {selectedFriend ? `Chat with ${getFriendName(selectedFriend)}` : 'Group Chat'}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {getCurrentMessages().length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              getCurrentMessages().map((message) => (
                <Message key={message.id} message={message} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

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
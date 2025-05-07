import React from 'react';
import { Message as MessageType } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { currentUser } = useAuth();
  const isOwnMessage = currentUser?.id === message.senderId;
  
  // Format timestamp
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`mb-3 animate-slide-up ${
        isOwnMessage ? 'flex justify-end' : 'flex justify-start'
      }`}
    >
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${
          isOwnMessage
            ? 'bg-primary-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        {!isOwnMessage && (
          <div className="text-xs font-semibold mb-1 text-primary-700">
            {message.sender}
          </div>
        )}
        <div className="break-words">{message.content}</div>
        <div
          className={`text-xs mt-1 text-right ${
            isOwnMessage ? 'text-primary-100' : 'text-gray-500'
          }`}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default Message;
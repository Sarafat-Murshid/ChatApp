import React, { useEffect, useState } from 'react';

interface ChatProps {
  friendId: string;
  socket: WebSocket;
}

const Chat: React.FC<ChatProps> = ({ friendId, socket }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.sender === friendId || message.receiver === friendId) {
        setMessages((prev) => [...prev, message.text]);
      }
    };
  }, [socket, friendId]);

  const sendMessage = () => {
    const message = { receiver: friendId, text: newMessage };
    socket.send(JSON.stringify(message));
    setMessages((prev) => [...prev, newMessage]);
    setNewMessage('');
  };

  return (
    <div>
      <h2>Chat with {friendId}</h2>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
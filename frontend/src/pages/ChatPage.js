import React, { useState, useEffect } from 'react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import '../styles/ChatPage.css';

const ChatPage = () => {
  const [selectedChatId, setSelectedChatId] = useState(() => {
    return localStorage.getItem('selectedChatId') || null;
  });

  useEffect(() => {
    if (selectedChatId) {
      localStorage.setItem('selectedChatId', selectedChatId);
    }
  }, [selectedChatId]);

  return (
    <div className="chat-page-container">
      <div className="chat-page">
        <ChatList onSelectChat={setSelectedChatId} />
        <ChatWindow selectedChatId={selectedChatId} />
      </div>
    </div>
  );
};

export default ChatPage;
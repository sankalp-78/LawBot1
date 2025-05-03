import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ChatList.css';

const ChatList = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get('http://localhost:4500/api/chat/list', {
          headers: { 'x-auth-token': token },
        });
        setChats(res.data);
        // Only select a chat if none is already selected in localStorage
        const storedChatId = localStorage.getItem('selectedChatId');
        if (!storedChatId && res.data.length > 0) {
          onSelectChat(res.data[0].chatId);
        }
      } catch (err) {
        console.error('Error fetching chats:', err);
      }
    };
    if (token) fetchChats();
  }, [token, onSelectChat]);

  const handleNewChat = async () => {
    try {
      const res = await axios.post('http://localhost:4500/api/chat/new', {}, {
        headers: { 'x-auth-token': token },
      });
      setChats([{ chatId: res.data.chatId, lastMessage: 'New chat', createdAt: new Date() }, ...chats]);
      onSelectChat(res.data.chatId);
    } catch (err) {
      console.error('Error creating chat:', err);
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await axios.delete(`http://localhost:4500/api/chat/delete/${chatId}`, {
        headers: { 'x-auth-token': token },
      });
      setChats(chats.filter((chat) => chat.chatId !== chatId));
      const storedChatId = localStorage.getItem('selectedChatId');
      if (chatId === storedChatId) {
        localStorage.removeItem('selectedChatId');
        if (chats.length > 1) {
          const newSelectedChat = chats.find(chat => chat.chatId !== chatId);
          onSelectChat(newSelectedChat ? newSelectedChat.chatId : null);
        } else {
          onSelectChat(null);
        }
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
    }
  };

  return (
    <div className="chat-list">
      <h3>Your Chats</h3>
      <button className="new-chat-btn" onClick={handleNewChat}>
        New Chat
      </button>
      {chats.length === 0 ? (
        <p className="no-chats">No chats yet</p>
      ) : (
        chats.map((chat) => (
          <div key={chat.chatId} className="chat-item">
            <div onClick={() => onSelectChat(chat.chatId)}>
              <p>{chat.lastMessage}</p>
              <small>{new Date(chat.createdAt).toLocaleString()}</small>
            </div>
            <button className="delete-btn" onClick={() => handleDeleteChat(chat.chatId)}>
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatList;
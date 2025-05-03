import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './FileUpload';
import ReactMarkdown from 'react-markdown';
import '../styles/ChatWindow.css';

const ChatWindow = ({ selectedChatId }) => {
  const [chatId, setChatId] = useState(selectedChatId);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('legal');
  const token = localStorage.getItem('token');
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        if (selectedChatId) {
          // If there's a selectedChatId, fetch its history
          const res = await axios.get(
            `http://localhost:4500/api/chat/history/${selectedChatId}`,
            { headers: { 'x-auth-token': token } }
          );
          setChatId(selectedChatId);
          setMessages(res.data);
          setDisplayedMessages(res.data.map(msg => ({ ...msg, displayedContent: msg.content })));
        } else {
          // Only create a new chat if there are no chats at all (checked later)
          const res = await axios.get(
            'http://localhost:4500/api/chat/list',
            { headers: { 'x-auth-token': token } }
          );
          if (res.data.length === 0) {
            const newChatRes = await axios.post(
              'http://localhost:4500/api/chat/new',
              {},
              { headers: { 'x-auth-token': token } }
            );
            setChatId(newChatRes.data.chatId);
            setMessages([]);
            setDisplayedMessages([]);
          }
        }
      } catch (err) {
        console.error('Error fetching chat data:', err);
      }
    };
    if (token) fetchChatData();
  }, [token, selectedChatId]);

  useEffect(() => {
    setChatId(selectedChatId);
  }, [selectedChatId]);

  const handleSendMessage = async () => {
    if (!input.trim() || !chatId) return;

    const newMessage = { sender: 'user', content: input, isFading: true };
    setMessages([...messages, newMessage]);
    setDisplayedMessages([...displayedMessages, { ...newMessage, displayedContent: newMessage.content }]);
    setInput('');
    setIsResponding(true);

    try {
      const res = await axios.post(
        'http://localhost:4500/api/chat/message',
        { message: input, chatId, mode },
        { headers: { 'x-auth-token': token } }
      );
      const botMessage = { sender: 'bot', content: res.data.reply, displayedContent: '' };
      setMessages([...messages, newMessage, { sender: 'bot', content: res.data.reply }]);
      setDisplayedMessages([...displayedMessages, { ...newMessage, displayedContent: newMessage.content }, botMessage]);

      let currentText = '';
      const fullText = res.data.reply;
      let index = 0;

      const type = () => {
        if (index === 0) setIsResponding(false);
        if (index < fullText.length) {
          currentText += fullText[index];
          setDisplayedMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].displayedContent = currentText;
            return updated;
          });
          index++;
          setTimeout(type, 20);
        }
      };
      type();
    } catch (err) {
      console.error('Error sending message:', err);
      setIsResponding(false);
    }
  };

  const handleUpload = (newMessages) => {
    setMessages((prev) => [...prev, ...newMessages]);
    setDisplayedMessages((prev) => [...prev, ...newMessages.map(msg => ({ ...msg, displayedContent: msg.content }))]);
  };

  return (
    <div className="chat-window">
      <div className="select-mode-section">
        <h2>Select Mode</h2>
        <select id="mode" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="legal">Legal Assistant</option>
          <option value="financial">Financial Advisor</option>
        </select>
      </div>
      <div className="messages">
        {displayedMessages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender} ${msg.isFading ? 'fade-out' : ''}`}>
            <span>{msg.sender === 'user' ? 'You' : 'Bot'}: </span>
            {msg.sender === 'bot' ? (
              <ReactMarkdown>{msg.displayedContent}</ReactMarkdown>
            ) : (
              <span>{msg.displayedContent}</span>
            )}
          </div>
        ))}
        {isResponding && (
          <div className="message bot responding">
            <span>Bot: </span>
            <span>Responding...</span>
          </div>
        )}
      </div>
      <FileUpload chatId={chatId} onUpload={handleUpload} />
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
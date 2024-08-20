// components/ChatBox.js
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

let socket;

const ChatBox = ({ ticketId, messages, onSendMessage, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    socket = io();
    socket.emit('join', ticketId);

    return () => {
      socket.disconnect();
    };
  }, [ticketId]);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    const messageInput = document.querySelector(`#chat-input-${ticketId}`);
    const messageText = messageInput.value;
    onSendMessage(ticketId, messageText);
    messageInput.value = '';
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <div className="tik-sp">
          <span>Ticket ID: {ticketId}</span>
        </div>
        <button onClick={onClose} className="close-chat">X</button>
      </div>
      {isVisible && (
        <>
          <div className="chat-body">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`message ${message.sender === 'your-email@example.com' ? 'sent' : 'received'}`}
              >
                <span>{message.sender}:</span> {message.text}
                <br />
                <small>{new Date(message.createdAt).toLocaleString()}</small>
              </div>
            ))}
            <div ref={endOfMessagesRef} />
          </div>
          <div className="chat-footer">
            <input
              id={`chat-input-${ticketId}`}
              type="text"
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBox;

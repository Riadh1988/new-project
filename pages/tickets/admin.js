import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';

let socket;

export default function AdminTicketList() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('');
  const [activeChat, setActiveChat] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const endOfMessagesRef = useRef(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }

    socket = io();
  socket.on('message', (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
    scrollToBottom();
  });

  return () => {
    socket.disconnect();
  };
  }, [status, session, router]);

  useEffect(() => {
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/api/tickets/admin');
      const sortedTickets = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTickets(sortedTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const openChatBox = async (ticketId, user, type) => {
    setActiveChat({ id: ticketId, user, type }); // Store chat information
  
    try {
      const response = await axios.get(`/api/tickets/${ticketId}/messages`);
      setMessages(response.data);
      socket.emit('join', ticketId);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  
   
  

  const handleSendMessage = (ticketId, messageText) => {
    const message = {
      sender: session.user.email,
      receiver: tickets.find((ticket) => ticket._id === ticketId)?.user,
      text: messageText,
      createdAt: new Date(),
    };
  
    socket.emit('message', { ticketId, message }); 
    scrollToBottom();
  };
  
  

  const handleSendClick = (ticketId) => {
    const messageText = document.querySelector(`#chat-input-${ticketId}`).value;
    handleSendMessage(ticketId, messageText);
    document.querySelector(`#chat-input-${ticketId}`).value = '';
  };

  const closeChatBox = (ticketId) => {
    setActiveChat(null);
  };

  const updateStatus = async (id, newStatus, user, type) => {
    try {
      await axios.patch('/api/tickets/admin/update', { id, status: newStatus });
      await axios.post('/api/reply-email', {
        to: user,
        subject: `Ticket ${id} Status Update`,
        text: `Your ticket of type ${type} has been marked as ${newStatus}.`,
      });
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === id ? { ...ticket, status: newStatus } : ticket
        )
      );
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handleToggleVisibility = () => {
    setIsVisible((prevState) => !prevState);
  };

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredTickets = filter
    ? tickets.filter((ticket) => ticket.status === filter)
    : tickets;

  return (
    <Layout>
      <h1>Admin Ticket List</h1>

      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">All</option>
        <option value="in progress">In Progress</option>
        <option value="solved">Solved</option>
      </select>

      <div className="holder-card">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket._id}
            className={`card ${ticket.status === 'solved' ? 'solved' : 'in-progress'}`}
          >
            <div className="card-inner">
              <div className="ab-top">
                <span className={`sp${ticket.status === 'solved' ? 'solved' : 'in-progress'}`}>
                  {ticket.status}
                </span>
                <span className="ab-top-dt">
                  {new Date(ticket.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="card-inner-top">
                <h3><strong>{ticket.type}</strong></h3>
              </div>
              <div className="card-inner-bottom">
                {Object.entries(ticket.additionalData).map(([key, value]) => (
                  <p key={key}><strong>{key}:</strong> {formatValue(key, value)}</p>
                ))}
                <h3>Created by: <strong>{ticket.user.split('@')[0]}</strong></h3>
              </div>
            </div>

            {ticket.status !== 'solved' && (
              <div className="buttons-live">
                <button onClick={() => updateStatus(ticket._id, 'solved', ticket.user, ticket.type)}>
                  Mark as Solved
                </button>
                <button
                  className="live-chat-button"
                  onClick={() => openChatBox(ticket._id, ticket.user, ticket.type)}
                >
                  Live Chat
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="chat-boxes">
  {activeChat &&
  (
    <div className="chat-box">
      <div className="chat-header" onClick={handleToggleVisibility}>
        <div className="tik-sp">
          <span>User: {activeChat.user.split('@')[0]}</span>
          <span>Ticket Type: {activeChat.type}</span>
        </div>
        <button onClick={closeChatBox} className="close-chat">X</button>
      </div>
      {isVisible && (
        <>
          <div className="chat-body">
            {messages.map((message, index) => (
              <div
                key={index} // Use index as key if message._id is not available
                className={`message ${message.sender === session.user.email ? 'sent' : 'received'}`}
              >
                <span><strong>{message.sender.split('@')[0]}:</strong></span> <br />
                {message.text}
                <br />
                <small className='time-message'>{new Date(message.createdAt).toLocaleString()}</small>
              </div>
            ))}
            <div ref={endOfMessagesRef} />
          </div>
          <div className="chat-footer">
            <input
              id={`chat-input-${activeChat.id}`} // Use activeChat.id for input id
              type="text"
              placeholder="Type a message..."
            />
            <button onClick={() => handleSendClick(activeChat.id)}>Send</button>
          </div>
        </>
      )}
    </div>
  )}
</div>
    </Layout>
  );
}

const formatValue = (key, value) => {
  if (key === 'screenshot' && value) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer">
        Click here
      </a>
    );
  } else if (typeof value === 'string') {
    return value;
  } else if (Array.isArray(value)) {
    return value.join(', ');
  } else if (typeof value === 'object') {
    return JSON.stringify(value);
  } else if (value instanceof Date) {
    return value.toLocaleDateString();
  } else {
    return String(value);
  }
};

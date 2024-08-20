import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';

let socket;

export default function UserTicketList() {
  const [tickets, setTickets] = useState([]);
  const [activeChat, setActiveChat] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const endOfMessagesRef = useRef(null);
  const { data: session } = useSession();
  const [ticketType, setTicketType] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    socket = io();

    socket.on('message', (message) => {
      setMessages((prevMessages) => { 
        if (prevMessages.some((msg) => msg._id === message._id)) return prevMessages;
        return [...prevMessages, message];
      });
      scrollToBottom();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchTickets();
   
    const intervalId = setInterval(() => {
      fetchTickets();
    }, 5000);  
   
    return () => clearInterval(intervalId);
  }, []); 
  

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/api/tickets');
      const sortedTickets = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTickets(sortedTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: checked }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
    }
  };

  const openChatBox = async (ticketId) => {
    setActiveChat(ticketId);

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
      text: messageText,
      createdAt: new Date(),
    };
    // Emit message to socket server
    socket.emit('message', { ticketId, message });
    // Clear the message input
    document.querySelector(`#chat-input-${ticketId}`).value = '';
  };

  const handleSendClick = (ticketId) => {
    const messageText = document.querySelector(`#chat-input-${ticketId}`).value;
    handleSendMessage(ticketId, messageText);
    document.querySelector(`#chat-input-${ticketId}`).value = '';
    console.log(messageText)
  };

  const closeChatBox = (ticketId) => {
    setActiveChat(null);
  };

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggleVisibility = () => {
    setIsVisible((prevState) => !prevState);
  };
  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter === '') return true;
    return ticket.status === statusFilter;
  });
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('type', ticketType);
    Object.keys(formData).forEach((key) => {
      if (formData[key] instanceof File) {
        formDataToSend.append(key, formData[key]);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });
    formDataToSend.append('user', session.user.email);

    let emailText = `Ticket of type ${ticketType} has been created.\n\n`;
    emailText += `Ticket Opened by: ${session.user.email}\n`;
    for (const [key, value] of Object.entries(formData)) {
      if (value instanceof File) {
        emailText += `${key}: [File Attached]\n`;
      } else {
        emailText += `${key}: ${value}\n`;
      }
    }

    try {
      const res = await axios.post('/api/tickets', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await axios.post('/api/send-email', {
        to: session.user.email,
        subject: `Ticket Created: ${ticketType}`,
        text: emailText,
      });

      setFormData({});
      setTicketType('');
      fetchTickets();
    } catch (error) {
      console.error('Error submitting ticket:', error.response ? error.response.data : error.message);
    }
  }; 
  return (
    <Layout>
       <div className='tick-holder'>
      <div className='tick-left'>
      <h1>Create a Ticket</h1>
      <div>
        <label htmlFor="ticketType">Ticket Type:</label>
        <select
          id="ticketType"
          name="ticketType"
          value={ticketType}
          onChange={(e) => setTicketType(e.target.value)}
        >
          <option value="">Select Ticket Type</option>
          <option value="work from home">Work From Home</option>
          <option value="password issues">Password Issues</option>
          <option value="internet issue">Internet Issue</option>
          <option value="vpn issues">VPN Issues</option>
          <option value="request an app">Request an App</option>
          <option value="request equipment">Request Equipment</option>
          <option value="access issue">Access Issue</option>
        </select>
      </div>

      {ticketType && (
        <form onSubmit={handleSubmit}>
          {ticketType === 'work from home' && (
            <>
              <div>
                <label htmlFor="agentName">Agent Name:</label>
                <input
                  type="text"
                  id="agentName"
                  name="agentName"
                  value={formData.agentName || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Equipment:</label>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      name="keyboard"
                      checked={formData.keyboard || false}
                      onChange={handleCheckboxChange}
                    />
                    Keyboard
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="mouse"
                      checked={formData.mouse || false}
                      onChange={handleCheckboxChange}
                    />
                    Mouse
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="screen"
                      checked={formData.screen || false}
                      onChange={handleCheckboxChange}
                    />
                    Screen
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="headphones"
                      checked={formData.headphones || false}
                      onChange={handleCheckboxChange}
                    />
                    Headphones
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="wksName">WKS Name:</label>
                <input
                  type="text"
                  id="wksName"
                  name="wksName"
                  value={formData.wksName || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="vpn">VPN:</label>
                <select
                  id="vpn"
                  name="vpn"
                  value={formData.vpn || ''}
                  onChange={handleChange}
                >
                  <option value="">Select VPN Option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label htmlFor="date">Date:</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date || ''}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {ticketType === 'password issues' && (
            <>
              <div>
                <label htmlFor="passwordType">Password Type:</label>
                <select
                  id="passwordType"
                  name="passwordType"
                  value={formData.passwordType || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Password Type</option>
                  <option value="AD">Computer</option>
                  <option value="Gmail">Gmail</option>
                </select>
              </div>
              {formData.passwordType === 'Gmail' && (
                <div>
                  <label htmlFor="agentEmail">Agent Email:</label>
                  <input
                    type="email"
                    id="agentEmail"
                    name="agentEmail"
                    value={formData.agentEmail || ''}
                    onChange={handleChange}
                  />
                </div>
              )}
              {formData.passwordType === 'AD' && (
                <div>
                  <label htmlFor="agentName">Agent Name:</label>
                  <input
                    type="text"
                    id="agentName"
                    name="agentName"
                    value={formData.agentName || ''}
                    onChange={handleChange}
                  />
                </div>
              )}
            </>
          )}

          {ticketType === 'internet issue' && (
            <>
              <div>
                <label htmlFor="description">Issue Description:</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="pcName">PC Name:</label>
                <input
                  type="text"
                  id="pcName"
                  name="pcName"
                  value={formData.pcName || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="screenshot">Screenshot:</label>
                <input
                  type="file"
                  id="screenshot"
                  name="screenshot"
                  onChange={handleFileChange}
                />
              </div>
            </>
          )}

          {ticketType === 'vpn issues' && (
            <>
              <div>
                <label htmlFor="description">Issue Description:</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="pcName">PC Name:</label>
                <input
                  type="text"
                  id="pcName"
                  name="pcName"
                  value={formData.pcName || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="screenshot">Screenshot:</label>
                <input
                  type="file"
                  id="screenshot"
                  name="screenshot"
                  onChange={handleFileChange}
                />
              </div>
            </>
          )}

          {ticketType === 'request an app' && (
            <>
              <div>
                <label htmlFor="agentName">Agent Name:</label>
                <input
                  type="text"
                  id="agentName"
                  name="agentName"
                  value={formData.agentName || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="appName">Application Name:</label>
                <input
                  type="text"
                  id="appName"
                  name="appName"
                  value={formData.appName || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="applicationPurpose">Application Purpose:</label>
                <input
                  type="text"
                  id="applicationPurpose"
                  name="applicationPurpose"
                  value={formData.applicationPurpose || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="screenshot">Screenshot:</label>
                <input
                  type="file"
                  id="screenshot"
                  name="screenshot"
                  onChange={handleFileChange}
                />
              </div>
            </>
          )}

          {ticketType === 'request equipment' && (
            <>
              <div>
                <label htmlFor="equipmentName">Equipment Name:</label>
                <input
                  type="text"
                  id="equipmentName"
                  name="equipmentName"
                  value={formData.equipmentName || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="equipmentPurpose">Equipment Purpose:</label>
                <input
                  type="text"
                  id="equipmentPurpose"
                  name="equipmentPurpose"
                  value={formData.equipmentPurpose || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="screenshot">Screenshot:</label>
                <input
                  type="file"
                  id="screenshot"
                  name="screenshot"
                  onChange={handleFileChange}
                />
              </div>
            </>
          )}

          {ticketType === 'access issue' && (
            <>
              <div>
                <label htmlFor="accessType">Access Type:</label>
                <select
                  id="accessType"
                  name="accessType"
                  value={formData.accessType || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Access Type</option>
                  <option value="AD">AD</option>
                  <option value="Gmail">Gmail</option>
                </select>
              </div>
              {formData.accessType === 'AD' && (
                <div>
                  <label htmlFor="adUser">AD User:</label>
                  <input
                    type="text"
                    id="adUser"
                    name="adUser"
                    value={formData.adUser || ''}
                    onChange={handleChange}
                  />
                </div>
              )}
              {formData.accessType === 'Gmail' && (
                <div>
                  <label htmlFor="gmailEmail">Gmail Email:</label>
                  <input
                    type="email"
                    id="gmailEmail"
                    name="gmailEmail"
                    value={formData.gmailEmail || ''}
                    onChange={handleChange}
                  />
                </div>
              )}
            </>
          )}

          <button type="submit">Submit</button>
        </form>
      )}</div>
<div className='tick-right'>
      <h2>Your Tickets</h2>
      <div>
        <label htmlFor="statusFilter">Filter by Status:</label>
        <select
          id="statusFilter"
          name="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="in progress">In Progress</option>
          <option value="solved">Solved</option>
        </select>
      </div>
      
      <div className="holder-card">
        {tickets.map((ticket) => (
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
                  {new Date(ticket.createdAt).toLocaleString()}<br />
                  
                </span>
              </div>
              <div className="card-inner-top">
                <h3><strong>{ticket.type}</strong></h3> 
              </div>
              <div className="card-inner-bottom">
                {Object.entries(ticket.additionalData).map(([key, value]) => (
                  <p key={key}><strong>{key}:</strong> {formatValue(key, value)}</p>
                ))}
              </div>
              <strong> Created By {ticket.user.split('@')[0]}</strong>
            </div>

            {ticket.messages && ticket.messages.length > 0 && (
              <div className="buttons-live">
                <button
                  className="live-chat-button"
                  onClick={() => openChatBox(ticket._id)}
                >
                  Live Chat
                </button>
              </div>
            )}
            
          </div>
        ))}
      </div>
      </div>
      </div>
       

      <div className="chat-boxes">
        {activeChat && (
          <div className="chat-box">
            <div className="chat-header" onClick={handleToggleVisibility}>
              <div className="tik-sp">
                <span>Ticket ID: {activeChat}</span>
              </div>
              <button onClick={() => closeChatBox(activeChat)} className="close-chat">X</button>
            </div>
            {isVisible && (
              <>
                <div className="chat-body">
                  {messages.map((message, index) => (
                    <div
                    key={message._id}
                      className={`message ${message.sender === session.user.email ? 'sent' : 'received'}`}
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
                    id={`chat-input-${activeChat}`}
                    type="text"
                    placeholder="Type a message..."
                  />
                  <button onClick={() => handleSendClick(activeChat)}>Send</button>
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

import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function AdminTicketList() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState(''); 
  const router = useRouter();
const { data: session, status } = useSession();

useEffect(() => {
  if (status === 'authenticated' && session?.user?.role !== 'admin') {
    router.push('/');
  }
}, [status, session, router]);

// This useEffect will always run, but fetching tickets will only occur when the session is valid
useEffect(() => {
  const fetchTickets = async () => {
    try {
      const response = await axios.get('/api/tickets/admin');
      const sortedTickets = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort tickets by newest first
      setTickets(sortedTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  // Only fetch tickets if the session is authenticated
  if (status === 'authenticated') {
    fetchTickets();
  }
}, [status]);

// Return null or a loading state while checking the session
if (status === 'loading' || !session) {
  return null;
}

  const updateStatus = async (id, newStatus, user, type) => {
    try {
      await axios.patch('/api/tickets/admin/update', { id, status: newStatus });
      await axios.post('/api/reply-email', {
        to: user,
        subject: `Ticket ${id} Status Update`,
        text: `Your ticket of type ${type} has been marked as ${newStatus}.`,
      });
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket._id === id ? { ...ticket, status: newStatus } : ticket
        )
      );
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const filteredTickets = filter
    ? tickets.filter(ticket => ticket.status === filter)
    : tickets;

  return (
    <Layout>
      <h1>Admin Ticket List</h1>

      <select
        value={filter}
        onChange={e => setFilter(e.target.value)}
      >
        <option value="">All</option>
        <option value="in progress">In Progress</option>
        <option value="solved">Solved</option>
      </select>

      <div className='holder-card'>
        {filteredTickets.map(ticket => (
          <div
            key={ticket._id}
            className={`card ${ticket.status === 'solved' ? 'solved' : 'in-progress'}`}
          >
            <p><strong>Type:</strong> {ticket.type}</p>
            <p><strong>Status:</strong> {ticket.status} the {
              ticket.status === "solved" ?
              new Date(ticket.updatedAt).toLocaleString() : null
            }</p>
            <p><strong>User Email:</strong> {ticket.user}</p>
            <p><strong>Date:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>

            <div>
              {Object.entries(ticket.additionalData).map(([key, value]) => (
                <p key={key}><strong>{key}:</strong> {formatValue(key, value)}</p>
              ))}
            </div>

            {ticket.status !== 'solved' ? (
              <button onClick={() => updateStatus(ticket._id, 'solved', ticket.user, ticket.type)}>Mark as Solved</button>
            ) : null}
          </div>
        ))}
      </div>
    </Layout>
  );
}

function formatValue(key, value) {
  console.log(`Key: ${key}, Value: ${value}, Type: ${typeof value}`);

  // Convert string values 'true' and 'false' to boolean
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true') return 'Yes';
    if (lowerValue === 'false') return 'No';
  }

  // Handle boolean values
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Handle files separately
  if (key === 'files') {
    if (Array.isArray(value)) {
      return value.map((fileUrl, index) => (
        <a key={index} href={fileUrl} target="_blank" rel="noopener noreferrer">
          View File {index + 1}
        </a>
      ));
    } else {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer">
          View File
        </a>
      );
    }
  }

  // Return other values directly
  return value;
}








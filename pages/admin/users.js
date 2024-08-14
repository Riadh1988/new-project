import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const UsersPage = () => {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      if (session.user?.role !== 'admin') {
        router.push('/');
        return; 
      }
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    const response = await fetch('/api/users');
    const data = await response.json();
    setUsers(data);
  };

  const addUser = async () => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
  
    if (!response.ok) {
      console.error('Failed to add user:', await response.text());
      return;
    }
  
    fetchUsers();
    setEmail('');
    setRole('');
  };
  

  const deleteUser = async (email) => {
    const response = await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (response.ok) {
      fetchUsers();
    }
  };

  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'authenticated' && !session.user) return <p>Unauthorized</p>; // Handle cases where session.user is undefined

  return (
    <div>
      <h1>Manage Users</h1>
      {session?.user?.role === 'admin' && (
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="supervisor">Supervisor</option>
            <option value="recruitment">Recruitment</option>
          </select>
          <button onClick={addUser}>Add User</button>
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            {session?.user?.role === 'admin' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.email}>
              <td>{user.email}</td>
              <td>{user.role}</td>
              {session?.user?.role === 'admin' && (
                <td>
                  <button onClick={() => deleteUser(user.email)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersPage;

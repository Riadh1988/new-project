import { useSession, signOut } from "next-auth/react";
import Nav from "./Nav";
import { useState, useEffect } from 'react';
import axios from 'axios';
export default function Layout({ children }) {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('/api/clients');
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };


    return (
      <div className="home">
        
        <Nav clients={clients}  />
        <div className="content-home">
          <div className="userInfo">
            <div className="profileInfo" onClick={toggleDropdown}>
            
              <span className="username">{session?.user?.email}</span>
            </div>
            <div className={`dropdownMenu ${dropdownOpen ? 'open' : ''}`} > 
              <ul className="dropdownContent">
                <li onClick={() => signOut()}>Logout</li>
              </ul>
            </div>
            
          </div>
          <div className="mainContent">
            {children}
          </div>
        </div>
      </div>
    );
  }



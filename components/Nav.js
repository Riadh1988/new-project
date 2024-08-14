import Link from "next/link";
import { useRouter } from "next/router";
import { FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';

export default function Nav({ clients }) { // Receive clients as props
  const router = useRouter();
  const { pathname } = router;
  const [isNavVisible, setIsNavVisible] = useState(false);

  const toggleNavVisibility = () => {
    setIsNavVisible(!isNavVisible);
  };

  return (
    <>
      <aside className={`navContainer ${isNavVisible ? 'visible' : 'hidden'}`}>
        <Link href="/" className="brand">
          Ocean Call Group
        </Link>
      {/* <nav className="nav">
       //   {clients.map((clientItem) => (
        //    <Link 
              href={`/clients/${clientItem._id}`} 
              key={clientItem._id} 
              className={`navLink ${pathname === `/clients/${clientItem._id}` ? 'active' : ''}`}
            >
              {clientItem.client}
            </Link>
          ))}
        </nav> */}
        <Link href="/recrutement" className="addNew">
          Recrutement
        </Link>
        <Link href="/reverse" className="addNew">
          Reverses
        </Link>
        <Link href="/client" className="addNew">
          Add New Client
        </Link>
      </aside>
      <button 
        className={`navToggle ${isNavVisible ? '' : 'iconLeft'}`} 
        onClick={toggleNavVisibility}
      >
        {isNavVisible ? <FaTimes /> : <FaBars />}
      </button>
    </>
  );
}

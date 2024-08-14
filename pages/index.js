import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Link from "next/link";
const HomePage = () => {
  const { data: session, status } = useSession();

  return (
    <div>
      {status === 'loading' ? (
        <Loading/>
      ) : session ? (
        <Layout>
           <div className="contain">
    <div className="grid-item">
      <Link href="/reverse">Reverse</Link>
    </div>
    <div className="grid-item">
      <Link href="/recrutement">Recruitment</Link>
    </div>
     
    <div className="grid-item">
      <Link href="/tickets/user">Tickets users</Link>
    </div>
    <div className="grid-item">
      <Link href="/tickets/admin">Tickets admin</Link>
    </div>
    <div className="grid-item">
      <Link href="/utils">Add Utils</Link>
    </div>
    <div className="grid-item">
      <Link href="/admin/users">Add Users</Link>
    </div>
  </div>
        </Layout>
      ) : (
        <div className='signin'> 
          <Image src="/ocs-logo.png" alt="Logo" width={235} height={47} className='signin-image'/> <br/><br/>
          <button onClick={() => signIn('google')}>Sign in with Google</button>
        </div>

      )}
    </div>
  );
};

export default HomePage;

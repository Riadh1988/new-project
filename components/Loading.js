
import Image from 'next/image';
const Loading = () => {
  return (
    <div className="loadingContainer" >
    <Image src="/ocs-logo.png" alt="Logo" width={235} height={47} className='signin-image'/> <br/><br/>
      <div className="spinner"></div>
      <p>Loading...</p>
      
    </div>
  );
};

export default Loading;

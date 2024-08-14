import Layout from "../../components/Layout";
import { useState, useEffect, useRef } from 'react';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import Mammoth from 'mammoth';
import Modal from '../../components/Modal';
import ClientList from '../../components/Agt_wfh_List';
import { FaEye, FaTrashAlt } from 'react-icons/fa';
 import { useSession } from 'next-auth/react';
 import { useRouter } from 'next/router';



export default function Home() {
 
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (!session) {
      router.push('/');
      return; 
    }
  }, [session, router]);
  
  const formRef = useRef(null);
  const [computers, setComputers] = useState([])
  const [monitors, setMonitors] = useState([])
  const [headphones, setHeadphones] = useState([])
 
  const [reverseData, setReverseData] = useState({
    candidateName: '',
    lastName: '',
    wks: '',
    computer: '',
    computerSerial: '',
    monitorChecked: false,
    monitor: '',
    monitorSerial: '',
    headphonesChecked: false,
    headphones: '',
    mouse: 'no',
    keyboard: 'no',
  });

  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [counters, setCounters] = useState({
    computer: 0,
    laptop:0,
    monitor: 0,
    headphones: 0,
    mouse: 0,
    keyboard: 0,
  });

  useEffect(() => {
    fetchClients();
    fetchCounters();
    fetchComputers();
    fetchMonitors();
    fetchHeadphones();
    
  }, []); 

  useEffect(() => {
    setFilteredClients(
      clients.filter(client =>
        `${client.candidateName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, clients]);



  const fetchComputers = async () => {
    try {
      const response = await fetch('/api/clients/pc');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      setComputers(data); 
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };
  const fetchMonitors = async () => {
    try {
      const response = await fetch('/api/clients/screen');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      setMonitors(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };
  const fetchHeadphones = async () => {
    try {
      const response = await fetch('/api/clients/headphones');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      setHeadphones(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };





  const fetchClients = async () => {
    try {
      const response = await fetch('/api/reverse/submit-form');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  

  const fetchCounters = async () => {
    try {
      const response = await fetch('/api/reverse/get-counters');
      if (!response.ok) {
        throw new Error('Failed to fetch counters');
      }
      const data = await response.json();
      setCounters(data);
    } catch (error) {
      console.error('Error fetching counters:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (name === 'mouse' || name === 'keyboard') {
        setReverseData(prevData => ({
          ...prevData,
          [name]: checked ? 'yes' : 'no'
        }));
      } else {
        setReverseData(prevData => ({
          ...prevData,
          [name]: checked
        }));
      }
    } else {
      setReverseData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleDelete = async (filename) => {
    try {
      const response = await fetch(`/api/reverse/delete?filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete file (${response.status})`);
      }

      fetchDocuments();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

 


const handleReturned = async (client) => {
  try {
    const counterUpdates = {
      monitor: client.monitor ? -1 : 0,
      headphones: client.headphones ? -1 : 0,
      mouse: client.mouse === 'Da' ? -1 : 0,
      keyboard: client.keyboard === 'Da' ? -1 : 0,
      computer: 0,
      laptop: 0,
    };

    // Adjust counter updates based on 'wks' value
    if (client.wks.startsWith('OCS-WKS')) {
      counterUpdates.computer -= 1;
    } else if (client.wks.startsWith('OCS-LAP')) {
      counterUpdates.laptop -= 1;
    }

    const response = await fetch('/api/reverse/update-counters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(counterUpdates),
    });

    if (!response.ok) {
      throw new Error('Failed to update counters');
    }

    // Update returned status
    const returnResponse = await fetch('/api/reverse/update-returned', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId: client._id }),
    });

    if (!returnResponse.ok) {
      throw new Error('Failed to update returned status');
    }

    fetchCounters();
    fetchClients()
  } catch (error) {
    console.error('Error updating counters or returned status:', error);
  }
};







  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = {
        candidateName: reverseData.candidateName,
        lastName: reverseData.lastName,
        wks: reverseData.wks,
        computer: reverseData.computer,
        computerSerial: reverseData.computerSerial,
        monitorChecked: reverseData.monitorChecked,
        monitor: reverseData.monitor === reverseData.monitor ? reverseData.monitor : 'Ne',
        monitorSerial: reverseData.monitorSerial,
        headphonesChecked: reverseData.headphonesChecked,
        headphones: reverseData.headphones === reverseData.headphones ? reverseData.headphones : 'Ne',
        mouse: reverseData.mouse === 'yes' ? 'Da' : 'Ne',
        keyboard: reverseData.keyboard === 'yes' ? 'Da' : 'Ne',
        date: new Date().toLocaleDateString('en-GB'),
        documentName: `${reverseData.candidateName} ${reverseData.lastName}-reverse.docx`,
      };

      const response = await fetch('/api/reverse/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save form data (${response.status})`);
      }

      const data = await response.json(); 

      setClients(prevClients => [...prevClients, data]);
      fetchClients();

      const templatePath = '/1.docx';
      const templateResponse = await fetch(templatePath);
      if (!templateResponse.ok) {
        throw new Error(`Failed to fetch template file (${templateResponse.status})`);
      }
      const templateBlob = await templateResponse.blob();

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const content = reader.result;
          const zip = new PizZip(content);
          const doc = new Docxtemplater(zip);

          doc.setData(formData);
          doc.render();
          const generatedBlob = doc.getZip().generate({ type: 'blob' });

          const uploadFormData = new FormData();
          uploadFormData.append('file', new File([generatedBlob], formData.documentName));
          uploadFormData.append('candidateName', reverseData.candidateName);
          uploadFormData.append('lastName', reverseData.lastName);
          

          const uploadResponse = await fetch('/api/reverse/upload', {
            method: 'POST',
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file (${uploadResponse.status})`);
          }

          const uploadData = await uploadResponse.json(); 

          saveAs(generatedBlob, formData.documentName);
          

          setReverseData({
            candidateName: '',
            lastName: '',
            wks: '',
            computer: '',
            computerSerial: '',
            monitorChecked: false,
            monitor: '',
            monitorSerial: '',
            headphonesChecked: false,
            headphones: '',
            mouse: 'no',
            keyboard: 'no',
          });

          const counterUpdates = {
            monitor: formData.monitor ? 1 : 0,
            headphones: formData.headphones ? 1 : 0,
            mouse: formData.mouse === 'Da' ? 1 : 0,
            keyboard: formData.keyboard === 'Da' ? 1 : 0,
            computer: 0,
          laptop: 0,
          };
          if (reverseData.wks.startsWith('OCS-WKS')) {
            counterUpdates.computer += 1;
          } else if (reverseData.wks.startsWith('OCS-LAP')) {
            counterUpdates.laptop += 1;
          }
          const counterResponse = await fetch('/api/reverse/update-counters', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(counterUpdates),
          });
      
          if (!counterResponse.ok) {
            throw new Error('Failed to update counters');
          }
      
          fetchCounters();
      
        } catch (error) {
          console.error('Error submitting form:', error);
        }
      };
      reader.readAsBinaryString(templateBlob);

    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const filteredDocuments = documents.filter(document =>
    document.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="holder-docx">
        <div className="left-docx">
          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="candidateName">Candidate Name</label>
              <input
                type="text"
                id="candidateName"
                name="candidateName"
                value={reverseData.candidateName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={reverseData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            

            <div className="form-group">
              <label htmlFor="computer">Computer</label>
              <select
                id="computer"
                name="computer"
                value={reverseData.computer}
                onChange={handleChange}
              >
                <option value="">Select a computer</option>
                {computers.map((computer, index) => (
                  <option key={index} value={computer.pc}>
                    {computer.pc}
                  </option>
                ))}
              </select>

            </div>
            <div className="form-group">
              <label htmlFor="wks">WKS</label>
              <input
                type="text"
                id="wks"
                name="wks"
                value={reverseData.wks}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="computerSerial">Computer Serial</label>
              <input
                type="text"
                id="computerSerial"
                name="computerSerial"
                value={reverseData.computerSerial}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="monitorChecked">
                <input
                  type="checkbox"
                  id="monitorChecked"
                  name="monitorChecked"
                  checked={reverseData.monitorChecked}
                  onChange={handleChange}
                />
                Monitor
              </label>
            </div>

            {reverseData.monitorChecked && (
              <>
                <div className="form-group">
                  <label htmlFor="monitor">Monitor</label>
                  <select
                    id="monitor"
                    name="monitor"
                    value={reverseData.monitor}
                    onChange={handleChange}
                  >
                    <option value="">Select a monitor</option>
                    {monitors.map((monitor, index) => (
                      <option key={index} value={monitor.screen}>
                        {monitor.screen}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="monitorSerial">Monitor Serial</label>
                  <input
                    type="text"
                    id="monitorSerial"
                    name="monitorSerial"
                    value={reverseData.monitorSerial}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="headphonesChecked">
                <input
                  type="checkbox"
                  id="headphonesChecked"
                  name="headphonesChecked"
                  checked={reverseData.headphonesChecked}
                  onChange={handleChange}
                />
                Headphones
              </label>
            </div>

            {reverseData.headphonesChecked && (
              <div className="form-group">
                <label htmlFor="headphones">Headphones</label>
                <select
                  id="headphones"
                  name="headphones"
                  value={reverseData.headphones}
                  onChange={handleChange}
                >
                  <option value="">Select headphones</option>
                  {headphones.map((headphones, index) => (
                    <option key={index} value={headphones.headphone}>
                      {headphones.headphone}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="mouse">
                <input
                  type="checkbox"
                  id="mouse"
                  name="mouse"
                  checked={reverseData.mouse === 'yes'}
                  onChange={handleChange}
                />
                Mouse
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="keyboard">
                <input
                  type="checkbox"
                  id="keyboard"
                  name="keyboard"
                  checked={reverseData.keyboard === 'yes'}
                  onChange={handleChange}
                />
                Keyboard
              </label>
            </div>
            <div> <h5>Date: {new Date().toLocaleDateString('en-GB')}</h5></div>

            <button type="submit">Generate Document</button>
          </form>
        </div>

        

        
<div className="right-docx">
        <div>
          <h2>Client List</h2>
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ClientList clients={filteredClients} onReturned={handleReturned} />
        </div></div>
        <div className="extra-docx">
        <div>
          <h2>Counters</h2>
          <ul>
            <li>Computers: {counters.computer}</li>
            <li>Laptop: {counters.laptop}</li>
            <li>Monitors: {counters.monitor}</li>
            <li>Headphones: {counters.headphones}</li>
            <li>Mice: {counters.mouse}</li>
            <li>Keyboards: {counters.keyboard}</li>
          </ul>
        </div>
</div>
      </div>

      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <h2>Document Preview</h2>
            <div dangerouslySetInnerHTML={{ __html: previewContent }} /> 
          </Modal>

       <div id="modal-root"></div>
    </Layout>
  );
}

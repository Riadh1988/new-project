import Layout from '../../components/Layout';
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import CustomTable from '../../components/CustomTable';
import Modal from '../../components/Modal';
import { CSVLink } from 'react-csv';
 import { useSession } from 'next-auth/react';
 import { useRouter } from 'next/router';
export default function Recrutement() {
  const [languages, setLanguages] = useState([]);
  const [candidatures, setCandidatures] = useState([]);
  const [clients, setClients] = useState([]);
  const router = useRouter();
  const [formData, setFormData] = useState({
    candidateName: '',
    phone: '',
    email: '',
    language: '',
    clientToAssign: '',
    interviewDateTime: '',
    clientDecision: 'Pending',
    declineReason: '',
    declineComment: '',
    rescheduleDateTime: '',
  });

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load

    if (!session) {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  const [search, setSearch] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editCandidature, setEditCandidature] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsResponse, candidaturesResponse, languagesResponse] = await Promise.all([
          axios.get('/api/clients'),
          axios.get('/api/candidature'),
          axios.get('/api/clients/langues') 
        ]);
  
        setClients(clientsResponse.data);
        setCandidatures(candidaturesResponse.data);
        setLanguages(languagesResponse.data); 
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);
  
   
  
  const mapCandidaturesWithClients = useMemo(() => {
    return candidatures.map(candidature => {
      const clientToAssignID = typeof candidature.clientToAssign === 'object'
        ? candidature.clientToAssign._id
        : candidature.clientToAssign;

      const client = clients.find(client => client._id === clientToAssignID);
      const clientName = client ? client.client : '';

      return {
        ...candidature,
        clientToAssign: clientName
      };
    });
  }, [candidatures, clients]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCandidature) {
        await axios.put(`/api/candidature/${editCandidature._id}`, formData);
      } else {
        await axios.post('/api/candidature', formData);
      }

      setFormData({
        candidateName: '',
        phone: '',
        email: '',
        language: '',
        clientToAssign: '',
        interviewDateTime: '',
        clientDecision: 'Pending',
        declineReason: '',
        declineComment: '',
        rescheduleDateTime: '',
      });
      setShowModal(false);
      setEditCandidature(null);

      const candidaturesResponse = await axios.get('/api/candidature');
      setCandidatures(candidaturesResponse.data);
    } catch (error) {
      console.error('Error submitting candidature:', error);
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      await axios.put(`/api/candidature/${id}`, updatedData);
      const candidaturesResponse = await axios.get('/api/candidature');
      setCandidatures(candidaturesResponse.data);
    } catch (error) {
      console.error('Error updating candidature:', error);
    }
  };

  const handleStatusChange = async (id, decision) => {
    try {
      await axios.put(`/api/candidature/${id}`, { clientDecision: decision });
      const candidaturesResponse = await axios.get('/api/candidature');
      setCandidatures(candidaturesResponse.data);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/candidature/${id}`);
      const candidaturesResponse = await axios.get('/api/candidature');
      setCandidatures(candidaturesResponse.data);
    } catch (error) {
      console.error('Error deleting candidature:', error);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setEmailFilter('');
    setPhoneFilter('');
    setFilterClient('');
    setFilterStatus('');
    setFilterLanguage('');
  };

  const formatDate = (date) => {
    if (!date) return '--';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '--';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} at ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  

  const filteredCandidatures = useMemo(() => {
    let filtered = mapCandidaturesWithClients;
    if (filterClient) {
      filtered = filtered.filter(c => c.clientToAssign && c.clientToAssign === filterClient);
    }
    if (emailFilter) {
      filtered = filtered.filter(c => c.email && c.email.toLowerCase().includes(emailFilter.toLowerCase()));
    }
    if (phoneFilter) {
      filtered = filtered.filter(c => c.phone && c.phone.includes(phoneFilter));
    }
    if (search) {
      filtered = filtered.filter(c => c.candidateName && c.candidateName.toLowerCase().includes(search.toLowerCase()));
    }
    if (filterStatus) {
      filtered = filtered.filter(c => c.clientDecision === filterStatus);
    }
    if (filterLanguage) {
      filtered = filtered.filter(c => c.language === filterLanguage);
    }
    return filtered;
  }, [mapCandidaturesWithClients, filterClient, emailFilter, phoneFilter, search, filterStatus, filterLanguage]);

  const prepareDataForExport = (data) => {
    return data.map(item => ({
      _id: item._id || '--',
      candidateName: item.candidateName || '--',
      phone: item.phone || '--',
      email: item.email || '--',
      language: item.language || '--',
      clientToAssign: item.clientToAssign || '--',
      interviewDateTime: formatDate(item.interviewDateTime),
      clientDecision: item.clientDecision || '--',
      declineComment: item.declineComment || '--',
      declineReason: item.declineReason || '--',
      rescheduleDateTime: formatDate(item.rescheduleDateTime),
    }));
  };

  const columns = useMemo(() => [
    { Header: 'Candidate Name', accessor: 'candidateName' },
    { Header: 'Phone', accessor: 'phone' },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Language', accessor: 'language' },
    { Header: 'Client', accessor: 'clientToAssign' },
    { Header: 'Interview Date', accessor: 'interviewDateTime' },
    { Header: 'Status', accessor: 'clientDecision' },
  ], []);

  const openEditModal = (candidature) => {
    const clientToAssign = clients.find(client => client.client === candidature.clientToAssign)?._id || '';
  
    setFormData({
      candidateName: candidature.candidateName || '',
      phone: candidature.phone || '',
      email: candidature.email || '',
      language: candidature.language || '',
      clientToAssign: clientToAssign,
      interviewDateTime: candidature.interviewDateTime || '',
      clientDecision: candidature.clientDecision || 'Pending',
      declineReason: candidature.declineReason || '',
      declineComment: candidature.declineComment || '',
      rescheduleDateTime: candidature.rescheduleDateTime || '',
    });
  
    setEditCandidature(candidature);
    setShowModal(true);
  };

  return (
    <Layout clients={clients}> 
      <div> 
        <div className='add-'>
        <div className='add-cnd'> 
        <div>
          <button onClick={() => { setShowModal(true); setEditCandidature(null); }}>Add Candidature</button>
          <Modal show={showModal} onClose={() => setShowModal(false)}>
            <h2>{editCandidature ? 'Edit Candidature' : 'Add Candidature'}</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" name="candidateName" placeholder="Candidate Name" onChange={handleChange} value={formData.candidateName} required />
              <input type="text" name="phone" placeholder="Phone" onChange={handleChange} value={formData.phone} required />
              <input type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} required />
              <select name="language" onChange={handleChange} value={formData.language} required>
                <option value="">Select Language</option>
                {languages.map(lang => (
                  <option key={lang._id} value={lang.language}>{lang.language}</option>
                ))}
              </select>
              <select name="clientToAssign" onChange={handleChange} value={formData.clientToAssign} required>
                <option value="">Select Client to Assign</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>{client.client}</option>
                ))}
              </select>
              <input
                  type="datetime-local"
                  name="interviewDateTime"
                  onChange={handleChange}
                  value={formData.interviewDateTime ? new Date(formData.interviewDateTime).toISOString().slice(0, -1) : ''} // Handle invalid date
                  required
                />c
              <button type="submit">Save</button>
            </form>
          </Modal>
        </div>
</div>
<div className='add--'>
        <div>
          <input type="text" placeholder="Search by Name" value={search} onChange={(e) => setSearch(e.target.value)} />
          {showMoreFilters && (
            <>
              <input type="text" placeholder="Filter by Email" value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)} />
              <input type="text" placeholder="Filter by Phone" value={phoneFilter} onChange={(e) => setPhoneFilter(e.target.value)} />
              <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
                <option value="">Filter by Client</option>
                {clients.map(client => (
                  <option key={client._id} value={client.client}>{client.client}</option>
                ))}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Filter by Status</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Refused">Refused</option>
                <option value="Missed Interview">Missed Interview</option>
              </select>
              <select value={filterLanguage} onChange={(e) => setFilterLanguage(e.target.value)}>
                <option value="">Filter by Language</option>
                {languages.map(lang => (
                  <option key={lang._id} value={lang.language}>{lang.language}</option>
                ))}
              </select>
            </>
          )}
          <button onClick={() => setShowMoreFilters(!showMoreFilters)}>
            {showMoreFilters ? 'Show Fewer Filters' : 'More Filters'}
          </button>
          <button onClick={handleResetFilters}>Reset Filters</button>
          <CSVLink
          data={prepareDataForExport(filteredCandidatures)}
          filename="candidatures.csv"
          className='csv'
        >
          Export to CSV 
        </CSVLink>
        </div>
        <CustomTable
          columns={columns}
          data={filteredCandidatures}
          clients={clients}
          handleStatusChange={handleStatusChange}
          handleUpdate={handleUpdate}
          handleDelete={handleDelete}
          onEdit={openEditModal}
          languages={languages}
        />
        
      </div></div></div>
      <div id="modal-root"></div>
    </Layout>
  );
}

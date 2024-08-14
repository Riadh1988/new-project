import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaSave, FaTimes } from 'react-icons/fa';

export default function ClientPage() {
  const [client, setClient] = useState('');
  const [clients, setClients] = useState([]);
  const [headphone, setHeadphone] = useState('');
  const [headphones, setHeadphones] = useState([]);
  const [pc, setPc] = useState('');
  const [pcs, setPcs] = useState([]);
  const [screen, setScreen] = useState('');
  const [screens, setScreens] = useState([]);
  const [language, setLanguage] = useState('');
  const [languages, setLanguages] = useState([]);

  const [editingHeadphoneId, setEditingHeadphoneId] = useState(null);
  const [editingHeadphone, setEditingHeadphone] = useState('');
  const [editingPcId, setEditingPcId] = useState(null);
  const [editingPc, setEditingPc] = useState('');
  const [editingScreenId, setEditingScreenId] = useState(null);
  const [editingScreen, setEditingScreen] = useState('');
  const [editingLanguageId, setEditingLanguageId] = useState(null);
  const [editingLanguage, setEditingLanguage] = useState('');
  const [editingClientId, setEditingClientId] = useState(null);
  const [editingClient, setEditingClient] = useState('');

  useEffect(() => {
    fetchClients();
    fetchHeadphones();
    fetchPcs();
    fetchScreens();
    fetchLanguages();
  }, []);

  async function fetchClients() {
    try {
      const response = await axios.get('/api/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error.response?.data || error.message);
    }
  }
  async function fetchClients() {
    try {
      const response = await axios.get('/api/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error.response?.data || error.message);
    }
  }

  async function createClient(ev) {
    ev.preventDefault();
    try {
      const response = await axios.post('/api/clients', { client });
      console.log('Client added:', response.data);
      setClient(''); // Clear the input after successful submission
      fetchClients(); // Refresh the list of clients
    } catch (error) {
      console.error('Error adding client:', error.response?.data || error.message);
    }
  }

  async function deleteClient(id) {
    try {
      await axios.delete(`/api/clients/${id}`);
      console.log('Client deleted');
      fetchClients(); // Refresh the list of clients
    } catch (error) {
      console.error('Error deleting client:', error.response?.data || error.message);
    }
  }

  async function editClient(ev) {
    ev.preventDefault();
    try {
      await axios.put(`/api/clients/${editingClientId}`, { client: editingClient });
      console.log('Client updated');
      setEditingClientId(null);
      setEditingClient('');
      fetchClients(); // Refresh the list of clients
    } catch (error) {
      console.error('Error updating client:', error.response?.data || error.message);
    }
  }
  async function fetchHeadphones() {
    try {
      const response = await axios.get('/api/clients/headphones');
      setHeadphones(response.data);
    } catch (error) {
      console.error('Error fetching headphones:', error.response?.data || error.message);
    }
  }

  async function fetchPcs() {
    try {
      const response = await axios.get('/api/clients/pc');
      setPcs(response.data);
    } catch (error) {
      console.error('Error fetching pcs:', error.response?.data || error.message);
    }
  }

  async function fetchScreens() {
    try {
      const response = await axios.get('/api/clients/screen');
      setScreens(response.data);
    } catch (error) {
      console.error('Error fetching pcs:', error.response?.data || error.message);
    }
  }

  async function fetchLanguages() {
    try {
      const response = await axios.get('/api/clients/langues');
      setLanguages(response.data);
    } catch (error) {
      console.error('Error fetching languages:', error.response?.data || error.message);
    }
  }

  async function createHeadphone(ev) {
    ev.preventDefault();
    try {
      await axios.post('/api/clients/headphones', { headphone });
      setHeadphone('');
      fetchHeadphones();
    } catch (error) {
      console.error('Error adding headphone:', error.response?.data || error.message);
    }
  }

  async function editHeadphone(ev) {
    ev.preventDefault();
    try {
      await axios.put(`/api/clients/headphones/${editingHeadphoneId}`, { headphone: editingHeadphone });
      setEditingHeadphoneId(null);
      setEditingHeadphone('');
      fetchHeadphones();
    } catch (error) {
      console.error('Error updating headphone:', error.response?.data || error.message);
    }
  }

  async function deleteHeadphone(id) {
    try {
      await axios.delete(`/api/clients/headphones/${id}`);
      fetchHeadphones();
    } catch (error) {
      console.error('Error deleting headphone:', error.response?.data || error.message);
    }
  }

  async function createPc(ev) {
    ev.preventDefault();
    try {
      await axios.post('/api/clients/pc', { pc });
      setPc('');
      fetchPcs();
    } catch (error) {
      console.error('Error adding pc:', error.response?.data || error.message);
    }
  }

  async function createScreen(ev) {
    ev.preventDefault();
    try {
      await axios.post('/api/clients/screen', { screen });
      setScreen('');
      fetchScreens();
    } catch (error) {
      console.error('Error adding pc:', error.response?.data || error.message);
    }
  }

  async function editPc(ev) {
    ev.preventDefault();
    try {
      await axios.put(`/api/clients/pc/${editingPcId}`, { pc: editingPc });
      setEditingPcId(null);
      setEditingPc('');
      fetchPcs();
    } catch (error) {
      console.error('Error updating pc:', error.response?.data || error.message);
    }
  }

  async function editScreen(ev) {
    ev.preventDefault();
    try {
      await axios.put(`/api/clients/screen/${editingPcId}`, { pc: editingPc });
      setEditingScreenId(null);
      setEditingScreen('');
      fetchScreens();
    } catch (error) {
      console.error('Error updating pc:', error.response?.data || error.message);
    }
  }

  async function deletePc(id) {
    try {
      await axios.delete(`/api/clients/pc/${id}`);
      fetchPcs();
    } catch (error) {
      console.error('Error deleting pc:', error.response?.data || error.message);
    }
  }

  async function deleteScreen(id) {
    try {
      await axios.delete(`/api/clients/screnn/${id}`);
      fetchScreens();
    } catch (error) {
      console.error('Error deleting pc:', error.response?.data || error.message);
    }
  }

  async function createLanguage(ev) {
    ev.preventDefault();
    try {
      await axios.post('/api/clients/langues', { language });
      setLanguage('');
      fetchLanguages();
    } catch (error) {
      console.error('Error adding language:', error.response?.data || error.message);
    }
  }

  async function editLanguage(ev) {
    ev.preventDefault();
    try {
      await axios.put(`/api/clients/langues/${editingLanguageId}`, { language: editingLanguage });
      setEditingLanguageId(null);
      setEditingLanguage('');
      fetchLanguages();
    } catch (error) {
      console.error('Error updating language:', error.response?.data || error.message);
    }
  }

  async function deleteLanguage(id) {
    try {
      await axios.delete(`/api/clients/langues/${id}`);
      fetchLanguages();
    } catch (error) {
      console.error('Error deleting language:', error.response?.data || error.message);
    }
  }

  return (
    <Layout>
      <div className="utile">
  <section className="clients-section">
    <h1>Clients</h1>
    <form onSubmit={createClient} className="client-form">
      <input
        type="text"
        placeholder="Add new client"
        value={client}
        onChange={(e) => setClient(e.target.value)}
        required
        className="client-input"
      />
      <button type="submit" className="add-client-button">Add Client</button>
    </form>
    <ul className="clientList">
      {clients.map((clientItem) => (
        <li key={clientItem._id} className="clientItem">
          {editingClientId === clientItem._id ? (
            <form onSubmit={editClient} className="clientForm">
              <input
                type="text"
                value={editingClient}
                onChange={(e) => setEditingClient(e.target.value)}
                required
                className="clientInput"
              />
              <button type="submit" className="saveButton">
                <FaSave />
              </button>
              <button
                type="button"
                onClick={() => setEditingClientId(null)}
                className="cancelButton"
              >
                <FaTimes />
              </button>
            </form>
          ) : (
            <>
              <span className="clientText">{clientItem.client}</span>
              <div className="buttonGroup">
                <button
                  onClick={() => {
                    setEditingClientId(clientItem._id);
                    setEditingClient(clientItem.client);
                  }}
                  className="editButton"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteClient(clientItem._id)}
                  className="deleteButton"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  </section>

  <section className="headphones-section">
    <h2>Headphones</h2>
    <form onSubmit={editingHeadphoneId ? editHeadphone : createHeadphone} className="clientForm">
      <input
        type="text"
        placeholder="Enter headphone"
        value={editingHeadphoneId ? editingHeadphone : headphone}
        onChange={(ev) => editingHeadphoneId ? setEditingHeadphone(ev.target.value) : setHeadphone(ev.target.value)}
        className="headphoneInput"
      />
      <button type="submit" className="addHeadphoneButton">
        {editingHeadphoneId ? <FaSave /> : 'Add Headphone'}
      </button>
      {editingHeadphoneId && (
        <button
          onClick={() => { setEditingHeadphoneId(null); setEditingHeadphone(''); }}
          className="cancelHeadphoneButton"
        >
          <FaTimes />
        </button>
      )}
    </form>
    <ul className="clientList">
      {headphones.map((hp) => (
        <li key={hp._id} className="clientItem">
         <span className="clientText">{hp.headphone}</span> 
          <button
            onClick={() => { setEditingHeadphoneId(hp._id); setEditingHeadphone(hp.headphone); }}
            className="editButton"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => deleteHeadphone(hp._id)}
            className="deleteButton"
          >
            <FaTrashAlt />
          </button>
        </li>
      ))}
    </ul>
  </section>

  <section className="pcs-section">
    <h2>PCs</h2>
    <form onSubmit={editingPcId ? editPc : createPc} className="clientForm">
      <input
        type="text"
        placeholder="Enter PC"
        value={editingPcId ? editingPc : pc}
        onChange={(ev) => editingPcId ? setEditingPc(ev.target.value) : setPc(ev.target.value)}
        className="pcInput"
      />
      <button type="submit" className="addPcButton">
        {editingPcId ? <FaSave /> : 'Add PC'}
      </button>
      {editingPcId && (
        <button
          onClick={() => { setEditingPcId(null); setEditingPc(''); }}
          className="cancelButton"
        >
          <FaTimes />
        </button>
      )}
    </form>
    <ul className="clientList">
      {pcs.map((pc) => (
        <li key={pc._id} className="clientItem">
          <span className="clientText">{pc.pc}</span>
          <button
            onClick={() => { setEditingPcId(pc._id); setEditingPc(pc.pc); }}
            className="editButton"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => deletePc(pc._id)}
            className="deleteButton"
          >
            <FaTrashAlt />
          </button>
        </li>
      ))}
    </ul>
  </section>.

  <section className="Screen-section">
    <h2>Screens</h2>
    <form onSubmit={editingScreenId ? editScreen : createScreen} className="clientForm">
      <input
        type="text"
        placeholder="Enter screen"
        value={editingScreenId ? editingScreen : screen}
        onChange={(ev) => editingScreenId ? setEditingScreen(ev.target.value) : setScreen(ev.target.value)}
        className="ScreenInput"
      />
      <button type="submit" className="addButton">
        {editingScreenId ? <FaSave /> : 'Add Scren'}
      </button>
      {editingScreenId && (
        <button
          onClick={() => { setEditingScreenId(null); setEditingScreen(''); }}
          className="cancelButton"
        >
          <FaTimes />
        </button>
      )}
    </form>
    <ul className="clientList">
      {screens.map((lang) => (
        <li key={lang._id} className="clientItem">
         <span className="clientText">{lang.screen}</span> 
          <button
            onClick={() => { setEditingScreenId(lang._id); setEditingLanguage(lang.screen); }}
            className="editButton"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => deleteScreen(screen._id)}
            className="deleteButton"
          >
            <FaTrashAlt />
          </button>
        </li>
      ))}
    </ul>
  </section>

  <section className="languages-section">
    <h2>Languages</h2>
    <form onSubmit={editingLanguageId ? editLanguage : createLanguage} className="clientForm">
      <input
        type="text"
        placeholder="Enter language"
        value={editingLanguageId ? editingLanguage : language}
        onChange={(ev) => editingLanguageId ? setEditingLanguage(ev.target.value) : setLanguage(ev.target.value)}
        className="languageInput"
      />
      <button type="submit" className="addButton">
        {editingLanguageId ? <FaSave /> : 'Add Language'}
      </button>
      {editingLanguageId && (
        <button
          onClick={() => { setEditingLanguageId(null); setEditingLanguage(''); }}
          className="cancelButton"
        >
          <FaTimes />
        </button>
      )}
    </form>
    <ul className="clientList">
      {languages.map((lang) => (
        <li key={lang._id} className="clientItem">
         <span className="clientText">{lang.language}</span> 
          <button
            onClick={() => { setEditingLanguageId(lang._id); setEditingLanguage(lang.language); }}
            className="editButton"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => deleteLanguage(lang._id)}
            className="deleteButton"
          >
            <FaTrashAlt />
          </button>
        </li>
      ))}
    </ul>
  </section>
</div>

    </Layout>
  );
}

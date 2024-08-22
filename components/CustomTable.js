import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 

const CustomTable = ({ columns, data, clients, handleUpdate, handleDelete, languages }) => {
  const [editingData, setEditingData] = useState({
    _id: '',
    candidateName: '',
    phone: '',
    email: '',
    language: [], // Update to array
    clientToAssign: '',
    interviewDateTime: '',
    clientDecision: '',
    declineReason: '',
    declineComment: '',
    rescheduleDateTime: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); 
  const [isSubmitting, setIsSubmitting] = useState(false); // Track if submit button is clicked
  const isEpochDate = (date) => {
    return date && new Date(date).getTime() === 0;
  };
  
  // Handle modal open
  const handleModalOpen = (candidature, mode) => {
    console.log("Language in candidature: ", candidature.language);
    setEditingData({
      _id: candidature._id,
      candidateName: candidature.candidateName || '',
      phone: candidature.phone || '',
      email: candidature.email || '',
      language: candidature.language || [], // Handle array of languages
      clientToAssign: clients.find(client => client.client === candidature.clientToAssign)?._id || '',
      interviewDateTime: candidature.interviewDateTime ? new Date(candidature.interviewDateTime) : null,
      clientDecision: candidature.clientDecision || '',
      declineReason: candidature.declineReason || '',
      declineComment: candidature.declineComment || '',
      rescheduleDateTime: candidature.rescheduleDateTime ? new Date(candidature.rescheduleDateTime) : null,
    });
    setModalMode(mode);
    setShowModal(true);
  };

  // Handle save action
  const handleSaveClick = async () => {
    setIsSubmitting(true); // Disable submit button once clicked
    try {
      const updatedData = {
        ...editingData,
        interviewDateTime: editingData.interviewDateTime ? editingData.interviewDateTime.toISOString() : '',
        rescheduleDateTime: editingData.rescheduleDateTime ? editingData.rescheduleDateTime.toISOString() : '',
      };

      await handleUpdate(editingData._id, updatedData);

      // Close the modal with a delay
      setTimeout(() => {
        setEditingData({
          _id: '',
          candidateName: '',
          phone: '',
          email: '',
          language: [],
          clientToAssign: '',
          interviewDateTime: '',
          clientDecision: '',
          declineReason: '',
          declineComment: '',
          rescheduleDateTime: '',
        });
        setShowModal(false);
        setIsSubmitting(false); // Reset the button state
      }, 500);
    } catch (error) {
      console.error('Error saving changes:', error);
      setIsSubmitting(false); // Reset the button state on error
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'language') {
      const options = e.target.options;
      const selectedLanguages = [];
      for (let i = 0, len = options.length; i < len; i++) {
        if (options[i].selected) {
          selectedLanguages.push(options[i].value);
        }
      }
      setEditingData(prev => ({ ...prev, language: selectedLanguages }));
    } else {
      setEditingData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle date changes for DatePicker
  const handleDateChange = (date, name) => {
    setEditingData(prev => ({ ...prev, [name]: date }));
  };
  const handleDownload = (url) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = url.split('/').pop(); 

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        console.log(url)
      })
      .catch(error => console.error('Error downloading file:', error));
  };
  // Handle select change for clientDecision
  const handleClientDecisionChange = (e) => {
    const value = e.target.value;
    setEditingData(prev => ({
      ...prev,
      clientDecision: value,
      declineReason: value === 'Refused' ? prev.declineReason : '',
      declineComment: value === 'Refused' ? prev.declineComment : '',
      rescheduleDateTime: value === 'Missed Interview' ? prev.rescheduleDateTime : ''
    }));
  };

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.accessor}>{column.Header}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        {data.map((row) => {
    
    const isEpoch = row.interviewDateTime == null
    return (
      <tr
        key={row._id}
        style={{
          backgroundColor: isEpoch ? 'yellow' : 'transparent'
        }}
      >
        {columns.map(column => (
  <td key={column.accessor}>
    {column.accessor === 'interviewDateTime' ? (
      isEpoch ? (
        '---'
      ) : (
        new Date(row[column.accessor]).toLocaleString()
      )
    ) : column.accessor === 'fileUrl' ? (
      <a onClick={() => handleDownload(row[column.accessor])} style={{ cursor: 'pointer', color: 'blue' }}>
        Download CV
      </a>
    ) : column.accessor === 'language' ? (
        row[column.accessor].map((language, index) => (
          <span key={index} className="lnsp">
            {language}
          </span>
        ))
      ) : column.accessor === 'clientDecision' ? (
      <span
        style={{ cursor: 'pointer', color: 'blue' }}
        onClick={() => handleModalOpen(row, 'edit')}
      >
        {row[column.accessor]}
      </span>
    ) : (
      row[column.accessor]
    )}
  </td>
))}
        <td>
          <button onClick={() => handleModalOpen(row, 'view')}>View</button>
          <button onClick={() => handleModalOpen(row, 'edit')}>Edit</button>
          <button onClick={() => handleDelete(row._id)}>Delete</button>
        </td>
      </tr>
    );
  })}
        </tbody>
      </table>

      {/* Unified Modal */}
      {showModal && (
        <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
      >
        <h2>{modalMode === 'edit' ? 'Edit Candidature' : 'View Candidature'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); modalMode === 'edit' && handleSaveClick(); }}>
          

        <input
              type="text"
              name="candidateName"
              placeholder="Candidate Name"
              onChange={handleInputChange}
              value={editingData.candidateName || ''}
              required
              disabled={modalMode === 'view'}
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              onChange={handleInputChange}
              value={editingData.phone || ''}
              required
              disabled={modalMode === 'view'}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleInputChange}
              value={editingData.email || ''}
              required
              disabled={modalMode === 'view'}
            />
          


          <select
            name="language"
            multiple
            onChange={handleInputChange}
            value={editingData.language || []}
            required
            disabled={modalMode === 'view'}
          >
            {languages.map(lang => (
              <option key={lang._id} value={lang.language}>{lang.language}</option>
            ))}
          </select>

          
            <select
              name="clientToAssign"
              onChange={handleInputChange}
              value={editingData.clientToAssign || ''}
              required
              disabled={modalMode === 'view'}
            >
              <option value="">Select Client to Assign</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>{client.client}</option>
              ))}
            </select>
          {/* Conditional interviewDateTime field based on client */}
          {editingData.clientToAssign !== 'Other' && (
            <DatePicker
              selected={editingData.interviewDateTime}
              onChange={(date) => handleDateChange(date, 'interviewDateTime')}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={30}
              dateFormat="yyyy-MM-dd HH:mm"
              name="interviewDateTime"
              placeholderText='Interview Time'
              disabled={modalMode === 'view'}
            />
          )}
          <select
              name="clientDecision"
              onChange={handleClientDecisionChange}
              value={editingData.clientDecision || ''}
              required
              disabled={modalMode === 'view'}
            >
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Refused">Refused</option>
              <option value="Missed Interview">Missed Interview</option>
            </select>
            {editingData.clientDecision === 'Refused' && (
              <>
                <select
                  name="declineReason"
                  onChange={handleInputChange}
                  value={editingData.declineReason || ''}
                  required
                  disabled={modalMode === 'view'}
                >
                  <option value="">Select Decline Reason</option>
                  <option value="No good languages">No good languages</option>
                  <option value="Not available">Not available</option>
                  <option value="Other">Other</option>
                </select>
                <textarea
                  name="declineComment"
                  placeholder="Decline Comment"
                  onChange={handleInputChange}
                  value={editingData.declineComment || ''}
                  disabled={modalMode === 'view'}
                />
              </>
            )}
            {editingData.clientDecision === 'Missed Interview' && (
              <DatePicker
                selected={editingData.rescheduleDateTime}
                onChange={(date) => handleDateChange(date, 'rescheduleDateTime')}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30} // 30-minute interval
                dateFormat="yyyy-MM-dd HH:mm"
                name="rescheduleDateTime"
                required
                disabled={modalMode === 'view'}
              />
            )}
          {modalMode === 'edit' && <button type="submit" disabled={isSubmitting}>Save</button>}
        </form>
      </Modal>
      )}
    </div>
  );
};

export default CustomTable;

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

  // Handle modal open
  const handleModalOpen = (candidature, mode) => {
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
          {data.map((row) => (
            <tr key={row._id}>
              {columns.map(column => (
                    <td key={column.accessor}>
                      {column.accessor === 'clientToAssign' ? (
                        row[column.accessor]
                      ) : column.accessor === 'interviewDateTime' ? (
                        new Date(row[column.accessor]).toLocaleString()
                      ) : column.accessor === 'fileUrl' ? (
                        <a href={row[column.accessor]} target="_blank" rel="noopener noreferrer">
                          View CV
                        </a>
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
          ))}
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
          {/* Other form fields */}
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

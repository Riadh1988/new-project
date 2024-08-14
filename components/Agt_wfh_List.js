import React, { useState } from 'react';
import Modal from './Modal'; // Ensure you have a Modal component for displaying detailed information

const ClientList = ({ clients, onReturned }) => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClientClick = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  return (
    <>
      <ul>
  {clients.map((client, index) => (
    <li key={index} className="per-li">
      <span
        onClick={() => handleClientClick(client)}
        className="client-name"
      >
        {client.candidateName} {client.lastName}
      </span>
      <div className="btn-return">
        {client.returned ? (
          <button className="returned-btn" disabled>
            Returned
          </button>
        ) : (
          <button onClick={() => onReturned(client)}>
            Mark as Returned
          </button>
        )}
      </div>
    </li>
  ))}
</ul>


      {isModalOpen && selectedClient && (
        <Modal show={isModalOpen} onClose={handleCloseModal}>
          <h2>{selectedClient.candidateName} {selectedClient.lastName}</h2> 
          <p><strong>Date:</strong> {selectedClient.date}</p>
          <p><strong>wks:</strong> {selectedClient.computer} / {selectedClient.wks} / {selectedClient.computerSerial}</p>
          {
            selectedClient.monitor ?
            <p><strong>monitor:</strong> {selectedClient.monitor} / {selectedClient.monitorSerial}</p> : <p><strong>monitor:</strong> Ne</p>
          }
           {
            selectedClient.headphones ?
            <p><strong>headphones:</strong> {selectedClient.headphones}</p> : <p><strong>headphones:</strong> Ne</p>
          }
           {
            selectedClient.mouse ?
            <p><strong>mouse:</strong> {selectedClient.mouse}</p> : <p><strong>mouse:</strong> Ne</p>
          }
           {
            selectedClient.keyboard ?
            <p><strong>keyboard:</strong> {selectedClient.keyboard}</p> : <p><strong>keyboard:</strong> Ne</p>
          }
          {selectedClient.returned && <p><strong>Items returned</strong></p>}
          <button onClick={handleCloseModal}>Close</button>
        </Modal>
      )}
    </>
  );
};

export default ClientList;

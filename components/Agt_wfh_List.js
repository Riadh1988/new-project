import React, { useState } from 'react';
import Modal from './Modal';  

const ClientList = ({ clients, onReturned }) => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [isReturnPopupOpen, setIsReturnPopupOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClientClick = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {

    setIsModalOpen(false);
    setSelectedClient(null);
  };

  const handleReturnClick = () => {
    setLoading(true);
    setIsProcessing(true);

    // Simulate processing time
    setTimeout(() => {
      onReturned(selectedClient);
      setIsProcessing(false);
      setLoading(true);
      setIsDone(true);
       
      // Automatically close the popup after 1.5 seconds
      setTimeout(() => {
        setIsReturnPopupOpen(false);
        setIsDone(false);
        setSelectedClient(null);
      }, 1500);
    }, 2000); // Simulate a 2-second delay for processing
  };

  const handleOpenReturnPopup = (client) => {
    setSelectedClient(client);
    setIsReturnPopupOpen(true);
  };

  const handleCloseReturnPopup = () => {
    setIsReturnPopupOpen(false);
    setSelectedClient(null);
    setIsDone(false);
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
                <button onClick={() => handleOpenReturnPopup(client)}>
                  Mark as Returned
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Modal for displaying client details */}
      {isModalOpen && selectedClient && (
        <Modal show={isModalOpen} onClose={handleCloseModal}>
          <div className='mod-r'>
            <h2 className='returned-h'>
              {selectedClient.candidateName} {selectedClient.lastName} <span>{selectedClient.returned && <strong>Items returned</strong>}</span>
            </h2> 
            <p><strong>Date:</strong> {selectedClient.date}</p>
            <p><strong>WKS:</strong> {selectedClient.computer} / {selectedClient.wks} / {selectedClient.computerSerial}</p>
            {selectedClient.monitor ? (
              <p><strong>Monitor:</strong> {selectedClient.monitor} / {selectedClient.monitorSerial}</p>
            ) : (
              <p><strong>Monitor:</strong> Ne</p>
            )}
            {selectedClient.headphones ? (
              <p><strong>Headphones:</strong> {selectedClient.headphones}</p>
            ) : (
              <p><strong>Headphones:</strong> Ne</p>
            )}
            {selectedClient.mouse ? (
              <p><strong>Mouse:</strong> {selectedClient.mouse}</p>
            ) : (
              <p><strong>Mouse:</strong> Ne</p>
            )}
            {selectedClient.keyboard ? (
              <p><strong>Keyboard:</strong> {selectedClient.keyboard}</p>
            ) : (
              <p><strong>Keyboard:</strong> Ne</p>
            )}
            <button onClick={handleCloseModal} className='CLOSE'>Close</button>
          </div>
        </Modal>
      )}

      {/* Modal for marking as returned */}
      {isReturnPopupOpen && selectedClient && (
        <Modal show={isReturnPopupOpen} onClose={handleCloseReturnPopup}>
          <div className='mod-return'>
            {isDone ? <div className='mod-rr'><h2>Done!</h2></div> : 
            
            <div className='mod-r'>
              {loading && 
              <div className="loader-container">
              <div className="loader"></div>
              <style jsx>{`
                .loader-container {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  background: rgba(255, 255, 255, 0.8);
                  z-index: 1000;
                }
                .loader {
                  border: 16px solid #f3f3f3;
                  border-top: 16px solid #3498db;
                  border-radius: 50%;
                  width: 120px;
                  height: 120px;
                  animation: spin 2s linear infinite;
                }
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
              }
            <h2>
              {selectedClient.candidateName} {selectedClient.lastName}
            </h2> 
            <p><strong>WKS:</strong> {selectedClient.computer} / {selectedClient.wks} / {selectedClient.computerSerial}</p>
            {selectedClient.monitor ? (
              <p><strong>Monitor:</strong> {selectedClient.monitor} / {selectedClient.monitorSerial}</p>
            ) : (
              <p><strong>Monitor:</strong> Ne</p>
            )}
            {selectedClient.headphones ? (
              <p><strong>Headphones:</strong> {selectedClient.headphones}</p>
            ) : (
              <p><strong>Headphones:</strong> Ne</p>
            )}
            {selectedClient.mouse ? (
              <p><strong>Mouse:</strong> {selectedClient.mouse}</p>
            ) : (
              <p><strong>Mouse:</strong> Ne</p>
            )}
            {selectedClient.keyboard ? (
              <p><strong>Keyboard:</strong> {selectedClient.keyboard}</p>
            ) : (
              <p><strong>Keyboard:</strong> Ne</p>
            )} 
          </div>
            
            }

            {isProcessing && <div className="loader"></div>}
            {!isDone && !isProcessing && (
              <div className='buttons-ret'>
              <button onClick={handleReturnClick} className='mark-as-returned'>
                Mark as Returned
              </button>
              <button onClick={handleCloseModal} className='CLOSE red'>Close</button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

export default ClientList;

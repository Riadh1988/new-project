// components/Modal.js
import React from 'react';
import ReactDOM from 'react-dom';

const Modal = ({ show, onClose, children }) => {
   
  if (!show) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    console.error('No element with id "modal-root" found in the DOM');
    return null;
  }
  return ReactDOM.createPortal(
    <div className="modalOverlay">
      <div className="modalContent" >
        <button className="closeButton" onClick={onClose}>X</button>
        {children}
      </div>
    </div>,
    modalRoot  
  );
};

export default Modal;
